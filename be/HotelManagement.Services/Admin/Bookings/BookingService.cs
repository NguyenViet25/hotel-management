using HotelManagement.Domain;
using HotelManagement.Domain.Entities;
using HotelManagement.Repository;
using HotelManagement.Repository.Common;
using HotelManagement.Services.Admin.Bookings.Dtos;
using HotelManagement.Services.Common;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Services.Admin.Bookings;

public class BookingService : IBookingService
{
    private readonly ApplicationDbContext _db;
    private readonly IRepository<Booking> _bookingRepository;
    private readonly IRepository<Guest> _guestRepository;
    private readonly IRepository<Room> _roomRepository;
    private readonly IRepository<Hotel> _hotelRepository;
    private readonly IRepository<Payment> _paymentRepository;
    private readonly IRepository<CallLog> _callLogRepository;

    public BookingService(
        ApplicationDbContext db,
        IRepository<Booking> bookingRepository,
        IRepository<Guest> guestRepository,
        IRepository<Room> roomRepository,
        IRepository<Hotel> hotelRepository,
        IRepository<Payment> paymentRepository,
        IRepository<CallLog> callLogRepository)
    {
        _db = db;
        _bookingRepository = bookingRepository;
        _guestRepository = guestRepository;
        _roomRepository = roomRepository;
        _hotelRepository = hotelRepository;
        _paymentRepository = paymentRepository;
        _callLogRepository = callLogRepository;
    }

    // UC-31: Create booking with deposit
    public async Task<ApiResponse<BookingDto>> CreateAsync(CreateBookingDto dto, Guid staffUserId)
    {
        try
        {
            // Validate hotel exists
            var hotel = await _hotelRepository.FindAsync(dto.HotelId);
            if (hotel == null)
            {
                return ApiResponse<BookingDto>.Fail("Hotel not found");
            }

            // Validate room exists and belongs to hotel
            var room = await _roomRepository.Query()
                .Include(r => r.RoomType)
                .FirstOrDefaultAsync(r => r.Id == dto.RoomId && r.HotelId == dto.HotelId);

            if (room == null)
            {
                return ApiResponse<BookingDto>.Fail("Room not found or doesn't belong to this hotel");
            }

            // Validate room is available
            if (room.Status != RoomStatus.Available)
            {
                return ApiResponse<BookingDto>.Fail($"Room is currently {room.Status}");
            }

            // Validate dates
            if (dto.StartDate >= dto.EndDate)
            {
                return ApiResponse<BookingDto>.Fail("Start date must be before end date");
            }

            if (dto.StartDate < DateTime.UtcNow.Date)
            {
                return ApiResponse<BookingDto>.Fail("Start date cannot be in the past");
            }

            // Check for overlapping bookings
            var overlappingBooking = await _bookingRepository.Query()
                .Where(b => b.RoomId == dto.RoomId && 
                           b.Status != BookingStatus.Cancelled &&
                           ((dto.StartDate >= b.StartDate && dto.StartDate < b.EndDate) ||
                            (dto.EndDate > b.StartDate && dto.EndDate <= b.EndDate) ||
                            (dto.StartDate <= b.StartDate && dto.EndDate >= b.EndDate)))
                .FirstOrDefaultAsync();

            if (overlappingBooking != null)
            {
                return ApiResponse<BookingDto>.Fail("Room is already booked for the selected dates");
            }

            // Validate deposit amount
            if (dto.DepositAmount < 0)
            {
                return ApiResponse<BookingDto>.Fail("Deposit amount cannot be negative");
            }

            // Handle primary guest
            Guest primaryGuest;
            if (dto.PrimaryGuestId.HasValue)
            {
                primaryGuest = await _guestRepository.FindAsync(dto.PrimaryGuestId.Value);
                if (primaryGuest == null)
                {
                    return ApiResponse<BookingDto>.Fail("Primary guest not found");
                }
            }
            else if (dto.PrimaryGuest != null)
            {
                // Check if guest already exists by phone
                primaryGuest = await _guestRepository.Query()
                    .FirstOrDefaultAsync(g => g.Phone == dto.PrimaryGuest.Phone);

                if (primaryGuest == null)
                {
                    primaryGuest = new Guest
                    {
                        Id = Guid.NewGuid(),
                        FullName = dto.PrimaryGuest.FullName,
                        Phone = dto.PrimaryGuest.Phone,
                        Email = dto.PrimaryGuest.Email,
                        IdCardImageUrl = dto.PrimaryGuest.IdCardImageUrl
                    };
                    await _guestRepository.AddAsync(primaryGuest);
                }
            }
            else
            {
                return ApiResponse<BookingDto>.Fail("Primary guest information is required");
            }

            // Create booking
            var booking = new Booking
            {
                Id = Guid.NewGuid(),
                HotelId = dto.HotelId,
                RoomId = dto.RoomId,
                PrimaryGuestId = primaryGuest.Id,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Status = BookingStatus.Pending,
                DepositAmount = dto.DepositAmount,
                CreatedAt = DateTime.UtcNow
            };

            await _bookingRepository.AddAsync(booking);

            // Handle additional guests
            var additionalGuests = new List<Guest>();
            foreach (var guestDto in dto.AdditionalGuests)
            {
                var existingGuest = await _guestRepository.Query()
                    .FirstOrDefaultAsync(g => g.Phone == guestDto.Phone);

                Guest guest;
                if (existingGuest != null)
                {
                    guest = existingGuest;
                }
                else
                {
                    guest = new Guest
                    {
                        Id = Guid.NewGuid(),
                        FullName = guestDto.FullName,
                        Phone = guestDto.Phone,
                        Email = guestDto.Email,
                        IdCardImageUrl = guestDto.IdCardImageUrl
                    };
                    await _guestRepository.AddAsync(guest);
                }

                additionalGuests.Add(guest);

                // Create BookingGuest relationship
                var bookingGuest = new BookingGuest
                {
                    BookingId = booking.Id,
                    GuestId = guest.Id
                };
                _db.BookingGuests.Add(bookingGuest);
            }

            // Create deposit payment if provided
            if (dto.DepositPayment != null && dto.DepositPayment.Amount > 0)
            {
                var payment = new Payment
                {
                    Id = Guid.NewGuid(),
                    HotelId = dto.HotelId,
                    BookingId = booking.Id,
                    Amount = dto.DepositPayment.Amount,
                    Type = dto.DepositPayment.Type,
                    Timestamp = DateTime.UtcNow
                };
                await _paymentRepository.AddAsync(payment);
            }

            await _db.SaveChangesAsync();

            // Return booking details
            return await GetByIdAsync(booking.Id);
        }
        catch (Exception ex)
        {
            return ApiResponse<BookingDto>.Fail($"Error creating booking: {ex.Message}");
        }
    }

