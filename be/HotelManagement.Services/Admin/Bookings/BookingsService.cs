using HotelManagement.Domain;
using HotelManagement.Domain.Repositories;
using HotelManagement.Repository.Common;
using HotelManagement.Services.Admin.Bookings.Dtos;
using HotelManagement.Services.Common;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Services.Admin.Bookings;

public class BookingsService : IBookingsService
{
    private readonly IRepository<Booking> _bookingRepo;
    private readonly IRepository<BookingRoomType> _bookingRoomTypeRepo;
    private readonly IRepository<BookingRoom> _bookingRoomRepo;
    private readonly IRepository<BookingGuest> _bookingGuestRepo;
    private readonly IRepository<Hotel> _hotelRepo;
    private readonly IRepository<Guest> _guestRepo;
    private readonly IRepository<HotelRoom> _roomRepo;
    private readonly IRepository<RoomType> _roomTypeRepo;
    private readonly IRepository<CallLog> _callLogRepo;
    private readonly IUnitOfWork _uow;

    public BookingsService(
        IRepository<Booking> bookingRepo,
        IRepository<BookingRoomType> bookingRoomTypeRepo,
        IRepository<BookingRoom> bookingRoomRepo,
        IRepository<BookingGuest> bookingGuestRepo,
        IRepository<Hotel> hotelRepo,
        IRepository<Guest> guestRepo,
        IRepository<HotelRoom> roomRepo,
        IRepository<RoomType> roomTypeRepo,
        IRepository<CallLog> callLogRepo,
        IUnitOfWork uow)
    {
        _bookingRepo = bookingRepo;
        _bookingRoomTypeRepo = bookingRoomTypeRepo;
        _bookingRoomRepo = bookingRoomRepo;
        _bookingGuestRepo = bookingGuestRepo;
        _hotelRepo = hotelRepo;
        _guestRepo = guestRepo;
        _roomRepo = roomRepo;
        _roomTypeRepo = roomTypeRepo;
        _callLogRepo = callLogRepo;
        _uow = uow;
    }

