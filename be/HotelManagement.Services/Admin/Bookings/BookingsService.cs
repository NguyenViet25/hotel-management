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
    IRepository<RoomStatusLog> roomStatusLogRepo,
    IRepository<SurchargeRule> surchargeRuleRepo,
    IRepository<Invoice> invoiceRepo,
    IRepository<InvoiceLine> invoiceLineRepo,
    IRepository<HotelManagement.Domain.Minibar> minibarRepo,
    IRepository<HotelManagement.Domain.MinibarBooking> minibarBookingRepo,
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
    private readonly IRepository<RoomStatusLog> _roomStatusLogRepo = roomStatusLogRepo;
    private readonly IRepository<SurchargeRule> _surchargeRuleRepo = surchargeRuleRepo;
    private readonly IRepository<Invoice> _invoiceRepo = invoiceRepo;
    private readonly IRepository<InvoiceLine> _invoiceLineRepo = invoiceLineRepo;
    private readonly IRepository<HotelManagement.Domain.Minibar> _minibarRepo = minibarRepo;
    private readonly IRepository<HotelManagement.Domain.MinibarBooking> _minibarBookingRepo = minibarBookingRepo;
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
                HotelId = dto.HotelId,
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
                    BookingId = booking.Id,
                    RoomTypeId = rt.RoomTypeId,
                    RoomTypeName = roomType.Name,
                    Capacity = roomType.Capacity,
                    Price = roomType.BasePriceFrom,
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
                            BookingGuestId = Guid.NewGuid(),
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
                                BookingGuestId = Guid.NewGuid(),
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
                HotelId = b.HotelId,
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
                CallLogs = b.CallLogs?.OrderByDescending(c => c.CallTime).Select(c => new CallLogDto
                {
                    Id = c.Id,
                    CallTime = c.CallTime,
                    Result = c.Result,
                    Notes = c.Notes,
                    StaffUserId = c.StaffUserId
                }).ToList() ?? []
            };

            var roomTypes = await _bookingRoomTypeRepo.Query()
                    .Include(x => x.RoomType).Include(x => x.BookingRooms)
                    .Where(x => x.BookingId == dto.Id).ToListAsync();

            var list = new List<BookingRoomTypeDto>();
            foreach (var rt in roomTypes)
            {
                var bookingRooms = await _bookingRoomRepo.Query()
                    .Include(x => x.HotelRoom)
                    .Where(x => x.BookingRoomTypeId == rt.BookingRoomTypeId)
                    .ToListAsync();

                var rtDto = new BookingRoomTypeDto()
                {
                    BookingRoomTypeId = rt.BookingRoomTypeId,
                    RoomTypeId = rt.RoomTypeId,
                    RoomTypeName = rt.RoomTypeName,
                    Capacity = rt.Capacity,
                    Price = rt.Price,
                    TotalRoom = rt.TotalRoom,
                    StartDate = rt.StartDate,
                    EndDate = rt.EndDate,
                };

                var listBookingRoomDto = new List<BookingRoomDto>();
                foreach (BookingRoom br in bookingRooms)
                {
                    var bookingGuests = await _bookingGuestRepo.Query()
                        .Include(x => x.BookingRoom)
                        .Include(x => x.Guest)
                        .Where(x => x.BookingRoomId == br.BookingRoomId).ToListAsync();

                    var bookingRoomDto = new BookingRoomDto
                    {
                        BookingRoomId = br.BookingRoomId,
                        RoomId = br.RoomId,
                        RoomName = br.RoomName,
                        StartDate = br.StartDate,
                        EndDate = br.EndDate,
                        BookingStatus = br.BookingStatus,
                        ActualCheckInAt = br.ActualCheckInAt,
                        ActualCheckOutAt = br.ActualCheckOutAt,
                        ExtendedDate = br.ExtendedDate,
                        Guests = [.. bookingGuests.Select(x => new BookingGuestDto()
                        {
                            GuestId = x.GuestId,
                            Fullname = x.Guest?.FullName,
                            Email = x.Guest?.Email,
                            Phone = x.Guest?.Phone,
                            IdCard = x.Guest?.IdCard,
                            IdCardBackImageUrl = x.Guest?.IdCardBackImageUrl,
                            IdCardFrontImageUrl = x.Guest?.IdCardFrontImageUrl
                        })]
                    };

                    listBookingRoomDto.Add(bookingRoomDto);
                }
                rtDto.BookingRooms = listBookingRoomDto;

                list.Add(rtDto);

            }

            dto.BookingRoomTypes = list;

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
                    .Include(x => x.RoomType).Where(x => x.BookingId == item.Id).ToListAsync();

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
                q = q.Where(b => b.HotelId == query.HotelId.Value);

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
                HotelId = b.HotelId,
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
                    .Include(x => x.RoomType).Where(x => x.BookingId == item.Id).ToListAsync();

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
                var existingRoomTypeIds = await _bookingRoomTypeRepo.Query().Where(x => x.BookingId == booking.Id).ToListAsync();

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
                        StartDate = rt.StartDate,
                        EndDate = rt.EndDate,
                        Capacity = roomType.Capacity,
                        Price = roomType.BasePriceFrom,
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
                Floor = r.Floor,
                Status = r.Status,
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

    public async Task<ApiResponse> AddRoomToBookingAsync(Guid bookingRoomTypeId, Guid roomId)
    {
        var bookingRoomType = await _bookingRoomTypeRepo.Query().Where(x => x.BookingRoomTypeId == bookingRoomTypeId).FirstOrDefaultAsync();

        if (bookingRoomType == null)
            return ApiResponse.Fail("Không tìm thấy booking");

        var room = await _roomRepo.Query().Where(x => x.Id == roomId).FirstOrDefaultAsync();

        if (room is not null)
        {
            room.Status = RoomStatus.Occupied;
            await _roomRepo.UpdateAsync(room);
            await _roomRepo.SaveChangesAsync();
        }

        await _bookingRoomRepo.AddAsync(new BookingRoom()
        {
            BookingRoomId = Guid.NewGuid(),
            BookingRoomTypeId = bookingRoomTypeId,
            RoomId = roomId,
            RoomName = room?.Number,
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
                IdCard = guest.IdCard,
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

        var bookingRoom = await _bookingRoomRepo.FindAsync(dto.RoomBookingId);
        if (bookingRoom != null)
        {
            bookingRoom.BookingStatus = BookingRoomStatus.CheckedIn;
            bookingRoom.ActualCheckInAt = dto.ActualCheckInAt ?? DateTime.UtcNow;
            await _bookingRoomRepo.UpdateAsync(bookingRoom);
            await _bookingRoomRepo.SaveChangesAsync();

            var room = await _roomRepo.FindAsync(bookingRoom.RoomId);
            if (room != null)
            {
                room.Status = RoomStatus.Occupied;
                await _roomRepo.UpdateAsync(room);
                await _roomRepo.SaveChangesAsync();

                await _roomStatusLogRepo.AddAsync(new RoomStatusLog
                {
                    Id = Guid.NewGuid(),
                    HotelId = room.HotelId,
                    RoomId = room.Id,
                    Status = RoomStatus.Occupied,
                    Timestamp = DateTime.UtcNow
                });
                await _roomStatusLogRepo.SaveChangesAsync();
            }
        }

        return ApiResponse.Ok("Check in thành công");
    }

    public async Task<ApiResponse> UpdateGuestInRoomAsync(Guid bookingRoomId, Guid guestId, UpdateGuestDto dto)
    {
        try
        {
            var bookingRoom = await _bookingRoomRepo.Query().Include(br => br.BookingRoomType).FirstOrDefaultAsync(br => br.BookingRoomId == bookingRoomId);
            if (bookingRoom == null) return ApiResponse.Fail("Không tìm thấy phòng trong booking");

            var bg = await _bookingGuestRepo.Query().FirstOrDefaultAsync(x => x.BookingRoomId == bookingRoomId && x.GuestId == guestId);
            if (bg == null) return ApiResponse.Fail("Không tìm thấy khách trong phòng");

            var guest = await _guestRepo.FindAsync(guestId);
            if (guest == null) return ApiResponse.Fail("Không tìm thấy khách");

            guest.FullName = dto.Fullname ?? guest.FullName;
            guest.Phone = dto.Phone ?? guest.Phone;
            guest.Email = dto.Email ?? guest.Email;
            guest.IdCardFrontImageUrl = dto.IdCardFrontImageUrl ?? guest.IdCardFrontImageUrl;
            guest.IdCardBackImageUrl = dto.IdCardBackImageUrl ?? guest.IdCardBackImageUrl;

            await _guestRepo.UpdateAsync(guest);
            await _guestRepo.SaveChangesAsync();

            return ApiResponse.Ok();
        }
        catch (Exception ex)
        {
            return ApiResponse.Fail($"Error updating guest: {ex.Message}");
        }
    }

    public async Task<ApiResponse> RemoveGuestFromRoomAsync(Guid bookingRoomId, Guid guestId)
    {
        try
        {
            var bookingRoom = await _bookingRoomRepo.Query().Include(br => br.BookingRoomType).FirstOrDefaultAsync(br => br.BookingRoomId == bookingRoomId);
            if (bookingRoom == null) return ApiResponse.Fail("Không tìm thấy phòng trong booking");

            var bg = await _bookingGuestRepo.Query().FirstOrDefaultAsync(x => x.BookingRoomId == bookingRoomId && x.GuestId == guestId);
            if (bg == null) return ApiResponse.Fail("Không tìm thấy khách trong phòng");

            await _bookingGuestRepo.RemoveAsync(bg);
            await _bookingGuestRepo.SaveChangesAsync();

            return ApiResponse.Ok();
        }
        catch (Exception ex)
        {
            return ApiResponse.Fail($"Error removing guest: {ex.Message}");
        }
    }

    public async Task<ApiResponse<BookingDetailsDto>> UpdateRoomDatesAsync(Guid bookingRoomId, DateTime startDate, DateTime endDate)
    {
        var bookingRoom = await _bookingRoomRepo.Query().Include(br => br.BookingRoomType).FirstOrDefaultAsync(br => br.BookingRoomId == bookingRoomId);
        if (bookingRoom == null) return ApiResponse<BookingDetailsDto>.Fail("Không tìm thấy phòng trong booking");
        if (endDate <= startDate) return ApiResponse<BookingDetailsDto>.Fail("Khoảng thời gian không hợp lệ");

        var typeStart = bookingRoom.BookingRoomType!.StartDate;
        var typeEnd = bookingRoom.BookingRoomType!.EndDate;
        if (startDate < typeStart || endDate > typeEnd) return ApiResponse<BookingDetailsDto>.Fail("Thời gian nằm ngoài khoảng của loại phòng");

        var hasOverlap = await _bookingRoomRepo.Query()
            .Where(br => br.RoomId == bookingRoom.RoomId && br.BookingRoomId != bookingRoomId && br.BookingStatus != BookingRoomStatus.Cancelled)
            .AnyAsync(br => startDate < br.EndDate && endDate > br.StartDate);
        if (hasOverlap) return ApiResponse<BookingDetailsDto>.Fail("Trùng lịch với booking khác");

        bookingRoom.StartDate = startDate;
        bookingRoom.EndDate = endDate;
        await _bookingRoomRepo.UpdateAsync(bookingRoom);
        await _bookingRoomRepo.SaveChangesAsync();

        var bookingId = bookingRoom.BookingRoomType!.BookingId;
        return await GetByIdAsync(bookingId);
    }

    public async Task<ApiResponse<BookingDetailsDto>> UpdateRoomActualTimesAsync(Guid bookingRoomId, DateTime? actualCheckInAt, DateTime? actualCheckOutAt)
    {
        var bookingRoom = await _bookingRoomRepo.Query().Include(br => br.BookingRoomType).FirstOrDefaultAsync(br => br.BookingRoomId == bookingRoomId);
        if (bookingRoom == null) return ApiResponse<BookingDetailsDto>.Fail("Không tìm thấy phòng trong booking");

        if (actualCheckInAt.HasValue && actualCheckOutAt.HasValue && actualCheckOutAt.Value <= actualCheckInAt.Value)
            return ApiResponse<BookingDetailsDto>.Fail("Check-out phải sau Check-in");

        var start = bookingRoom.StartDate;
        var end = bookingRoom.EndDate;
        if (actualCheckInAt.HasValue && (actualCheckInAt.Value < start || actualCheckInAt.Value > end))
            return ApiResponse<BookingDetailsDto>.Fail("Thời gian check-in nằm ngoài khoảng dự kiến");
        if (actualCheckOutAt.HasValue && (actualCheckOutAt.Value < start))
            return ApiResponse<BookingDetailsDto>.Fail("Thời gian check-out nằm ngoài khoảng dự kiến");

        if (actualCheckInAt.HasValue)
        {
            bookingRoom.ActualCheckInAt = actualCheckInAt.Value;
            bookingRoom.BookingStatus = BookingRoomStatus.CheckedIn;
            var room = await _roomRepo.FindAsync(bookingRoom.RoomId);
            if (room != null)
            {
                room.Status = RoomStatus.Occupied;
                await _roomRepo.UpdateAsync(room);
                await _roomRepo.SaveChangesAsync();

                await _roomStatusLogRepo.AddAsync(new RoomStatusLog
                {
                    Id = Guid.NewGuid(),
                    HotelId = room.HotelId,
                    RoomId = room.Id,
                    Status = RoomStatus.Occupied,
                    Timestamp = actualCheckInAt.Value
                });
                await _roomStatusLogRepo.SaveChangesAsync();
            }
        }

        if (actualCheckOutAt.HasValue)
        {
            bookingRoom.ActualCheckOutAt = actualCheckOutAt.Value;
            bookingRoom.BookingStatus = BookingRoomStatus.CheckedOut;
            var room = await _roomRepo.FindAsync(bookingRoom.RoomId);
            if (room != null)
            {
                room.Status = RoomStatus.Dirty;
                await _roomRepo.UpdateAsync(room);
                await _roomRepo.SaveChangesAsync();

                await _roomStatusLogRepo.AddAsync(new RoomStatusLog
                {
                    Id = Guid.NewGuid(),
                    HotelId = room.HotelId,
                    RoomId = room.Id,
                    Status = RoomStatus.Dirty,
                    Timestamp = actualCheckOutAt.Value
                });
                await _roomStatusLogRepo.SaveChangesAsync();
            }
        }

        await _bookingRoomRepo.UpdateAsync(bookingRoom);
        await _bookingRoomRepo.SaveChangesAsync();

        var bookingRoomType = await _bookingRoomTypeRepo.Query()
            .Where(x => x.BookingRoomTypeId == bookingRoom.BookingRoomTypeId)
            .FirstOrDefaultAsync();

        return await GetByIdAsync(bookingRoomType!.BookingId);
    }

    public async Task<ApiResponse<BookingDetailsDto>> MoveGuestAsync(Guid bookingRoomId, Guid guestId, Guid targetBookingRoomId)
    {
        var fromRoom = await _bookingRoomRepo.Query().Include(br => br.BookingRoomType).FirstOrDefaultAsync(br => br.BookingRoomId == bookingRoomId);
        if (fromRoom == null) return ApiResponse<BookingDetailsDto>.Fail("Không tìm thấy phòng nguồn");
        var toRoom = await _bookingRoomRepo.Query().Include(br => br.BookingRoomType).FirstOrDefaultAsync(br => br.BookingRoomId == targetBookingRoomId);
        if (toRoom == null) return ApiResponse<BookingDetailsDto>.Fail("Không tìm thấy phòng đích");

        if (fromRoom.BookingRoomType!.BookingId != toRoom.BookingRoomType!.BookingId)
            return ApiResponse<BookingDetailsDto>.Fail("Phòng đích phải thuộc cùng booking");

        var bg = await _bookingGuestRepo.Query().FirstOrDefaultAsync(x => x.BookingRoomId == bookingRoomId && x.GuestId == guestId);
        if (bg == null) return ApiResponse<BookingDetailsDto>.Fail("Không tìm thấy khách trong phòng nguồn");

        bg.BookingRoomId = targetBookingRoomId;
        await _bookingGuestRepo.UpdateAsync(bg);
        await _bookingGuestRepo.SaveChangesAsync();

        var bookingId = fromRoom.BookingRoomType!.BookingId;
        return await GetByIdAsync(bookingId);
    }

    public async Task<ApiResponse<BookingDetailsDto>> SwapGuestsAsync(Guid bookingRoomId, Guid guestId, Guid targetBookingRoomId, Guid targetGuestId)
    {
        var fromRoom = await _bookingRoomRepo.Query().Include(br => br.BookingRoomType).FirstOrDefaultAsync(br => br.BookingRoomId == bookingRoomId);
        if (fromRoom == null) return ApiResponse<BookingDetailsDto>.Fail("Không tìm thấy phòng nguồn");
        var toRoom = await _bookingRoomRepo.Query().Include(br => br.BookingRoomType).FirstOrDefaultAsync(br => br.BookingRoomId == targetBookingRoomId);
        if (toRoom == null) return ApiResponse<BookingDetailsDto>.Fail("Không tìm thấy phòng đích");

        var bookingRoomTypeFrom = await _bookingRoomTypeRepo.Query()
            .Where(x => x.BookingRoomTypeId == fromRoom.BookingRoomTypeId)
            .FirstOrDefaultAsync();

        var bookingRoomTypeTo = await _bookingRoomTypeRepo.Query()
            .Where(x => x.BookingRoomTypeId == toRoom.BookingRoomTypeId)
            .FirstOrDefaultAsync();

        if (bookingRoomTypeFrom!.BookingId != bookingRoomTypeTo!.BookingId)
            return ApiResponse<BookingDetailsDto>.Fail("Phòng đích phải thuộc cùng booking");
        if (fromRoom.BookingRoomTypeId != toRoom.BookingRoomTypeId)
            return ApiResponse<BookingDetailsDto>.Fail("Phòng đích phải thuộc cùng loại phòng");

        var src = await _bookingGuestRepo.Query().FirstOrDefaultAsync(x => x.BookingRoomId == bookingRoomId && x.GuestId == guestId);
        if (src == null) return ApiResponse<BookingDetailsDto>.Fail("Không tìm thấy khách trong phòng nguồn");
        var dst = await _bookingGuestRepo.Query().FirstOrDefaultAsync(x => x.BookingRoomId == targetBookingRoomId && x.GuestId == targetGuestId);
        if (dst == null) return ApiResponse<BookingDetailsDto>.Fail("Không tìm thấy khách trong phòng đích");

        src.BookingRoomId = targetBookingRoomId;
        await _bookingGuestRepo.UpdateAsync(src);
        await _bookingGuestRepo.SaveChangesAsync();

        dst.BookingRoomId = bookingRoomId;
        await _bookingGuestRepo.UpdateAsync(dst);
        await _bookingGuestRepo.SaveChangesAsync();

        var bookingId = bookingRoomTypeFrom!.BookingId;
        return await GetByIdAsync(bookingId);
    }

    public async Task<ApiResponse<BookingDetailsDto>> ChangeRoomAsync(Guid bookingRoomId, Guid newRoomId)
    {
        var bookingRoom = await _bookingRoomRepo.Query().Include(br => br.BookingRoomType).FirstOrDefaultAsync(br => br.BookingRoomId == bookingRoomId);
        if (bookingRoom == null) return ApiResponse<BookingDetailsDto>.Fail("Không tìm thấy booking");

        var bookingRoomType = await _bookingRoomTypeRepo.Query()
            .Where(x => x.BookingRoomTypeId == bookingRoom.BookingRoomTypeId)
            .FirstOrDefaultAsync();

        var booking = await _bookingRepo.FindAsync(bookingRoomType!.BookingId);
        if (booking == null) return ApiResponse<BookingDetailsDto>.Fail("Không tìm thấy booking");

        var targetRoom = await _roomRepo.FindAsync(newRoomId);
        if (targetRoom == null || targetRoom.HotelId != booking.HotelId) return ApiResponse<BookingDetailsDto>.Fail("Phòng không hợp lệ");

        var overlap = await _bookingRoomRepo.Query()
            .Where(br => br.RoomId == newRoomId && br.BookingStatus != BookingRoomStatus.Cancelled && br.BookingRoomId != bookingRoomId)
            .AnyAsync(br => bookingRoom.StartDate < br.EndDate && bookingRoom.EndDate > br.StartDate);
        if (overlap) return ApiResponse<BookingDetailsDto>.Fail("Phòng không trống trong khoảng thời gian");

        var oldRoom = await _roomRepo.FindAsync(bookingRoom.RoomId);

        bookingRoom.RoomId = newRoomId;
        bookingRoom.RoomName = targetRoom.Number;
        await _bookingRoomRepo.UpdateAsync(bookingRoom);
        await _bookingRoomRepo.SaveChangesAsync();

        if (oldRoom != null)
        {
            oldRoom.Status = RoomStatus.Available;
            await _roomRepo.UpdateAsync(oldRoom);
            await _roomRepo.SaveChangesAsync();

            await _roomStatusLogRepo.AddAsync(new RoomStatusLog
            {
                Id = Guid.NewGuid(),
                HotelId = oldRoom.HotelId,
                RoomId = oldRoom.Id,
                Status = RoomStatus.Available,
                Timestamp = DateTime.UtcNow
            });
            await _roomStatusLogRepo.SaveChangesAsync();
        }

        targetRoom.Status = bookingRoom.BookingStatus == BookingRoomStatus.CheckedIn ? RoomStatus.Occupied : targetRoom.Status;
        await _roomRepo.UpdateAsync(targetRoom);
        await _roomRepo.SaveChangesAsync();

        await _roomStatusLogRepo.AddAsync(new RoomStatusLog
        {
            Id = Guid.NewGuid(),
            HotelId = targetRoom.HotelId,
            RoomId = targetRoom.Id,
            Status = targetRoom.Status,
            Timestamp = DateTime.UtcNow
        });
        await _roomStatusLogRepo.SaveChangesAsync();

        return await GetByIdAsync(booking.Id);
    }

    public async Task<ApiResponse> ExtendStayAsync(Guid bookingRoomId, DateTime newEndDate, string? discountCode)
    {
        var bookingRoom = await _bookingRoomRepo.Query()
            .Include(br => br.BookingRoomType).FirstOrDefaultAsync(br => br.BookingRoomId == bookingRoomId);
        if (bookingRoom == null) return ApiResponse.Fail("Không tìm thấy booking");

        if (newEndDate.Date <= bookingRoom.EndDate.Date) return ApiResponse.Fail("Ngày kết thúc không hợp lệ");

        var overlap = await _bookingRoomRepo.Query()
            .Where(br => br.RoomId == bookingRoom.RoomId && br.BookingStatus != BookingRoomStatus.Cancelled && br.BookingRoomId != bookingRoomId)
            .AnyAsync(br => bookingRoom.EndDate < br.EndDate && newEndDate > br.StartDate);
        if (overlap) return ApiResponse.Fail("Không thể gia hạn do trùng lịch");

        var bookingRoomType = await _bookingRoomTypeRepo.Query()
            .Where(x => x.BookingRoomTypeId == bookingRoom.BookingRoomTypeId)
            .FirstOrDefaultAsync();

        var nights = (newEndDate.Date - bookingRoom.EndDate.Date).Days;
        var pricePerNight = bookingRoomType?.Price;
        var delta = pricePerNight * nights;

        bookingRoom.ExtendedDate = newEndDate;
        //bookingRoom.EndDate = newEndDate;
        await _bookingRoomRepo.UpdateAsync(bookingRoom);
        await _bookingRoomRepo.SaveChangesAsync();

        var booking = await _bookingRepo.FindAsync(bookingRoomType!.BookingId);
        if (booking != null)
        {
            booking.TotalAmount += delta ?? 0;
            booking.LeftAmount += delta ?? 0;
            await _bookingRepo.UpdateAsync(booking);
            await _bookingRepo.SaveChangesAsync();
        }

        return ApiResponse.Ok();
    }

    public async Task<ApiResponse<CheckoutResultDto>> CheckOutAsync(Guid bookingId, CheckoutRequestDto dto)
    {
        var booking = await _bookingRepo.Query().Include(b => b.BookingRoomTypes).ThenInclude(rt => rt.BookingRooms).FirstOrDefaultAsync(b => b.Id == bookingId);
        if (booking == null) return ApiResponse<CheckoutResultDto>.Fail("Không tìm thấy booking");

        var lines = new List<InvoiceLine>();

        foreach (var rt in booking.BookingRoomTypes)
        {
            var totalNights = (rt.EndDate.Date - rt.StartDate.Date).Days;
            var amount = rt.Price * totalNights * Math.Max(rt.BookingRooms.Count, 1);
            lines.Add(new InvoiceLine
            {
                Id = Guid.NewGuid(),
                Description = rt.RoomTypeName ?? "Room charge",
                Amount = amount,
                SourceType = InvoiceLineSourceType.RoomCharge,
                SourceId = rt.BookingRoomTypeId
            });
        }

        var rules = await _surchargeRuleRepo.Query().Where(x => x.HotelId == booking.HotelId).ToListAsync();

        if (dto.EarlyCheckIn == true)
        {
            var rule = rules.FirstOrDefault(r => r.Type == SurchargeType.EarlyCheckIn);
            if (rule != null)
            {
                var amt = rule.IsPercentage ? Math.Round(lines.Sum(l => l.Amount) * rule.Amount / 100m, 2) : rule.Amount;
                lines.Add(new InvoiceLine
                {
                    Id = Guid.NewGuid(),
                    Description = "Early check-in",
                    Amount = amt,
                    SourceType = InvoiceLineSourceType.Surcharge
                });
            }
        }

        if (dto.LateCheckOut == true)
        {
            var rule = rules.FirstOrDefault(r => r.Type == SurchargeType.LateCheckOut);
            if (rule != null)
            {
                var amt = rule.IsPercentage ? Math.Round(lines.Sum(l => l.Amount) * rule.Amount / 100m, 2) : rule.Amount;
                lines.Add(new InvoiceLine
                {
                    Id = Guid.NewGuid(),
                    Description = "Late check-out",
                    Amount = amt,
                    SourceType = InvoiceLineSourceType.Surcharge
                });
            }
        }

        var capacityTotal = booking.BookingRoomTypes.Sum(rt => rt.Capacity * Math.Max(rt.BookingRooms.Count, 1));
        var guestCount = await _bookingGuestRepo.Query().Where(bg => booking.BookingRoomTypes.SelectMany(rt => rt.BookingRooms).Select(r => r.BookingRoomId).Contains(bg.BookingRoomId)).CountAsync();
        var extraGuests = Math.Max(guestCount - capacityTotal, 0);
        if (extraGuests > 0)
        {
            var rule = rules.FirstOrDefault(r => r.Type == SurchargeType.ExtraGuest);
            if (rule != null)
            {
                var amt = rule.IsPercentage ? Math.Round(lines.Sum(l => l.Amount) * rule.Amount / 100m, 2) : rule.Amount * extraGuests;
                lines.Add(new InvoiceLine
                {
                    Id = Guid.NewGuid(),
                    Description = "Extra guests",
                    Amount = amt,
                    SourceType = InvoiceLineSourceType.Surcharge
                });
            }
        }

        if (booking.DepositAmount > 0)
        {
            lines.Add(new InvoiceLine
            {
                Id = Guid.NewGuid(),
                Description = "Deposit deduction",
                Amount = -booking.DepositAmount,
                SourceType = InvoiceLineSourceType.Discount
            });
        }

        var invoice = new Invoice
        {
            Id = Guid.NewGuid(),
            HotelId = booking.HotelId,
            BookingId = booking.Id,
            InvoiceNumber = $"INV-{DateTime.UtcNow:yyMM}-{new Random().Next(100000, 999999)}",
            Status = InvoiceStatus.Draft,
            CreatedById = Guid.Empty,
            CreatedAt = DateTime.UtcNow,
            VatIncluded = true
        };

        foreach (var l in lines)
        {
            l.InvoiceId = invoice.Id;
            invoice.Lines.Add(l);
        }

        invoice.SubTotal = invoice.Lines.Where(x => x.Amount > 0).Sum(x => x.Amount);
        invoice.DiscountAmount = Math.Abs(invoice.Lines.Where(x => x.Amount < 0).Sum(x => x.Amount));
        invoice.TaxAmount = Math.Round(invoice.SubTotal * 0.1m, 2);
        invoice.TotalAmount = invoice.SubTotal - invoice.DiscountAmount + invoice.TaxAmount;

        await _invoiceRepo.AddAsync(invoice);
        await _invoiceRepo.SaveChangesAsync();

        var totalPaid = booking.DepositAmount + (dto.FinalPayment?.Amount ?? 0);
        invoice.PaidAmount = totalPaid;
        invoice.Status = totalPaid >= invoice.TotalAmount ? InvoiceStatus.Paid : InvoiceStatus.Issued;
        invoice.PaidAt = totalPaid >= invoice.TotalAmount ? DateTime.UtcNow : null;
        await _invoiceRepo.UpdateAsync(invoice);
        await _invoiceRepo.SaveChangesAsync();

        foreach (var br in booking.BookingRoomTypes.SelectMany(rt => rt.BookingRooms))
        {
            br.BookingStatus = BookingRoomStatus.CheckedOut;
            br.ActualCheckOutAt = dto.CheckoutTime ?? DateTime.UtcNow;
            await _bookingRoomRepo.UpdateAsync(br);
        }
        await _bookingRoomRepo.SaveChangesAsync();

        booking.Status = BookingStatus.Completed;
        await _bookingRepo.UpdateAsync(booking);
        await _bookingRepo.SaveChangesAsync();

        var rooms = booking.BookingRoomTypes.SelectMany(rt => rt.BookingRooms).Select(r => r.RoomId).Distinct().ToList();
        foreach (var roomId in rooms)
        {
            var room = await _roomRepo.FindAsync(roomId);
            if (room != null)
            {
                room.Status = RoomStatus.Dirty;
                await _roomRepo.UpdateAsync(room);
                await _roomRepo.SaveChangesAsync();

                await _roomStatusLogRepo.AddAsync(new RoomStatusLog
                {
                    Id = Guid.NewGuid(),
                    HotelId = room.HotelId,
                    RoomId = room.Id,
                    Status = RoomStatus.Dirty,
                    Timestamp = dto.CheckoutTime ?? DateTime.UtcNow
                });
                await _roomStatusLogRepo.SaveChangesAsync();
            }
        }

        var details = await GetByIdAsync(bookingId);
        if (!details.IsSuccess) return ApiResponse<CheckoutResultDto>.Fail(details.Message ?? "");

        return ApiResponse<CheckoutResultDto>.Ok(new CheckoutResultDto { TotalPaid = totalPaid, Booking = details.Data, CheckoutTime = dto.CheckoutTime ?? DateTime.UtcNow });
    }

    public async Task<ApiResponse<AdditionalChargesDto>> GetAdditionalChargesPreviewAsync(Guid bookingId)
    {
        var booking = await _bookingRepo.Query().Include(b => b.BookingRoomTypes).ThenInclude(rt => rt.BookingRooms).FirstOrDefaultAsync(b => b.Id == bookingId);
        if (booking == null) return ApiResponse<AdditionalChargesDto>.Fail("Không tìm thấy booking");

        var rules = await _surchargeRuleRepo.Query().Where(x => x.HotelId == booking.HotelId).ToListAsync();
        var lines = new List<AdditionalChargeLineDto>();

        var earlyRule = rules.FirstOrDefault(r => r.Type == SurchargeType.EarlyCheckIn);
        if (earlyRule != null)
        {
            var amt = earlyRule.IsPercentage ? 0 : earlyRule.Amount;
            lines.Add(new AdditionalChargeLineDto { Description = "Early check-in", Amount = amt, SourceType = InvoiceLineSourceType.Surcharge });
        }

        var lateRule = rules.FirstOrDefault(r => r.Type == SurchargeType.LateCheckOut);
        if (lateRule != null)
        {
            var amt = lateRule.IsPercentage ? 0 : lateRule.Amount;
            lines.Add(new AdditionalChargeLineDto { Description = "Late check-out", Amount = amt, SourceType = InvoiceLineSourceType.Surcharge });
        }

        var capacityTotal = booking.BookingRoomTypes.Sum(rt => rt.Capacity * Math.Max(rt.BookingRooms.Count, 1));
        var guestCount = await _bookingGuestRepo.Query().Where(bg => booking.BookingRoomTypes.SelectMany(rt => rt.BookingRooms).Select(r => r.BookingRoomId).Contains(bg.BookingRoomId)).CountAsync();
        var extraGuests = Math.Max(guestCount - capacityTotal, 0);
        var extraRule = rules.FirstOrDefault(r => r.Type == SurchargeType.ExtraGuest);
        if (extraRule != null && extraGuests > 0)
        {
            var amt = extraRule.IsPercentage ? 0 : extraRule.Amount * extraGuests;
            lines.Add(new AdditionalChargeLineDto { Description = "Extra guests", Amount = amt, SourceType = InvoiceLineSourceType.Surcharge });
        }

        var total = lines.Sum(l => l.Amount);
        return ApiResponse<AdditionalChargesDto>.Ok(new AdditionalChargesDto { Lines = lines, Total = total });
    }

    public async Task<ApiResponse> RecordMinibarConsumptionAsync(Guid bookingId, MinibarConsumptionDto dto)
    {
        var booking = await _bookingRepo.FindAsync(bookingId);
        if (booking == null) return ApiResponse.Fail("Không tìm thấy booking");

        foreach (var item in dto.Items)
        {
            var e = new MinibarBooking
            {
                Id = Guid.NewGuid(),
                BookingId = bookingId,
                MinibarId = item.MinibarId,
                ComsumedQuantity = item.Quantity
            };
            await _minibarBookingRepo.AddAsync(e);
        }
        await _minibarBookingRepo.SaveChangesAsync();

        return ApiResponse.Ok("Đã ghi nhận minibar");
    }
}