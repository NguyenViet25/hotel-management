using HotelManagement.Domain;
using HotelManagement.Repository;
using HotelManagement.Services.Common;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Services.Admin.Guests;

public interface IGuestsService
{
    Task<(IEnumerable<GuestDetailsDto> Items, int Total)> ListAsync(GuestsQueryDto query, Guid hotelId);
    Task<GuestDetailsDto?> GetAsync(Guid id);
    Task<ApiResponse<GuestDetailsDto>> CreateAsync(CreateGuestDto dto, Guid hotelId);
    Task<ApiResponse<GuestDetailsDto>> UpdateAsync(Guid id, UpdateGuestDto dto);
}

public class GuestsService : IGuestsService
{
    private readonly ApplicationDbContext _db;
    public GuestsService(ApplicationDbContext db) { _db = db; }

    public async Task<(IEnumerable<GuestDetailsDto> Items, int Total)> ListAsync(GuestsQueryDto query, Guid hotelId)
    {
        var baseQuery = _db.Guests.Where(x => x.HotelId == hotelId).AsQueryable();

        if (query.FromDate.HasValue || query.ToDate.HasValue)
        {
            var from = query.FromDate;
            var to = query.ToDate;
            var bookingQuery = _db.Bookings.Where(b => b.HotelId == hotelId && b.PrimaryGuestId.HasValue);
            if (from.HasValue && to.HasValue)
                bookingQuery = bookingQuery.Where(b => from.Value < b.EndDate && to.Value > b.StartDate);
            else if (from.HasValue)
                bookingQuery = bookingQuery.Where(b => from.Value < b.EndDate);
            else if (to.HasValue)
                bookingQuery = bookingQuery.Where(b => to.Value > b.StartDate);

            var primaryGuestIds = await bookingQuery
                .Select(b => b.PrimaryGuestId!.Value)
                .Distinct()
                .ToListAsync();

            baseQuery = baseQuery.Where(g => primaryGuestIds.Contains(g.Id));
        }

        if (!string.IsNullOrWhiteSpace(query.Name))
        {
            var s = query.Name.ToLower();
            baseQuery = baseQuery.Where(g => g.FullName.ToLower().Contains(s)
                || g.Phone.Contains(s)
                || (g.Email ?? "").ToLower().Contains(s)
                || g.IdCard.Contains(s));
        }

        baseQuery = (query.SortBy?.ToLower(), query.SortDir?.ToLower()) switch
        {
            ("fullname", "asc") => baseQuery.OrderBy(g => g.FullName),
            ("fullname", "desc") => baseQuery.OrderByDescending(g => g.FullName),
            ("phone", "asc") => baseQuery.OrderBy(g => g.Phone),
            ("phone", "desc") => baseQuery.OrderByDescending(g => g.Phone),
            _ => baseQuery.OrderBy(g => g.FullName)
        };

        var total = await baseQuery.CountAsync();
        var items = await baseQuery
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(g => new GuestDetailsDto
            {
                Id = g.Id,
                FullName = g.FullName,
                Phone = g.Phone,
                Email = g.Email,
                IdCard = g.IdCard,
                IdCardBackImageUrl = g.IdCardBackImageUrl,
                IdCardFrontImageUrl = g.IdCardFrontImageUrl,
            })
            .ToListAsync();

        return (items, total);
    }