    public async Task<ApiResponse<BookingDetailsDto>> CreateAsync(CreateBookingDto dto)
    {
        try
        {
            var hotel = await _hotelRepo.FindAsync(dto.HotelId);
            if (hotel == null) return ApiResponse<BookingDetailsDto>.Fail("Hotel not found");

            if (dto.RoomTypes == null || dto.RoomTypes.Count == 0)
                return ApiResponse<BookingDetailsDto>.Fail("At least one room type is required");

            // Create primary guest
            var primaryGuest = new Guest
            {
                Id = Guid.NewGuid(),
                FullName = dto.PrimaryGuest.Fullname,
                Phone = dto.PrimaryGuest.Phone ?? string.Empty,
                Email = dto.PrimaryGuest.Email
            };
            await _guestRepo.AddAsync(primaryGuest);

            await _uow.BeginTransactionAsync();

            var booking = new Booking
            {
                Id = Guid.NewGuid(),
                HotelId = dto.HotelId,
                PrimaryGuestId = primaryGuest.Id,
                Status = BookingStatus.Pending,
                DepositAmount = dto.Deposit,
                DiscountAmount = dto.Discount,
                TotalAmount = 0,
                LeftAmount = 0,
                CreatedAt = DateTime.UtcNow
            };
            await _bookingRepo.AddAsync(booking);

            decimal total = 0m;

            foreach (var rt in dto.RoomTypes)
            {
                var roomType = await _roomTypeRepo.Query().FirstOrDefaultAsync(x => x.Id == rt.RoomTypeId && x.HotelId == dto.HotelId);
                if (roomType == null)
                {
                    await _uow.RollbackTransactionAsync();
                    return ApiResponse<BookingDetailsDto>.Fail("Room type not found in hotel");
                }

                var brt = new BookingRoomType
                {
                    BookingRoomTypeId = Guid.NewGuid(),
                    BookingId = booking.Id,
                    RoomTypeId = rt.RoomTypeId,
                    RoomTypeName = roomType.Name,
                    Capacity = rt.Capacity ?? roomType.Capacity,
                    Price = rt.Price ?? roomType.BasePriceFrom,
                    TotalRoom = rt.Rooms?.Count ?? 0
                };
                await _bookingRoomTypeRepo.AddAsync(brt);

                if (rt.Rooms == null || rt.Rooms.Count == 0)
                {
                    await _uow.RollbackTransactionAsync();
                    return ApiResponse<BookingDetailsDto>.Fail("Each room type must include rooms");
                }

                foreach (var r in rt.Rooms)
                {
                    if (r.StartDate.Date >= r.EndDate.Date)
                    {
                        await _uow.RollbackTransactionAsync();
                        return ApiResponse<BookingDetailsDto>.Fail("Invalid date range for room");
                    }

                    var room = await _roomRepo.Query().FirstOrDefaultAsync(x => x.Id == r.RoomId && x.HotelId == dto.HotelId && x.RoomTypeId == rt.RoomTypeId);
                    if (room == null)
                    {
                        await _uow.RollbackTransactionAsync();
                        return ApiResponse<BookingDetailsDto>.Fail("Room not found in hotel or mismatched room type");
                    }

                    // Check availability (no overlapping confirmed/pending bookings)
                    var overlap = await _bookingRoomRepo.Query()
                        .Where(br => br.RoomId == r.RoomId && br.BookingStatus != BookingRoomStatus.Cancelled)
                        .AnyAsync(br => r.StartDate < br.EndDate && r.EndDate > br.StartDate);
                    if (overlap)
                    {
                        await _uow.RollbackTransactionAsync();
                        return ApiResponse<BookingDetailsDto>.Fail($"Room {room.Number} is not available for selected dates");
                    }

                    var bookingRoom = new BookingRoom
                    {
                        BookingRoomId = Guid.NewGuid(),
                        RoomId = r.RoomId,
                        BookingRoomTypeId = brt.BookingRoomTypeId,
                        RoomName = room.Number,
                        StartDate = r.StartDate,
                        EndDate = r.EndDate,
                        BookingStatus = BookingRoomStatus.Pending
                    };
                    await _bookingRoomRepo.AddAsync(bookingRoom);

                    // Guests per room (optional), also link primary guest to first room of first type
                    var guests = r.Guests ?? new List<CreateBookingRoomGuestDto>();
                    if (!guests.Any())
                    {
                        // Attach primary guest by default
                        await _bookingGuestRepo.AddAsync(new BookingGuest
                        {
                            BookingRoomId = bookingRoom.BookingRoomId,
                            GuestId = primaryGuest.Id
                        });
                    }
                    else
                    {
                        foreach (var g in guests)
                        {
                            Guid gid = g.GuestId ?? Guid.Empty;
                            if (gid == Guid.Empty)
                            {
                                var newG = new Guest
                                {
                                    Id = Guid.NewGuid(),
                                    FullName = g.Fullname ?? string.Empty,
                                    Phone = g.Phone ?? string.Empty,
                                    Email = g.Email
                                };
                                await _guestRepo.AddAsync(newG);
                                gid = newG.Id;
                            }

                            await _bookingGuestRepo.AddAsync(new BookingGuest
                            {
                                BookingRoomId = bookingRoom.BookingRoomId,
                                GuestId = gid
                            });
                        }
                    }

                    var nights = (decimal)(bookingRoom.EndDate.Date - bookingRoom.StartDate.Date).TotalDays;
                    total += (brt.Price) * nights;
                }
            }

            booking.TotalAmount = Math.Max(0, total - booking.DiscountAmount);
            booking.LeftAmount = Math.Max(0, booking.TotalAmount - booking.DepositAmount);

            await _bookingRepo.UpdateAsync(booking);
            await _uow.CommitTransactionAsync();

            return await GetByIdAsync(booking.Id);
        }
        catch (Exception ex)
        {
            try { await _uow.RollbackTransactionAsync(); } catch {}
            return ApiResponse<BookingDetailsDto>.Fail($"Error creating booking: {ex.Message}");
        }
    }