    public async Task<ApiResponse<BookingDto>> GetByIdAsync(Guid id)
    {
        try
        {
            var booking = await _bookingRepository.Query()
                .Include(b => b.Hotel)
                .Include(b => b.Room)
                    .ThenInclude(r => r.RoomType)
                .Include(b => b.PrimaryGuest)
                .Include(b => b.Guests)
                    .ThenInclude(bg => bg.Guest)
                .Include(b => b.CallLogs)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (booking == null)
            {
                return ApiResponse<BookingDto>.Fail("Booking not found");
            }

            // Get payments
            var payments = await _paymentRepository.Query()
                .Where(p => p.BookingId == id)
                .OrderBy(p => p.Timestamp)
                .ToListAsync();

            var bookingDto = new BookingDto
            {
                Id = booking.Id,
                HotelId = booking.HotelId,
                HotelName = booking.Hotel?.Name ?? "",
                RoomId = booking.RoomId,
                RoomNumber = booking.Room?.Number ?? "",
                RoomTypeName = booking.Room?.RoomType?.Name ?? "",
                StartDate = booking.StartDate,
                EndDate = booking.EndDate,
                Status = booking.Status,
                DepositAmount = booking.DepositAmount,
                CreatedAt = booking.CreatedAt,
                PrimaryGuest = booking.PrimaryGuest != null ? new GuestDto
                {
                    Id = booking.PrimaryGuest.Id,
                    FullName = booking.PrimaryGuest.FullName,
                    Phone = booking.PrimaryGuest.Phone,
                    Email = booking.PrimaryGuest.Email,
                    IdCardImageUrl = booking.PrimaryGuest.IdCardImageUrl
                } : null,
                AdditionalGuests = booking.Guests.Select(bg => new GuestDto
                {
                    Id = bg.Guest.Id,
                    FullName = bg.Guest.FullName,
                    Phone = bg.Guest.Phone,
                    Email = bg.Guest.Email,
                    IdCardImageUrl = bg.Guest.IdCardImageUrl
                }).ToList(),
                CallLogs = booking.CallLogs.Select(cl => new CallLogDto
                {
                    Id = cl.Id,
                    CallTime = cl.CallTime,
                    Result = cl.Result,
                    Notes = cl.Notes,
                    StaffName = null // TODO: Get staff name from StaffUserId
                }).OrderByDescending(cl => cl.CallTime).ToList(),
                Payments = payments.Select(p => new PaymentDto
                {
                    Id = p.Id,
                    Amount = p.Amount,
                    Type = p.Type,
                    Timestamp = p.Timestamp
                }).ToList()
            };

            return ApiResponse<BookingDto>.Ok(bookingDto);
        }
        catch (Exception ex)
        {
            return ApiResponse<BookingDto>.Fail($"Error retrieving booking: {ex.Message}");
        }
    }

