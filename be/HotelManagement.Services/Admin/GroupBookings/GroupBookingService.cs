using HotelManagement.Domain;
using HotelManagement.Repository.Common;
using HotelManagement.Services.Admin.Bookings.Dtos;
using HotelManagement.Services.Common;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Services.Admin.GroupBookings;

public class GroupBookingService : IGroupBookingService
{
    private readonly IRepository<Booking> _bookingRepository;
    private readonly IRepository<BookingGuest> _bookingGuestRepository;
    private readonly IRepository<Guest> _guestRepository;
    private readonly IRepository<HotelRoom> _roomRepository;
    private readonly IRepository<Payment> _paymentRepository;

    public GroupBookingService(
        IRepository<Booking> bookingRepository,
        IRepository<BookingGuest> bookingGuestRepository,
        IRepository<Guest> guestRepository,
        IRepository<HotelRoom> roomRepository,
        IRepository<Payment> paymentRepository)
    {
        _bookingRepository = bookingRepository;
        _bookingGuestRepository = bookingGuestRepository;
        _guestRepository = guestRepository;
        _roomRepository = roomRepository;
        _paymentRepository = paymentRepository;
    }

    public async Task<ApiResponse<GroupBookingDto>> CreateAsync(CreateGroupBookingDto dto)
    {
        try
        {
            var groupCode = string.IsNullOrWhiteSpace(dto.GroupCode)
                ? $"GRP-{DateTime.UtcNow:yyyyMMddHHmmss}-{Guid.NewGuid().ToString()[..6]}"
                : dto.GroupCode!;

            var roomIds = dto.Rooms.Select(r => r.RoomId).ToList();
            var rooms = await _roomRepository.Query()
                .Where(r => roomIds.Contains(r.Id))
                .ToListAsync();

            if (rooms.Count != dto.Rooms.Count)
            {
                return ApiResponse<GroupBookingDto>.Fail("One or more rooms not found");
            }

            // Check availability for each requested room interval
            foreach (var rr in dto.Rooms)
            {
                var hasConflict = await _bookingRepository.Query()
                    .Where(b => b.RoomId == rr.RoomId && b.Status != BookingStatus.Cancelled)
                    .AnyAsync(b => b.StartDate < rr.EndDate && rr.StartDate < b.EndDate);
                if (hasConflict)
                {
                    return ApiResponse<GroupBookingDto>.Fail("One or more rooms are not available for the selected dates");
                }
            }

            var createdBookings = new List<Booking>();

            // Create a primary contact (not persisted as a special entity; used in response)
            var primaryContactDto = dto.PrimaryContact;

            foreach (var rr in dto.Rooms)
            {
                // Resolve primary guest for this room
                Guest? primaryGuest = null;
                if (rr.PrimaryGuestId.HasValue)
                {
                    primaryGuest = await _guestRepository.FindAsync(rr.PrimaryGuestId.Value);
                    if (primaryGuest == null)
                    {
                        return ApiResponse<GroupBookingDto>.Fail("Primary guest not found");
                    }
                }
                else if (rr.PrimaryGuest != null)
                {
                    primaryGuest = new Guest
                    {
                        FullName = rr.PrimaryGuest.FullName,
                        Phone = rr.PrimaryGuest.Phone,
                        Email = rr.PrimaryGuest.Email,
                        IdCardImageUrl = rr.PrimaryGuest.IdCardImageUrl
                    };
                    await _guestRepository.AddAsync(primaryGuest);
                }

                var booking = new Booking
                {
                    HotelId = dto.HotelId,
                    RoomId = rr.RoomId,
                    PrimaryGuestId = primaryGuest?.Id,
                    StartDate = rr.StartDate,
                    EndDate = rr.EndDate,
                    Status = BookingStatus.Confirmed,
                    DepositAmount = rr.DepositAmount,
                    CreatedAt = DateTime.UtcNow
                };

                await _bookingRepository.AddAsync(booking);
                createdBookings.Add(booking);

                // Add additional guests
                foreach (var g in rr.AdditionalGuests)
                {
                    var guest = new Guest
                    {
                        FullName = g.FullName,
                        Phone = g.Phone,
                        Email = g.Email,
                        IdCardImageUrl = g.IdCardImageUrl
                    };
                    await _guestRepository.AddAsync(guest);
                    await _bookingGuestRepository.AddAsync(new BookingGuest
                    {
                        BookingId = booking.Id,
                        GuestId = guest.Id
                    });
                }

                // Deposit payment per booking
                if (rr.DepositPayment != null && rr.DepositPayment.Amount > 0)
                {
                    var payment = new Payment
                    {
                        HotelId = dto.HotelId,
                        BookingId = booking.Id,
                        Amount = rr.DepositPayment.Amount,
                        Type = rr.DepositPayment.Type,
                        Timestamp = DateTime.UtcNow
                    };
                    await _paymentRepository.AddAsync(payment);
                }
            }

            // Persist all changes
            await _bookingRepository.SaveChangesAsync();

            // Build response
            var bookingsWithRooms = await _bookingRepository.Query()
                .Include(b => b.Room)
                .Include(b => b.PrimaryGuest)
                .Where(b => createdBookings.Select(cb => cb.Id).Contains(b.Id))
                .ToListAsync();

            var bookingSummaries = bookingsWithRooms.Select(b => new BookingSummaryDto
            {
                Id = b.Id,
                RoomId = b.RoomId,
                RoomNumber = b.Room?.Number ?? string.Empty,
                RoomTypeName = b.Room?.RoomType?.Name ?? string.Empty,
                StartDate = b.StartDate,
                EndDate = b.EndDate,
                Status = b.Status,
                DepositAmount = b.DepositAmount,
                PrimaryGuestName = b.PrimaryGuest?.FullName ?? string.Empty,
                TotalGuests = (b.PrimaryGuest != null ? 1 : 0) + _bookingGuestRepository.Query().Count(bg => bg.BookingId == b.Id),
                CreatedAt = b.CreatedAt
            }).ToList();

            var resultDto = new GroupBookingDto
            {
                Id = Guid.NewGuid(),
                GroupCode = groupCode,
                HotelId = dto.HotelId,
                HotelName = string.Empty,
                PrimaryContact = new GuestDto
                {
                    Id = Guid.Empty,
                    FullName = primaryContactDto.FullName,
                    Phone = primaryContactDto.Phone,
                    Email = primaryContactDto.Email,
                    IdCardImageUrl = primaryContactDto.IdCardImageUrl
                },
                Bookings = bookingSummaries,
                CreatedAt = DateTime.UtcNow,
                Notes = dto.Notes
            };

            return ApiResponse<GroupBookingDto>.Ok(resultDto, "Group booking created successfully");
        }
        catch (Exception ex)
        {
            return ApiResponse<GroupBookingDto>.Fail($"Error creating group booking: {ex.Message}");
        }
    }