    public async Task<ApiResponse<BookingDetailsDto>> GetByIdAsync(Guid id)
    {
        try
        {
            var b = await _bookingRepo.Query()
                .Include(b => b.BookingRoomTypes)
                .ThenInclude(brt => brt.BookingRooms)
                .Include(b => b.CallLogs)
                .FirstOrDefaultAsync(b => b.Id == id);
            if (b == null) return ApiResponse<BookingDetailsDto>.Fail("Booking not found");

            // Load guests for rooms
            var roomIds = b.BookingRoomTypes.SelectMany(rt => rt.BookingRooms.Select(r => r.BookingRoomId)).ToList();
            var guests = await _bookingGuestRepo.Query()
                .Where(bg => roomIds.Contains(bg.BookingRoomId))
                .Select(bg => new { bg.BookingRoomId, bg.GuestId })
                .ToListAsync();
            var guestIds = guests.Select(g => g.GuestId).Distinct().ToList();
            var guestDetails = await _guestRepo.Query()
                .Where(g => guestIds.Contains(g.Id))
                .Select(g => new { g.Id, g.FullName, g.Phone, g.Email })
                .ToListAsync();
            var gm = guestDetails.ToDictionary(x => x.Id, x => x);

            var dto = new BookingDetailsDto
            {
                Id = b.Id,
                HotelId = b.HotelId,
                PrimaryGuestId = b.PrimaryGuestId,
                Status = b.Status,
                DepositAmount = b.DepositAmount,
                DiscountAmount = b.DiscountAmount,
                TotalAmount = b.TotalAmount,
                LeftAmount = b.LeftAmount,
                CreatedAt = b.CreatedAt,
                BookingRoomTypes = b.BookingRoomTypes.Select(rt => new BookingRoomTypeDto
                {
                    BookingRoomTypeId = rt.BookingRoomTypeId,
                    RoomTypeId = rt.RoomTypeId,
                    RoomTypeName = rt.RoomTypeName,
                    Capacity = rt.Capacity,
                    Price = rt.Price,
                    TotalRoom = rt.TotalRoom,
                    BookingRooms = rt.BookingRooms.Select(r => new BookingRoomDto
                    {
                        BookingRoomId = r.BookingRoomId,
                        RoomId = r.RoomId,
                        RoomName = r.RoomName,
                        StartDate = r.StartDate,
                        EndDate = r.EndDate,
                        BookingStatus = r.BookingStatus,
                        Guests = guests.Where(g => g.BookingRoomId == r.BookingRoomId)
                            .Select(g =>
                            {
                                var d = gm[g.GuestId];
                                return new BookingGuestDto
                                {
                                    GuestId = d.Id,
                                    Fullname = d.FullName,
                                    Phone = d.Phone,
                                    Email = d.Email
                                };
                            }).ToList()
                    }).ToList()
                }).ToList(),
                CallLogs = b.CallLogs?.OrderByDescending(c => c.CallTime).Select(c => new CallLogDto
                {
                    Id = c.Id,
                    CallTime = c.CallTime,
                    Result = c.Result,
                    Notes = c.Notes,
                    StaffUserId = c.StaffUserId
                }).ToList() ?? new List<CallLogDto>()
            };

            return ApiResponse<BookingDetailsDto>.Ok(dto);
        }
        catch (Exception ex)
        {
            return ApiResponse<BookingDetailsDto>.Fail($"Error retrieving booking: {ex.Message}");
        }
    }