    public async Task<ApiResponse<(List<BookingSummaryDto> Items, int Total)>> ListAsync(BookingsQueryDto query)
    {
        try
        {
            var baseQuery = _bookingRepository.Query()
                .Include(b => b.Room)
                    .ThenInclude(r => r.RoomType)
                .Include(b => b.PrimaryGuest)
                .Include(b => b.Guests)
                    .ThenInclude(bg => bg.Guest)
                .AsQueryable();

            // Apply filters
            if (query.HotelId.HasValue)
            {
                baseQuery = baseQuery.Where(b => b.HotelId == query.HotelId.Value);
            }

            if (query.Status.HasValue)
            {
                baseQuery = baseQuery.Where(b => b.Status == query.Status.Value);
            }

            if (query.StartDate.HasValue)
            {
                baseQuery = baseQuery.Where(b => b.StartDate >= query.StartDate.Value);
            }

            if (query.EndDate.HasValue)
            {
                baseQuery = baseQuery.Where(b => b.EndDate <= query.EndDate.Value);
            }

            if (!string.IsNullOrWhiteSpace(query.GuestName))
            {
                var guestName = query.GuestName.ToLower();
                baseQuery = baseQuery.Where(b => b.PrimaryGuest != null && 
                    b.PrimaryGuest.FullName.ToLower().Contains(guestName));
            }

            if (!string.IsNullOrWhiteSpace(query.RoomNumber))
            {
                var roomNumber = query.RoomNumber.ToLower();
                baseQuery = baseQuery.Where(b => b.Room != null && 
                    b.Room.Number.ToLower().Contains(roomNumber));
            }

            // Apply sorting
            baseQuery = (query.SortBy?.ToLower(), query.SortDir?.ToLower()) switch
            {
                ("startdate", "asc") => baseQuery.OrderBy(b => b.StartDate),
                ("startdate", "desc") => baseQuery.OrderByDescending(b => b.StartDate),
                ("enddate", "asc") => baseQuery.OrderBy(b => b.EndDate),
                ("enddate", "desc") => baseQuery.OrderByDescending(b => b.EndDate),
                ("status", "asc") => baseQuery.OrderBy(b => b.Status),
                ("status", "desc") => baseQuery.OrderByDescending(b => b.Status),
                ("createdat", "asc") => baseQuery.OrderBy(b => b.CreatedAt),
                _ => baseQuery.OrderByDescending(b => b.CreatedAt)
            };

            var total = await baseQuery.CountAsync();
            var items = await baseQuery
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .Select(b => new BookingSummaryDto
                {
                    Id = b.Id,
                    RoomId = b.RoomId,
                    RoomNumber = b.Room != null ? b.Room.Number : "",
                    RoomTypeName = b.Room != null && b.Room.RoomType != null ? b.Room.RoomType.Name : "",
                    StartDate = b.StartDate,
                    EndDate = b.EndDate,
                    Status = b.Status,
                    DepositAmount = b.DepositAmount,
                    PrimaryGuestName = b.PrimaryGuest != null ? b.PrimaryGuest.FullName : "",
                    TotalGuests = (b.PrimaryGuest != null ? 1 : 0) + b.Guests.Count,
                    CreatedAt = b.CreatedAt
                })
                .ToListAsync();

            return ApiResponse<(List<BookingSummaryDto>, int)>.Ok((items, total));
        }
        catch (Exception ex)
        {
            return ApiResponse<(List<BookingSummaryDto>, int)>.Fail($"Error listing bookings: {ex.Message}");
        }
    }

