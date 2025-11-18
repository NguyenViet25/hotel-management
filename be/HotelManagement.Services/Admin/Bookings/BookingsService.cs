using HotelManagement.Domain;
using HotelManagement.Domain.Repositories;
using HotelManagement.Repository.Common;
using HotelManagement.Services.Admin.Bookings.Dtos;
using HotelManagement.Services.Common;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Services.Admin.Bookings;

public class BookingsService(
    IRepository<Booking> bookingRepo,
    IRepository<BookingRoomType> bookingRoomTypeRepo,
    IRepository<BookingRoom> bookingRoomRepo,
    IRepository<BookingGuest> bookingGuestRepo,
    IRepository<Hotel> hotelRepo,
    IRepository<Guest> guestRepo,
    IRepository<HotelRoom> roomRepo,
    IRepository<RoomType> roomTypeRepo,
    IRepository<CallLog> callLogRepo,
    IUnitOfWork uow) : IBookingsService
{
    private readonly IRepository<Booking> _bookingRepo = bookingRepo;
    private readonly IRepository<BookingRoomType> _bookingRoomTypeRepo = bookingRoomTypeRepo;
    private readonly IRepository<BookingRoom> _bookingRoomRepo = bookingRoomRepo;
    private readonly IRepository<BookingGuest> _bookingGuestRepo = bookingGuestRepo;
    private readonly IRepository<Hotel> _hotelRepo = hotelRepo;
    private readonly IRepository<Guest> _guestRepo = guestRepo;
    private readonly IRepository<HotelRoom> _roomRepo = roomRepo;
    private readonly IRepository<RoomType> _roomTypeRepo = roomTypeRepo;
    private readonly IRepository<CallLog> _callLogRepo = callLogRepo;
    private readonly IUnitOfWork _uow = uow;

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
                HotelIdKey = dto.HotelId,
                PrimaryGuestId = primaryGuest.Id,
                Status = BookingStatus.Pending,
                DepositAmount = dto.Deposit,
                DiscountAmount = dto.Discount,
                TotalAmount = dto.Total,
                LeftAmount = dto.Left,
                CreatedAt = DateTime.UtcNow,
                Notes = dto.Notes,
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
                    BookingIdKey = booking.Id,
                    RoomTypeId = rt.RoomTypeId,
                    RoomTypeName = roomType.Name,
                    Capacity = rt.Capacity ?? roomType.Capacity,
                    Price = rt.Price ?? roomType.BasePriceFrom,
                    StartDate = rt.StartDate,
                    EndDate = rt.EndDate,
                    TotalRoom = rt.TotalRoom ?? 0

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
                        BookingRoomTypeIdKey = brt.BookingRoomTypeId,
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
                .Include(x => x.PrimaryGuest)
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
                HotelId = b.HotelIdKey,
                PrimaryGuestId = b.PrimaryGuestId,
                PrimaryGuestName = b.PrimaryGuest?.FullName,
                PhoneNumber = b.PrimaryGuest?.Phone,
                Email = b.PrimaryGuest?.Email,
                Notes = b.Notes,
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

            var roomTypes = await _bookingRoomTypeRepo.Query()
                    .Include(x => x.RoomType).Where(x => x.BookingIdKey == dto.Id).ToListAsync();

            dto.BookingRoomTypes = roomTypes.Select(rt => new BookingRoomTypeDto
            {
                BookingRoomTypeId = rt.BookingRoomTypeId,
                RoomTypeId = rt.RoomTypeId,
                RoomTypeName = rt.RoomTypeName,
                Capacity = rt.Capacity,
                Price = rt.Price,
                TotalRoom = rt.TotalRoom,
                StartDate = rt.StartDate,
                EndDate = rt.EndDate,
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
            }).ToList();

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
                .Include(x => x.PrimaryGuest)
                .Include(b => b.BookingRoomTypes)
                .ThenInclude(rt => rt.BookingRooms)
                .Where(x => true);

            if (query.HotelId.HasValue)
                q = q.Where(b => b.HotelIdKey == query.HotelId.Value);
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
                HotelId = b.HotelIdKey,
                PrimaryGuestId = b.PrimaryGuestId,
                PrimaryGuestName = b.PrimaryGuest?.FullName,
                PhoneNumber = b.PrimaryGuest?.Phone,
                Email = b.PrimaryGuest?.Email,
                Status = b.Status,
                DepositAmount = b.DepositAmount,
                DiscountAmount = b.DiscountAmount,
                TotalAmount = b.TotalAmount,
                LeftAmount = b.LeftAmount,
                CreatedAt = b.CreatedAt,
                Notes = b.Notes,
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

            var list = new List<BookingDetailsDto>();

            foreach (var item in dtos)
            {
                var roomTypes = await _bookingRoomTypeRepo.Query()
                    .Include(x => x.RoomType).Where(x => x.BookingIdKey == item.Id).ToListAsync();

                item.BookingRoomTypes = roomTypes.Select(rt => new BookingRoomTypeDto
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
                }).ToList();

                list.Add(item);
            }


            return ApiResponse<List<BookingDetailsDto>>.Ok(list, meta: new { total, page = query.Page, pageSize = query.PageSize });
        }
        catch (Exception ex)
        {
            return ApiResponse<List<BookingDetailsDto>>.Fail($"Error listing bookings: {ex.Message}");
        }
    }

    public async Task<ApiResponse<List<BookingDetailsDto>>> ListActiveAsync(BookingsByHotelQueryDto query)
    {
        try
        {
            var q = _bookingRepo.Query()
                .Include(x => x.PrimaryGuest)
                .Include(b => b.BookingRoomTypes)
                .ThenInclude(rt => rt.BookingRooms)
                .Where(x => true)
                .Where(x => x.Status != BookingStatus.Pending && x.Status != BookingStatus.Cancelled);

            if (query.HotelId.HasValue)
                q = q.Where(b => b.HotelIdKey == query.HotelId.Value);

            q = q.OrderByDescending(b => b.CreatedAt);

            var items = await q.ToListAsync();

            // Preload guests
            var primaryGuestIds = items.Select(b => b.PrimaryGuestId).Where(id => id.HasValue).Select(id => id!.Value).Distinct().ToList();
            var guestMap = await _guestRepo.Query()
                .Where(g => primaryGuestIds.Contains(g.Id))
                .ToDictionaryAsync(g => g.Id, g => g.FullName);

            var dtos = items.Select(b => new BookingDetailsDto
            {
                Id = b.Id,
                HotelId = b.HotelIdKey,
                PrimaryGuestId = b.PrimaryGuestId,
                PrimaryGuestName = b.PrimaryGuest?.FullName,
                PhoneNumber = b.PrimaryGuest?.Phone,
                Email = b.PrimaryGuest?.Email,
                Status = b.Status,
                DepositAmount = b.DepositAmount,
                DiscountAmount = b.DiscountAmount,
                TotalAmount = b.TotalAmount,
                LeftAmount = b.LeftAmount,
                CreatedAt = b.CreatedAt,
                Notes = b.Notes,
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

            var list = new List<BookingDetailsDto>();

            foreach (var item in dtos)
            {
                var roomTypes = await _bookingRoomTypeRepo.Query()
                    .Include(x => x.RoomType).Where(x => x.BookingIdKey == item.Id).ToListAsync();

                item.BookingRoomTypes = roomTypes.Select(rt => new BookingRoomTypeDto
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
                }).ToList();

                list.Add(item);
            }


            return ApiResponse<List<BookingDetailsDto>>.Ok(list);
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

            if (dto.RoomTypes != null)
            {
                var existingRoomTypeIds = await _bookingRoomTypeRepo.Query().Where(x => x.BookingIdKey == booking.Id).ToListAsync();

                foreach (var item in existingRoomTypeIds)
                {
                    await _bookingRoomTypeRepo.RemoveAsync(item);
                    await _bookingRoomTypeRepo.SaveChangesAsync();
                }

                // TODO: remove booking room later
                await _bookingRoomRepo.SaveChangesAsync();

                foreach (var rt in dto.RoomTypes)
                {
                    var roomType = await _roomTypeRepo.FindAsync(rt.RoomTypeId);
                    if (roomType == null || roomType.HotelId != booking.HotelIdKey)
                    {
                        await _uow.RollbackTransactionAsync();
                        return ApiResponse<BookingDetailsDto>.Fail("Room type invalid for hotel");
                    }

                    var brt = new BookingRoomType
                    {
                        BookingRoomTypeId = Guid.NewGuid(),
                        BookingIdKey = booking.Id,
                        RoomTypeId = rt.RoomTypeId,
                        RoomTypeName = roomType.Name,
                        StartDate = rt.StartDate,
                        EndDate = rt.EndDate,
                        Capacity = rt.Capacity ?? roomType.Capacity,
                        Price = rt.Price ?? roomType.BasePriceFrom,
                        TotalRoom = rt.TotalRoom ?? 0
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

                        var room = await _roomRepo.Query().FirstOrDefaultAsync(x => x.Id == r.RoomId && x.HotelId == booking.HotelIdKey && x.RoomTypeId == rt.RoomTypeId);
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
                            BookingRoomTypeIdKey = brt.BookingRoomTypeId,
                            RoomName = room.Number,
                            StartDate = r.StartDate,
                            EndDate = r.EndDate,
                            BookingStatus = BookingRoomStatus.Pending
                        };
                        await _bookingRoomRepo.AddAsync(bookingRoom);
                        await _bookingRoomRepo.SaveChangesAsync();

                    }
                }

            }
            booking.TotalAmount = dto.Total;
            booking.LeftAmount = dto.Left;
            booking.DiscountAmount = dto.Discount;
            booking.DepositAmount = dto.Deposit;
            booking.Notes = dto.Notes;

            var guest = await _guestRepo.Query().FirstOrDefaultAsync(x => x.Id == booking.PrimaryGuestId);
            if (guest is not null)
            {
                guest.FullName = dto.PrimaryGuest.Fullname;
                guest.Phone = dto.PrimaryGuest.Phone ?? "";
                guest.Email = dto.PrimaryGuest.Email;
                await _guestRepo.SaveChangesAsync();
            }

            await _bookingRepo.UpdateAsync(booking);
            await _bookingRepo.SaveChangesAsync();

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
                    BookingId = br.BookingRoomType.BookingIdKey,
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

    public async Task<ApiResponse> AddRoomToBookingAsync(Guid bookingRoomTypeId, Guid roomId)
    {
        var bookingRoomType = await _bookingRoomTypeRepo.Query().Where(x => x.BookingRoomTypeId == bookingRoomTypeId).FirstOrDefaultAsync();

        if (bookingRoomType == null)
            return ApiResponse.Fail("Không tìm thấy booking");
        await _bookingRoomRepo.AddAsync(new BookingRoom()
        {
            BookingRoomId = Guid.NewGuid(),
            BookingRoomTypeIdKey = bookingRoomTypeId,
            RoomId = roomId,
            StartDate = bookingRoomType.StartDate,
            EndDate = bookingRoomType.EndDate,
            BookingStatus = BookingRoomStatus.Pending
        });
        await _bookingRoomRepo.SaveChangesAsync();

        return ApiResponse.Ok("Thêm phòng thành công");
    }

    public async Task<ApiResponse> CheckInAsync(CheckInDto dto)
    {
        foreach (var guest in dto.Persons)
        {
            var newGuest = new Guest()
            {
                Id = Guid.NewGuid(),
                FullName = guest.Name,
                Phone = guest.Phone,
                IdCardFrontImageUrl = guest.IdCardFrontImageUrl,
                IdCardBackImageUrl = guest.IdCardBackImageUrl
            };
            await _guestRepo.AddAsync(newGuest);
            await _guestRepo.SaveChangesAsync();

            var bookingGuest = new BookingGuest()
            {
                BookingRoomId = dto.RoomBookingId,
                GuestId = newGuest.Id,
            };
            await _bookingGuestRepo.AddAsync(bookingGuest);
            await _bookingGuestRepo.SaveChangesAsync();
        }

        return ApiResponse.Ok("Check in thành công");
    }
}