    public async Task<ApiResponse<BookingDetailsDto>> UpdateAsync(Guid id, UpdateBookingDto dto)
    {
        try
        {
            await _uow.BeginTransactionAsync();

            var booking = await _bookingRepo.Query()
                .Include(b => b.BookingRoomTypes)
                .ThenInclude(brt => brt.BookingRooms)
                .FirstOrDefaultAsync(b => b.Id == id);
            if (booking == null)
            {
                await _uow.RollbackTransactionAsync();
                return ApiResponse<BookingDetailsDto>.Fail("Booking not found");
            }

            if (dto.Deposit.HasValue)
            {
                // Refund logic if deposit reduced
                var diff = booking.DepositAmount - dto.Deposit.Value;
                if (diff > 0)
                {
                    booking.DepositAmount = dto.Deposit.Value;
                    // create a refund payment record
                    // Note: no payment service layer exists here; keep simple
                }
                else if (diff < 0)
                {
                    booking.DepositAmount = dto.Deposit.Value;
                }
            }

            if (dto.Discount.HasValue)
            {
                booking.DiscountAmount = dto.Discount.Value;
            }

            if (dto.Status.HasValue)
            {
                booking.Status = dto.Status.Value;
            }

            if (dto.RoomTypes != null)
            {
                // For simplicity: replace room types/rooms entirely
                // Validate availability and rebuild
                // Remove existing
                var existingRoomTypeIds = booking.BookingRoomTypes.Select(rt => rt.BookingRoomTypeId).ToList();
                var existingRooms = booking.BookingRoomTypes.SelectMany(rt => rt.BookingRooms).Select(r => r.BookingRoomId).ToList();

                foreach (var rId in existingRooms)
                {
                    var br = await _bookingRoomRepo.FindAsync(rId);
                    if (br != null) await _bookingRoomRepo.RemoveAsync(br);
                }
                foreach (var rtId in existingRoomTypeIds)
                {
                    var brt = await _bookingRoomTypeRepo.FindAsync(rtId);
                    if (brt != null) await _bookingRoomTypeRepo.RemoveAsync(brt);
                }

                decimal total = 0m;
                foreach (var rt in dto.RoomTypes)
                {
                    var roomType = await _roomTypeRepo.FindAsync(rt.RoomTypeId);
                    if (roomType == null || roomType.HotelId != booking.HotelId)
                    {
                        await _uow.RollbackTransactionAsync();
                        return ApiResponse<BookingDetailsDto>.Fail("Room type invalid for hotel");
                    }

                    var brt = new BookingRoomType
                    {
                        BookingRoomTypeId = Guid.NewGuid(),
                        BookingId = booking.Id,
                        RoomTypeId = rt.RoomTypeId,
                        RoomTypeName = roomType.Name,
                        Capacity = rt.Capacity ?? roomType.Capacity,
                        Price = rt.Price ?? roomType.BasePriceFrom,
                        TotalRoom = rt.Rooms?.Count ?? 0
                    };
                    await _bookingRoomTypeRepo.AddAsync(brt);

                    if (rt.Rooms == null || rt.Rooms.Count == 0)
                    {
                        await _uow.RollbackTransactionAsync();
                        return ApiResponse<BookingDetailsDto>.Fail("Each room type must include rooms");
                    }

                    foreach (var r in rt.Rooms)
                    {
                        if (r.StartDate.Date >= r.EndDate.Date)
                        {
                            await _uow.RollbackTransactionAsync();
                            return ApiResponse<BookingDetailsDto>.Fail("Invalid date range for room");
                        }

                        var room = await _roomRepo.Query().FirstOrDefaultAsync(x => x.Id == r.RoomId && x.HotelId == booking.HotelId && x.RoomTypeId == rt.RoomTypeId);
                        if (room == null)
                        {
                            await _uow.RollbackTransactionAsync();
                            return ApiResponse<BookingDetailsDto>.Fail("Room not found in hotel or mismatched room type");
                        }

                        var overlap = await _bookingRoomRepo.Query()
                            .Where(br => br.RoomId == r.RoomId && br.BookingStatus != BookingRoomStatus.Cancelled && br.BookingRoomId != r.RoomId)
                            .AnyAsync(br => r.StartDate < br.EndDate && r.EndDate > br.StartDate);
                        if (overlap)
                        {
                            await _uow.RollbackTransactionAsync();
                            return ApiResponse<BookingDetailsDto>.Fail($"Room {room.Number} is not available for selected dates");
                        }

                        var bookingRoom = new BookingRoom
                        {
                            BookingRoomId = Guid.NewGuid(),
                            RoomId = r.RoomId,
                            BookingRoomTypeId = brt.BookingRoomTypeId,
                            RoomName = room.Number,
                            StartDate = r.StartDate,
                            EndDate = r.EndDate,
                            BookingStatus = BookingRoomStatus.Pending
                        };
                        await _bookingRoomRepo.AddAsync(bookingRoom);

                        var nights = (decimal)(bookingRoom.EndDate.Date - bookingRoom.StartDate.Date).TotalDays;
                        total += (brt.Price) * nights;
                    }
                }

                booking.TotalAmount = Math.Max(0, total - booking.DiscountAmount);
            }

            booking.LeftAmount = Math.Max(0, booking.TotalAmount - booking.DepositAmount);

            await _bookingRepo.UpdateAsync(booking);
            await _uow.CommitTransactionAsync();
            return await GetByIdAsync(booking.Id);
        }
        catch (Exception ex)
        {
            try { await _uow.RollbackTransactionAsync(); } catch {}
            return ApiResponse<BookingDetailsDto>.Fail($"Error updating booking: {ex.Message}");
        }
    }