    public async Task<ApiResponse<GroupBookingDto>> GetByIdAsync(Guid id)
    {
        // Interpret id as a BookingId and return a single-booking group summary
        var booking = await _bookingRepository.Query()
            .Include(b => b.Room)
            .Include(b => b.PrimaryGuest)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (booking == null)
        {
            return ApiResponse<GroupBookingDto>.Fail("Booking not found");
        }

        var summary = new BookingSummaryDto
        {
            Id = booking.Id,
            RoomId = booking.RoomId,
            RoomNumber = booking.Room?.Number ?? string.Empty,
            RoomTypeName = booking.Room?.RoomType?.Name ?? string.Empty,
            StartDate = booking.StartDate,
            EndDate = booking.EndDate,
            Status = booking.Status,
            DepositAmount = booking.DepositAmount,
            PrimaryGuestName = booking.PrimaryGuest?.FullName ?? string.Empty,
            TotalGuests = (booking.PrimaryGuest != null ? 1 : 0) + await _bookingGuestRepository.Query().Where(bg => bg.BookingId == booking.Id).CountAsync(),
            CreatedAt = booking.CreatedAt
        };

        var dto = new GroupBookingDto
        {
            Id = Guid.NewGuid(),
            GroupCode = string.Empty,
            HotelId = booking.HotelId,
            HotelName = string.Empty,
            PrimaryContact = new GuestDto { Id = booking.PrimaryGuestId ?? Guid.Empty, FullName = booking.PrimaryGuest?.FullName ?? string.Empty, Phone = booking.PrimaryGuest?.Phone ?? string.Empty, Email = booking.PrimaryGuest?.Email, IdCardImageUrl = booking.PrimaryGuest?.IdCardImageUrl },
            Bookings = new List<BookingSummaryDto> { summary },
            CreatedAt = booking.CreatedAt
        };

        return ApiResponse<GroupBookingDto>.Ok(dto);
    }

    public async Task<ApiResponse<List<GroupBookingDto>>> ListAsync(Guid hotelId, int page = 1, int pageSize = 10)
    {
        var bookings = await _bookingRepository.Query()
            .Include(b => b.Room)
            .Include(b => b.PrimaryGuest)
            .Where(b => b.HotelId == hotelId)
            .OrderByDescending(b => b.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var groups = bookings.Select(b => new GroupBookingDto
        {
            Id = Guid.NewGuid(),
            GroupCode = string.Empty,
            HotelId = b.HotelId,
            HotelName = string.Empty,
            PrimaryContact = new GuestDto { Id = b.PrimaryGuestId ?? Guid.Empty, FullName = b.PrimaryGuest?.FullName ?? string.Empty, Phone = b.PrimaryGuest?.Phone ?? string.Empty, Email = b.PrimaryGuest?.Email, IdCardImageUrl = b.PrimaryGuest?.IdCardImageUrl },
            Bookings = new List<BookingSummaryDto>
            {
                new BookingSummaryDto
                {
                    Id = b.Id,
                    RoomId = b.RoomId,
                    RoomNumber = b.Room?.Number ?? string.Empty,
                    RoomTypeName = b.Room?.RoomType?.Name ?? string.Empty,
                    StartDate = b.StartDate,
                    EndDate = b.EndDate,
                    Status = b.Status,
                    DepositAmount = b.DepositAmount,
                    PrimaryGuestName = b.PrimaryGuest?.FullName ?? string.Empty,
                    TotalGuests = (b.PrimaryGuest != null ? 1 : 0) + _bookingGuestRepository.Query().Count(bg => bg.BookingId == b.Id),
                    CreatedAt = b.CreatedAt
                }
            },
            CreatedAt = b.CreatedAt
        }).ToList();

        return ApiResponse<List<GroupBookingDto>>.Ok(groups);
    }
}