    // UC-32: Call confirmation
    public async Task<ApiResponse<CallLogDto>> CreateCallLogAsync(Guid bookingId, CreateCallLogDto dto, Guid staffUserId)
    {
        try
        {
            var booking = await _bookingRepository.FindAsync(bookingId);
            if (booking == null)
            {
                return ApiResponse<CallLogDto>.Fail("Booking not found");
            }

            var callLog = new CallLog
            {
                Id = Guid.NewGuid(),
                BookingId = bookingId,
                CallTime = dto.CallTime ?? DateTime.UtcNow,
                Result = dto.Result,
                Notes = dto.Notes,
                StaffUserId = staffUserId
            };

            await _callLogRepository.AddAsync(callLog);

            // Update booking status based on call result
            if (dto.Result == CallResult.Confirmed && booking.Status == BookingStatus.Pending)
            {
                booking.Status = BookingStatus.Confirmed;
                await _bookingRepository.UpdateAsync(booking);
            }
            else if (dto.Result == CallResult.Cancelled)
            {
                booking.Status = BookingStatus.Cancelled;
                await _bookingRepository.UpdateAsync(booking);
            }

            await _db.SaveChangesAsync();

            var callLogDto = new CallLogDto
            {
                Id = callLog.Id,
                CallTime = callLog.CallTime,
                Result = callLog.Result,
                Notes = callLog.Notes,
                StaffName = null // TODO: Get staff name from StaffUserId
            };

            return ApiResponse<CallLogDto>.Ok(callLogDto);
        }
        catch (Exception ex)
        {
            return ApiResponse<CallLogDto>.Fail($"Error creating call log: {ex.Message}");
        }
    }

    public async Task<ApiResponse<List<CallLogDto>>> GetCallLogsAsync(Guid bookingId)
    {
        try
        {
            var booking = await _bookingRepository.FindAsync(bookingId);
            if (booking == null)
            {
                return ApiResponse<List<CallLogDto>>.Fail("Booking not found");
            }

            var callLogs = await _callLogRepository.Query()
                .Where(cl => cl.BookingId == bookingId)
                .OrderByDescending(cl => cl.CallTime)
                .Select(cl => new CallLogDto
                {
                    Id = cl.Id,
                    CallTime = cl.CallTime,
                    Result = cl.Result,
                    Notes = cl.Notes,
                    StaffName = null // TODO: Get staff name from StaffUserId
                })
                .ToListAsync();

            return ApiResponse<List<CallLogDto>>.Ok(callLogs);
        }
        catch (Exception ex)
        {
            return ApiResponse<List<CallLogDto>>.Fail($"Error retrieving call logs: {ex.Message}");
        }
    }