    public async Task<ApiResponse> CancelAsync(Guid id)
    {
        try
        {
            var booking = await _bookingRepo.FindAsync(id);
            if (booking == null) return ApiResponse.Fail("Booking not found");

            booking.Status = BookingStatus.Cancelled;
            await _bookingRepo.UpdateAsync(booking);
            await _bookingRepo.SaveChangesAsync();
            return ApiResponse.Ok("Booking cancelled");
        }
        catch (Exception ex)
        {
            return ApiResponse.Fail($"Error cancelling booking: {ex.Message}");
        }
    }

    public async Task<ApiResponse<CallLogDto>> AddCallLogAsync(Guid bookingId, AddCallLogDto dto)
    {
        try
        {
            var booking = await _bookingRepo.FindAsync(bookingId);
            if (booking == null) return ApiResponse<CallLogDto>.Fail("Booking not found");

            var log = new CallLog
            {
                Id = Guid.NewGuid(),
                BookingId = bookingId,
                CallTime = dto.CallTime,
                Result = dto.Result,
                Notes = dto.Notes,
                StaffUserId = dto.StaffUserId
            };
            await _callLogRepo.AddAsync(log);
            await _callLogRepo.SaveChangesAsync();

            var dtoOut = new CallLogDto
            {
                Id = log.Id,
                CallTime = log.CallTime,
                Result = log.Result,
                Notes = log.Notes,
                StaffUserId = log.StaffUserId
            };
            return ApiResponse<CallLogDto>.Ok(dtoOut);
        }
        catch (Exception ex)
        {
            return ApiResponse<CallLogDto>.Fail($"Error adding call log: {ex.Message}");
        }
    }

    public async Task<ApiResponse<List<RoomMapItemDto>>> GetRoomMapAsync(RoomMapQueryDto query)
    {
        try
        {
            var targetDate = query.Date.Date;

            var roomsQuery = _roomRepo.Query().Include(r => r.RoomType).Where(r => true);
            if (query.HotelId.HasValue) roomsQuery = roomsQuery.Where(r => r.HotelId == query.HotelId.Value);
            var rooms = await roomsQuery.ToListAsync();

            var roomIds = rooms.Select(r => r.Id).ToList();
            var bookings = await _bookingRoomRepo.Query()
                .Where(br => roomIds.Contains(br.RoomId) && br.BookingStatus != BookingRoomStatus.Cancelled)
                .Where(br => targetDate < br.EndDate.Date && targetDate >= br.StartDate.Date)
                .Select(br => new { br.RoomId, br.StartDate, br.EndDate, br.BookingRoomId })
                .ToListAsync();
            var byRoom = bookings.GroupBy(b => b.RoomId).ToDictionary(g => g.Key, g => g.ToList());

            var result = rooms.Select(r => new RoomMapItemDto
            {
                RoomId = r.Id,
                RoomNumber = r.Number,
                RoomTypeId = r.RoomTypeId,
                RoomTypeName = r.RoomType?.Name ?? string.Empty,
                Timeline = BuildDayTimeline(targetDate, byRoom.TryGetValue(r.Id, out var list) && list.Any())
            }).ToList();

            return ApiResponse<List<RoomMapItemDto>>.Ok(result);
        }
        catch (Exception ex)
        {
            return ApiResponse<List<RoomMapItemDto>>.Fail($"Error building room map: {ex.Message}");
        }
    }

    private List<RoomTimelineSegmentDto> BuildDayTimeline(DateTime day, bool hasBooking)
    {
        var segments = new List<RoomTimelineSegmentDto>();
        var start = day.Date;
        var end = start.AddDays(1);
        if (hasBooking)
        {
            segments.Add(new RoomTimelineSegmentDto
            {
                Start = start,
                End = end,
                Status = "Booked",
                BookingId = null
            });
        }
        else
        {
            segments.Add(new RoomTimelineSegmentDto
            {
                Start = start,
                End = end,
                Status = "Available",
                BookingId = null
            });
        }
        return segments;
    }
}