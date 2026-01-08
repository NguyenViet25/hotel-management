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
                bookingQuery = bookingQuery.Where(b => b.StartDate >= from && b.StartDate <= to);
            else if (from.HasValue)
                bookingQuery = bookingQuery.Where(b => b.StartDate >= from);
            else if (to.HasValue)
                bookingQuery = bookingQuery.Where(b => b.StartDate <= to);

            var primaryGuestIds = await bookingQuery
                .Select(b => b.PrimaryGuestId!.Value)
                .Distinct()
                .ToListAsync();

            baseQuery = baseQuery.Where(g => primaryGuestIds.Contains(g.Id));
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
        var pageGuests = await baseQuery
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync();

        var guestIds = pageGuests.Select(x => x.Id).ToList();

        var primaryBookings = await _db.Bookings
            .Where(b => b.HotelId == hotelId && b.PrimaryGuestId.HasValue && guestIds.Contains(b.PrimaryGuestId.Value))
            .Select(b => new { b.Id, b.PrimaryGuestId, b.CreatedAt })
            .ToListAsync();

        var guestRoomLinks = await _db.BookingGuests
            .Where(bg => guestIds.Contains(bg.GuestId))
            .Select(bg => new { bg.GuestId, bg.BookingRoomId })
            .ToListAsync();
        var bookingRoomIds = guestRoomLinks.Select(x => x.BookingRoomId).Distinct().ToList();
        var roomTypeLinks = await _db.BookingRooms
            .Where(br => bookingRoomIds.Contains(br.BookingRoomId))
            .Select(br => new { br.BookingRoomId, br.BookingRoomTypeId })
            .ToListAsync();
        var brtIds = roomTypeLinks.Select(x => x.BookingRoomTypeId).Distinct().ToList();
        var bookingLinks = await _db.BookingRoomTypes
            .Where(rt => brtIds.Contains(rt.BookingRoomTypeId))
            .Select(rt => new { rt.BookingRoomTypeId, rt.BookingId })
            .ToListAsync();

        var guestBookingIds = guestRoomLinks
            .Join(roomTypeLinks, gl => gl.BookingRoomId, rl => rl.BookingRoomId, (gl, rl) => new { gl.GuestId, rl.BookingRoomTypeId })
            .Join(bookingLinks, x => x.BookingRoomTypeId, bl => bl.BookingRoomTypeId, (x, bl) => new { x.GuestId, bl.BookingId })
            .GroupBy(x => x.GuestId)
            .ToDictionary(gp => gp.Key, gp => gp.Select(x => x.BookingId).Distinct().ToList());

        var allBookingIds = guestBookingIds.Values.SelectMany(x => x).Distinct().ToList();
        var involvedBookings = await _db.Bookings
            .Where(b => b.HotelId == hotelId && allBookingIds.Contains(b.Id))
            .Select(b => new { b.Id, b.PrimaryGuestId, b.CreatedAt })
            .ToListAsync();

        var latestPrimaryByGuest = new Dictionary<Guid, Guid?>();
        foreach (var gid in guestIds)
        {
            var selfBookings = primaryBookings.Where(b => b.PrimaryGuestId == gid);
            var invIds = guestBookingIds.TryGetValue(gid, out var ids) ? ids : new List<Guid>();
            var invBookings = involvedBookings.Where(b => invIds.Contains(b.Id));
            var candidate = selfBookings.Concat(invBookings).OrderByDescending(b => b.CreatedAt).FirstOrDefault();
            latestPrimaryByGuest[gid] = candidate?.PrimaryGuestId;
        }

        var primaryIds = latestPrimaryByGuest.Values.Where(id => id.HasValue).Select(id => id!.Value).Distinct().ToList();
        var primaryNameMap = await _db.Guests
            .Where(g => primaryIds.Contains(g.Id))
            .Select(g => new { g.Id, g.FullName })
            .ToDictionaryAsync(x => x.Id, x => x.FullName);

        var items = pageGuests.Select(g => new GuestDetailsDto
        {
            PrimaryGuestName = latestPrimaryByGuest.TryGetValue(g.Id, out var pid) && pid.HasValue && primaryNameMap.TryGetValue(pid.Value, out var nm) ? nm : null,
            Id = g.Id,
            FullName = g.FullName,
            Phone = g.Phone,
            Email = g.Email,
            IdCard = g.IdCard,
            IdCardBackImageUrl = g.IdCardBackImageUrl,
            IdCardFrontImageUrl = g.IdCardFrontImageUrl,
        }).ToList();

        var results = items.Where(x => (x.PrimaryGuestName ?? "").Contains(query.Name ?? "") || x.FullName.Contains(query.Name ?? "")).ToList();

        return (results, total);
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