    // UC-33: Update/Cancel booking
    public async Task<ApiResponse<BookingDto>> UpdateAsync(Guid id, UpdateBookingDto dto, Guid staffUserId)
    {
        try
        {
            var booking = await _bookingRepository.Query()
                .Include(b => b.Guests)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (booking == null)
            {
                return ApiResponse<BookingDto>.Fail("Booking not found");
            }

            if (booking.Status == BookingStatus.Cancelled)
            {
                return ApiResponse<BookingDto>.Fail("Cannot update cancelled booking");
            }

            // Update room if provided
            if (dto.RoomId.HasValue && dto.RoomId.Value != booking.RoomId)
            {
                var room = await _roomRepository.Query()
                    .FirstOrDefaultAsync(r => r.Id == dto.RoomId.Value && r.HotelId == booking.HotelId);

                if (room == null)
                {
                    return ApiResponse<BookingDto>.Fail("Room not found or doesn't belong to this hotel");
                }

                if (room.Status != RoomStatus.Available)
                {
                    return ApiResponse<BookingDto>.Fail($"Room is currently {room.Status}");
                }

                // Check for overlapping bookings on new room
                var startDate = dto.StartDate ?? booking.StartDate;
                var endDate = dto.EndDate ?? booking.EndDate;

                var overlappingBooking = await _bookingRepository.Query()
                    .Where(b => b.RoomId == dto.RoomId.Value && 
                               b.Id != id &&
                               b.Status != BookingStatus.Cancelled &&
                               ((startDate >= b.StartDate && startDate < b.EndDate) ||
                                (endDate > b.StartDate && endDate <= b.EndDate) ||
                                (startDate <= b.StartDate && endDate >= b.EndDate)))
                    .FirstOrDefaultAsync();

                if (overlappingBooking != null)
                {
                    return ApiResponse<BookingDto>.Fail("Room is already booked for the selected dates");
                }

                booking.RoomId = dto.RoomId.Value;
            }

            // Update dates if provided
            if (dto.StartDate.HasValue)
            {
                if (dto.StartDate.Value >= (dto.EndDate ?? booking.EndDate))
                {
                    return ApiResponse<BookingDto>.Fail("Start date must be before end date");
                }
                booking.StartDate = dto.StartDate.Value;
            }

            if (dto.EndDate.HasValue)
            {
                if ((dto.StartDate ?? booking.StartDate) >= dto.EndDate.Value)
                {
                    return ApiResponse<BookingDto>.Fail("End date must be after start date");
                }
                booking.EndDate = dto.EndDate.Value;
            }

            // Update primary guest if provided
            if (dto.PrimaryGuestId.HasValue)
            {
                var guest = await _guestRepository.FindAsync(dto.PrimaryGuestId.Value);
                if (guest == null)
                {
                    return ApiResponse<BookingDto>.Fail("Primary guest not found");
                }
                booking.PrimaryGuestId = dto.PrimaryGuestId.Value;
            }
            else if (dto.PrimaryGuest != null)
            {
                var existingGuest = await _guestRepository.Query()
                    .FirstOrDefaultAsync(g => g.Phone == dto.PrimaryGuest.Phone);

                Guest primaryGuest;
                if (existingGuest != null)
                {
                    primaryGuest = existingGuest;
                }
                else
                {
                    primaryGuest = new Guest
                    {
                        Id = Guid.NewGuid(),
                        FullName = dto.PrimaryGuest.FullName,
                        Phone = dto.PrimaryGuest.Phone,
                        Email = dto.PrimaryGuest.Email,
                        IdCardImageUrl = dto.PrimaryGuest.IdCardImageUrl
                    };
                    await _guestRepository.AddAsync(primaryGuest);
                }

                booking.PrimaryGuestId = primaryGuest.Id;
            }

            // Update deposit amount if provided
            if (dto.DepositAmount.HasValue)
            {
                if (dto.DepositAmount.Value < 0)
                {
                    return ApiResponse<BookingDto>.Fail("Deposit amount cannot be negative");
                }
                booking.DepositAmount = dto.DepositAmount.Value;
            }

            // Update additional guests if provided
            if (dto.AdditionalGuests != null)
            {
                // Remove existing guest relationships
                var existingBookingGuests = _db.BookingGuests.Where(bg => bg.BookingId == id);
                _db.BookingGuests.RemoveRange(existingBookingGuests);

                // Add new guest relationships
                foreach (var guestDto in dto.AdditionalGuests)
                {
                    var existingGuest = await _guestRepository.Query()
                        .FirstOrDefaultAsync(g => g.Phone == guestDto.Phone);

                    Guest guest;
                    if (existingGuest != null)
                    {
                        guest = existingGuest;
                    }
                    else
                    {
                        guest = new Guest
                        {
                            Id = Guid.NewGuid(),
                            FullName = guestDto.FullName,
                            Phone = guestDto.Phone,
                            Email = guestDto.Email,
                            IdCardImageUrl = guestDto.IdCardImageUrl
                        };
                        await _guestRepository.AddAsync(guest);
                    }

                    var bookingGuest = new BookingGuest
                    {
                        BookingId = booking.Id,
                        GuestId = guest.Id
                    };
                    _db.BookingGuests.Add(bookingGuest);
                }
            }

            await _bookingRepository.UpdateAsync(booking);
            await _db.SaveChangesAsync();

            return await GetByIdAsync(id);
        }
        catch (Exception ex)
        {
            return ApiResponse<BookingDto>.Fail($"Error updating booking: {ex.Message}");
        }
    }