    public async Task<GuestDetailsDto?> GetAsync(Guid id)
    {
        var g = await _db.Guests.FirstOrDefaultAsync(x => x.Id == id);
        if (g == null) return null;

        var dto = new GuestDetailsDto
        {
            Id = g.Id,
            FullName = g.FullName,
            Phone = g.Phone,
            Email = g.Email,
            IdCard = g.IdCard,
            IdCardFrontImageUrl = g.IdCardFrontImageUrl,
            IdCardBackImageUrl = g.IdCardBackImageUrl
        };

        var guestRoomLinks = await _db.Set<BookingGuest>()
            .Where(bg => bg.GuestId == id)
            .Select(bg => bg.BookingRoomId)
            .Distinct()
            .ToListAsync();
        if (guestRoomLinks.Count > 0)
        {
            var rooms = await _db.Set<BookingRoom>()
                .Where(br => guestRoomLinks.Contains(br.BookingRoomId))
                .ToListAsync();
            var brtIds = rooms.Select(r => r.BookingRoomTypeId).Distinct().ToList();
            var roomTypeLinks = await _db.Set<BookingRoomType>()
                .Where(rt => brtIds.Contains(rt.BookingRoomTypeId))
                .Select(rt => new { rt.BookingRoomTypeId, rt.BookingId })
                .ToListAsync();
            var bookingIdMap = roomTypeLinks.ToDictionary(x => x.BookingRoomTypeId, x => x.BookingId);

            var hotelRoomIds = rooms.Select(r => r.RoomId).Distinct().ToList();
            var hotelRooms = await _db.Rooms.Where(r => hotelRoomIds.Contains(r.Id)).ToListAsync();
            var roomNumMap = hotelRooms.ToDictionary(r => r.Id, r => r.Number);

            dto.Rooms = rooms.Select(r => new GuestRoomStayDto
            {
                BookingRoomId = r.BookingRoomId,
                RoomId = r.RoomId,
                RoomNumber = roomNumMap.TryGetValue(r.RoomId, out var num) ? num : null,
                StartDate = r.ActualCheckInAt ?? r.StartDate,
                EndDate = r.ActualCheckOutAt ?? r.EndDate,
                Status = r.BookingStatus,
                BookingId = bookingIdMap.TryGetValue(r.BookingRoomTypeId, out var bid) ? bid : Guid.Empty
            }).ToList();

            var bookingIds = dto.Rooms.Select(x => x.BookingId).Where(b => b != Guid.Empty).Distinct().ToList();
            if (bookingIds.Count > 0)
            {
                var orders = await _db.Orders.Where(o => o.BookingId.HasValue && bookingIds.Contains(o.BookingId.Value) || o.CustomerPhone == g.Phone).ToListAsync();
                var orderIds = orders.Select(o => o.Id).ToList();
                var items = await _db.OrderItems.Where(oi => orderIds.Contains(oi.OrderId)).ToListAsync();
                var itemMap = items.GroupBy(i => i.OrderId).ToDictionary(gp => gp.Key, gp => gp.ToList());

                dto.Orders = orders.Select(o => new GuestOrderDto
                {
                    OrderId = o.Id,
                    BookingId = o.BookingId,
                    Status = o.Status,
                    CreatedAt = o.CreatedAt,
                    Items = (itemMap.TryGetValue(o.Id, out var list) ? list : new List<OrderItem>())
                        .Select(i => new GuestOrderItemDto
                        {
                            Id = i.Id,
                            Name = i.Name,
                            Quantity = i.Quantity,
                            UnitPrice = i.UnitPrice,
                            Status = i.Status
                        }).ToList()
                }).ToList();
            }
        }

        return dto;
    }

    public async Task<ApiResponse<GuestDetailsDto>> CreateAsync(CreateGuestDto dto, Guid hotelId)
    {
        if (string.IsNullOrWhiteSpace(dto.FullName)) return ApiResponse<GuestDetailsDto>.Fail("FullName is required");
        if (string.IsNullOrWhiteSpace(dto.Phone)) return ApiResponse<GuestDetailsDto>.Fail("Phone is required");
        if (string.IsNullOrWhiteSpace(dto.IdCard)) return ApiResponse<GuestDetailsDto>.Fail("IdCard is required");

        var exists = await _db.Guests.AnyAsync(g => g.Phone == dto.Phone || g.IdCard == dto.IdCard);
        if (exists) return ApiResponse<GuestDetailsDto>.Fail("Đã tồn tại khách với số điện thoại hoặc CMND/CCCD");

        var entity = new Guest
        {
            Id = Guid.NewGuid(),
            FullName = dto.FullName,
            Phone = dto.Phone,
            IdCard = dto.IdCard,
            Email = dto.Email,
            IdCardFrontImageUrl = dto.IdCardFrontImageUrl,
            IdCardBackImageUrl = dto.IdCardBackImageUrl,
            HotelId = hotelId
        };
        _db.Guests.Add(entity);
        await _db.SaveChangesAsync();

        var created = await GetAsync(entity.Id);
        return ApiResponse<GuestDetailsDto>.Ok(created);
    }

    public async Task<ApiResponse<GuestDetailsDto>> UpdateAsync(Guid id, UpdateGuestDto dto)
    {
        var g = await _db.Guests.FirstOrDefaultAsync(x => x.Id == id);
        if (g == null) return ApiResponse<GuestDetailsDto>.Fail("Guest not found");

        var exists = await _db.Guests.AnyAsync(g => (g.Phone == dto.Phone || g.IdCard == dto.IdCard) && id != g.Id);
        if (exists) return ApiResponse<GuestDetailsDto>.Fail("Đã tồn tại khách với số điện thoại hoặc CMND/CCCD");

        if (dto.FullName != null) g.FullName = dto.FullName;
        if (dto.Phone != null) g.Phone = dto.Phone;
        if (dto.IdCard != null) g.IdCard = dto.IdCard;
        g.Email = dto.Email;
        g.IdCardFrontImageUrl = dto.IdCardFrontImageUrl;
        g.IdCardBackImageUrl = dto.IdCardBackImageUrl;

        await _db.SaveChangesAsync();
        var updated = await GetAsync(id);
        return ApiResponse<GuestDetailsDto>.Ok(updated);
    }
}
