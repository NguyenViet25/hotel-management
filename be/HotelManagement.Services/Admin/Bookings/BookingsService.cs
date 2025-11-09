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
            if (hotel == null) return ApiResponse<BookingDetailsDto>.Fail("Không tìm thấy khách sạn");

            if (dto.RoomTypes == null || dto.RoomTypes.Count == 0)
                return ApiResponse<BookingDetailsDto>.Fail("Điền ít nhất 1 loại phòng");

            // Create primary guest
            var primaryGuest = new Guest
            {
                Id = Guid.NewGuid(),
                FullName = dto.PrimaryGuest.Fullname,
                Phone = dto.PrimaryGuest.Phone ?? string.Empty,
                Email = dto.PrimaryGuest.Email
            };
            await _guestRepo.AddAsync(primaryGuest);
            await _guestRepo.SaveChangesAsync();

            await _uow.BeginTransactionAsync();

            var booking = new Booking
            {
                Id = Guid.NewGuid(),
                HotelId = dto.HotelId,
                PrimaryGuestId = primaryGuest.Id,
                Status = BookingStatus.Pending,
                DepositAmount = dto.Deposit,
                DiscountAmount = dto.Discount,
                TotalAmount = dto.Total,
                LeftAmount = dto.Left,
                CreatedAt = DateTime.UtcNow
            };
            await _bookingRepo.AddAsync(booking);
            await _bookingRepo.SaveChangesAsync();


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
                    StartDate = rt.StartDate,
                    EndDate = rt.EndDate,
                    TotalRoom = rt.Rooms?.Count ?? 0
                };
                await _bookingRoomTypeRepo.AddAsync(brt);
                await _bookingRoomTypeRepo.SaveChangesAsync();

                if (rt.Rooms == null || rt.Rooms.Count == 0)
                {
                    continue;
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
                    await _bookingRoomRepo.SaveChangesAsync();

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
                        await _bookingGuestRepo.SaveChangesAsync();
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
                                await _guestRepo.SaveChangesAsync();
                                gid = newG.Id;
                            }

                            await _bookingGuestRepo.AddAsync(new BookingGuest
                            {
                                BookingRoomId = bookingRoom.BookingRoomId,
                                GuestId = gid
                            });
                        }
                    }

                }
            }

            await _uow.CommitTransactionAsync();

            return await GetByIdAsync(booking.Id);
        }
        catch (Exception ex)
        {
            try { await _uow.RollbackTransactionAsync(); } catch { }
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
                PrimaryGuestName = (await _guestRepo.FindAsync(b.PrimaryGuestId ?? Guid.Empty))?.FullName,
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

    public async Task<ApiResponse<List<BookingDetailsDto>>> ListAsync(BookingsQueryDto query)
    {
        try
        {
            var q = _bookingRepo.Query()
                .Include(b => b.BookingRoomTypes)
                .ThenInclude(rt => rt.BookingRooms)
                .Where(x => true);

            if (query.HotelId.HasValue)
                q = q.Where(b => b.HotelId == query.HotelId.Value);
            if (query.Status.HasValue)
                q = q.Where(b => b.Status == query.Status.Value);
            if (query.StartDate.HasValue)
                q = q.Where(b => b.CreatedAt >= query.StartDate.Value);
            if (query.EndDate.HasValue)
                q = q.Where(b => b.CreatedAt <= query.EndDate.Value);
            if (!string.IsNullOrWhiteSpace(query.GuestName))
            {
                var gn = query.GuestName!.Trim();
                q = q.Where(b => (_guestRepo.Query().Any(g => g.Id == b.PrimaryGuestId && (g.FullName ?? "").Contains(gn))));
            }
            if (!string.IsNullOrWhiteSpace(query.RoomNumber))
            {
                var rn = query.RoomNumber!.Trim();
                q = q.Where(b => b.BookingRoomTypes.Any(rt => rt.BookingRooms.Any(r => (r.RoomName ?? "").Contains(rn))));
            }

            // Sorting
            var sortDir = (query.SortDir ?? "desc").ToLower();
            var sortBy = (query.SortBy ?? "createdAt").ToLower();
            if (sortBy == "createdAt")
            {
                q = sortDir == "asc" ? q.OrderBy(b => b.CreatedAt) : q.OrderByDescending(b => b.CreatedAt);
            }
            else
            {
                q = q.OrderByDescending(b => b.CreatedAt);
            }

            var total = await q.CountAsync();
            var items = await q
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToListAsync();

            // Preload guests
            var primaryGuestIds = items.Select(b => b.PrimaryGuestId).Where(id => id.HasValue).Select(id => id!.Value).Distinct().ToList();
            var guestMap = await _guestRepo.Query()
                .Where(g => primaryGuestIds.Contains(g.Id))
                .ToDictionaryAsync(g => g.Id, g => g.FullName);

            var dtos = items.Select(b => new BookingDetailsDto
            {
                Id = b.Id,
                HotelId = b.HotelId,
                PrimaryGuestId = b.PrimaryGuestId,
                PrimaryGuestName = (b.PrimaryGuestId.HasValue && guestMap.ContainsKey(b.PrimaryGuestId.Value)) ? guestMap[b.PrimaryGuestId.Value] : null,
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
                        Guests = new List<BookingGuestDto>()
                    }).ToList()
                }).ToList(),
                CallLogs = new List<CallLogDto>()
            }).ToList();

            return ApiResponse<List<BookingDetailsDto>>.Ok(dtos, meta: new { total, page = query.Page, pageSize = query.PageSize });
        }
        catch (Exception ex)
        {
            return ApiResponse<List<BookingDetailsDto>>.Fail($"Error listing bookings: {ex.Message}");
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
            try { await _uow.RollbackTransactionAsync(); } catch { }
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

    public async Task<ApiResponse<List<CallLogDto>>> GetCallLogsAsync(Guid bookingId)
    {
        try
        {
            var booking = await _bookingRepo.FindAsync(bookingId);
            if (booking == null) return ApiResponse<List<CallLogDto>>.Fail("Booking not found");

            var logs = await _callLogRepo.Query()
                .Where(cl => cl.BookingId == bookingId)
                .OrderByDescending(cl => cl.CallTime)
                .Select(cl => new CallLogDto
                {
                    Id = cl.Id,
                    CallTime = cl.CallTime,
                    Result = cl.Result,
                    Notes = cl.Notes,
                    StaffUserId = cl.StaffUserId
                }).ToListAsync();

            return ApiResponse<List<CallLogDto>>.Ok(logs);
        }
        catch (Exception ex)
        {
            return ApiResponse<List<CallLogDto>>.Fail($"Error retrieving call logs: {ex.Message}");
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

    public async Task<ApiResponse<object>> GetRoomAvailabilityAsync(RoomAvailabilityQueryDto query)
    {
        try
        {
            var q = _roomRepo.Query().Include(r => r.RoomType).Where(r => true);
            if (query.HotelId.HasValue) q = q.Where(r => r.HotelId == query.HotelId.Value);
            if (query.TypeId.HasValue) q = q.Where(r => r.RoomTypeId == query.TypeId.Value);
            var rooms = await q.ToListAsync();

            var from = query.From?.Date ?? DateTime.UtcNow.Date;
            var to = query.To?.Date ?? from.AddDays(1);

            var roomIds = rooms.Select(r => r.Id).ToList();
            var overlapping = await _bookingRoomRepo.Query()
                .Where(br => roomIds.Contains(br.RoomId) && br.BookingStatus != BookingRoomStatus.Cancelled)
                .Where(br => from < br.EndDate && to > br.StartDate)
                .Select(br => br.RoomId)
                .Distinct()
                .ToListAsync();

            var available = rooms.Where(r => !overlapping.Contains(r.Id))
                .Select(r => new { roomId = r.Id, roomNumber = r.Number, roomTypeId = r.RoomTypeId, roomTypeName = r.RoomType?.Name ?? string.Empty }).ToList();

            var result = new { availableRooms = available, totalAvailable = available.Count };
            return ApiResponse<object>.Ok(result);
        }
        catch (Exception ex)
        {
            return ApiResponse<object>.Fail($"Error checking availability: {ex.Message}");
        }
    }

    public async Task<ApiResponse<List<BookingIntervalDto>>> GetRoomScheduleAsync(Guid roomId, DateTime from, DateTime to)
    {
        try
        {
            var intervals = await _bookingRoomRepo.Query()
                .Include(br => br.BookingRoomType)
                .ThenInclude(brt => brt.Booking)
                .Where(br => br.RoomId == roomId && br.BookingStatus != BookingRoomStatus.Cancelled)
                .Where(br => from < br.EndDate && to > br.StartDate)
                .Select(br => new BookingIntervalDto
                {
                    BookingId = br.BookingRoomType.BookingId,
                    Start = br.StartDate,
                    End = br.EndDate,
                    Status = br.BookingRoomType.Booking.Status,
                    GuestName = (br.BookingRoomType.Booking.PrimaryGuestId.HasValue) ?
                        _guestRepo.Query().Where(g => g.Id == br.BookingRoomType.Booking.PrimaryGuestId.Value).Select(g => g.FullName).FirstOrDefault() : null
                })
                .ToListAsync();

            return ApiResponse<List<BookingIntervalDto>>.Ok(intervals);
        }
        catch (Exception ex)
        {
            return ApiResponse<List<BookingIntervalDto>>.Fail($"Error retrieving room schedule: {ex.Message}");
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