    public async Task<ApiResponse<BookingDto>> CancelAsync(Guid id, CancelBookingDto dto, Guid staffUserId)
    {
        try
        {
            var booking = await _bookingRepository.FindAsync(id);
            if (booking == null)
            {
                return ApiResponse<BookingDto>.Fail("Booking not found");
            }

            if (booking.Status == BookingStatus.Cancelled)
            {
                return ApiResponse<BookingDto>.Fail("Booking is already cancelled");
            }

            // Validate refund and deduct amounts
            var totalRefundAndDeduct = dto.RefundAmount + (dto.DeductAmount ?? 0);
            if (totalRefundAndDeduct > booking.DepositAmount)
            {
                return ApiResponse<BookingDto>.Fail("Refund and deduct amounts cannot exceed deposit amount");
            }

            // Update booking status
            booking.Status = BookingStatus.Cancelled;
            await _bookingRepository.UpdateAsync(booking);

            // Create refund payment if amount > 0
            if (dto.RefundAmount > 0)
            {
                var refundPayment = new Payment
                {
                    Id = Guid.NewGuid(),
                    HotelId = booking.HotelId,
                    BookingId = booking.Id,
                    Amount = dto.RefundAmount,
                    Type = PaymentType.Refund,
                    Timestamp = DateTime.UtcNow
                };
                await _paymentRepository.AddAsync(refundPayment);
            }

            // TODO: Handle deduct amount - create invoice line for deposit forfeiture
            // This would require Invoice and InvoiceLine entities to be properly set up

            // Update room status back to available if needed
            var room = await _roomRepository.FindAsync(booking.RoomId);
            if (room != null && room.Status == RoomStatus.Occupied)
            {
                room.Status = RoomStatus.Available;
                await _roomRepository.UpdateAsync(room);
            }

            await _db.SaveChangesAsync();

            return await GetByIdAsync(id);
        }
        catch (Exception ex)
        {
            return ApiResponse<BookingDto>.Fail($"Error cancelling booking: {ex.Message}");
        }
    }

    // UC-34: Room availability
    public async Task<ApiResponse<List<RoomAvailabilityDto>>> GetRoomAvailabilityAsync(RoomAvailabilityQueryDto query)
    {
        try
        {
            var rooms = await _roomRepository.Query()
                .Include(r => r.RoomType)
                .Where(r => r.HotelId == query.HotelId)
                .OrderBy(r => r.Number)
                .ToListAsync();

            var bookings = await _bookingRepository.Query()
                .Include(b => b.PrimaryGuest)
                .Where(b => b.HotelId == query.HotelId &&
                           b.Status != BookingStatus.Cancelled &&
                           b.StartDate < query.To &&
                           b.EndDate > query.From)
                .ToListAsync();

            var roomAvailabilities = rooms.Select(room => new RoomAvailabilityDto
            {
                RoomId = room.Id,
                RoomNumber = room.Number,
                Floor = room.Floor,
                CurrentStatus = room.Status,
                RoomTypeName = room.RoomType?.Name ?? "",
                BookingIntervals = bookings
                    .Where(b => b.RoomId == room.Id)
                    .Select(b => new BookingIntervalDto
                    {
                        Start = b.StartDate,
                        End = b.EndDate,
                        BookingId = b.Id,
                        Status = b.Status,
                        PrimaryGuestName = b.PrimaryGuest?.FullName ?? "",
                        DepositAmount = b.DepositAmount
                    })
                    .OrderBy(bi => bi.Start)
                    .ToList()
            }).ToList();

            return ApiResponse<List<RoomAvailabilityDto>>.Ok(roomAvailabilities);
        }
        catch (Exception ex)
        {
            return ApiResponse<List<RoomAvailabilityDto>>.Fail($"Error retrieving room availability: {ex.Message}");
        }
    }

    public async Task<ApiResponse<List<BookingIntervalDto>>> GetRoomScheduleAsync(Guid roomId, DateTime from, DateTime to)
    {
        try
        {
            var room = await _roomRepository.FindAsync(roomId);
            if (room == null)
            {
                return ApiResponse<List<BookingIntervalDto>>.Fail("Room not found");
            }

            var bookings = await _bookingRepository.Query()
                .Include(b => b.PrimaryGuest)
                .Where(b => b.RoomId == roomId &&
                           b.Status != BookingStatus.Cancelled &&
                           b.StartDate < to &&
                           b.EndDate > from)
                .OrderBy(b => b.StartDate)
                .Select(b => new BookingIntervalDto
                {
                    Start = b.StartDate,
                    End = b.EndDate,
                    BookingId = b.Id,
                    Status = b.Status,
                    PrimaryGuestName = b.PrimaryGuest != null ? b.PrimaryGuest.FullName : "",
                    DepositAmount = b.DepositAmount
                })
                .ToListAsync();

            return ApiResponse<List<BookingIntervalDto>>.Ok(bookings);
        }
        catch (Exception ex)
        {
            return ApiResponse<List<BookingIntervalDto>>.Fail($"Error retrieving room schedule: {ex.Message}");
        }
    }
}