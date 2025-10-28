using HotelManagement.Domain;
using HotelManagement.Repository;
using HotelManagement.Services.Admin.Hotels.Dtos;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Services.Admin.Hotels;

public class HotelsAdminService : IHotelsAdminService
{
    private readonly ApplicationDbContext _db;

    public HotelsAdminService(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<(IEnumerable<HotelSummaryDto> Items, int Total)> ListAsync(HotelsQueryDto query, Guid actorUserId, bool isAdmin)
    {
        var baseQuery = _db.Hotels.AsQueryable();
        var allowedHotelIds = await GetAllowedHotelIdsAsync(actorUserId, isAdmin);
        if (allowedHotelIds != null)
        {
            baseQuery = baseQuery.Where(h => allowedHotelIds.Contains(h.Id));
        }
        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var s = query.Search.ToLower();
            baseQuery = baseQuery.Where(h => h.Name.ToLower().Contains(s) || h.Code.ToLower().Contains(s) || h.Address.ToLower().Contains(s));
        }
        if (query.IsActive != null)
        {
            baseQuery = baseQuery.Where(h => h.IsActive == query.IsActive);
        }

        baseQuery = (query.SortBy?.ToLower(), query.SortDir?.ToLower()) switch
        {
            ("name", "asc") => baseQuery.OrderBy(h => h.Name),
            ("name", "desc") => baseQuery.OrderByDescending(h => h.Name),
            ("code", "asc") => baseQuery.OrderBy(h => h.Code),
            ("code", "desc") => baseQuery.OrderByDescending(h => h.Code),
            ("createdat", "asc") => baseQuery.OrderBy(h => h.CreatedAt),
            _ => baseQuery.OrderByDescending(h => h.CreatedAt)
        };

        var total = await baseQuery.CountAsync();
        var items = await baseQuery.Skip((query.Page - 1) * query.PageSize).Take(query.PageSize)
            .Select(h => new HotelSummaryDto(h.Id, h.Code, h.Name, h.Address, h.IsActive, h.CreatedAt))
            .ToListAsync();

        return (items, total);
    }

    public async Task<HotelDetailsDto?> GetAsync(Guid id, Guid actorUserId, bool isAdmin)
    {
        var allowed = await GetAllowedHotelIdsAsync(actorUserId, isAdmin);
        var query = _db.Hotels.AsQueryable();
        if (allowed != null)
        {
            query = query.Where(x => allowed.Contains(x.Id));
        }
        var h = await query.FirstOrDefaultAsync(x => x.Id == id);
        if (h == null) return null;
        return new HotelDetailsDto(h.Id, h.Code, h.Name, h.Address, h.IsActive, h.CreatedAt);
    }

    public async Task<HotelDetailsDto> CreateAsync(CreateHotelDto dto, Guid actorUserId)
    {
        var code = dto.Code.Trim().ToUpperInvariant();
        if (await _db.Hotels.AnyAsync(h => h.Code == code))
        {
            throw new InvalidOperationException("Hotel code already exists");
        }
        var hotel = new Hotel
        {
            Id = Guid.NewGuid(),
            Code = code,
            Name = dto.Name.Trim(),
            Address = dto.Address.Trim(),
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };
        _db.Hotels.Add(hotel);
        await _db.SaveChangesAsync();

        await AddAuditAsync(actorUserId, hotel.Id, "hotel.create", new { dto.Code, dto.Name, dto.Address });

        return new HotelDetailsDto(hotel.Id, hotel.Code, hotel.Name, hotel.Address, hotel.IsActive, hotel.CreatedAt);
    }

    public async Task<HotelDetailsDto?> UpdateAsync(Guid id, UpdateHotelDto dto, Guid actorUserId)
    {
        var h = await _db.Hotels.FirstOrDefaultAsync(x => x.Id == id);
        if (h == null) return null;

        var before = new { h.Name, h.Address, h.IsActive };
        if (!string.IsNullOrWhiteSpace(dto.Name)) h.Name = dto.Name.Trim();
        if (!string.IsNullOrWhiteSpace(dto.Address)) h.Address = dto.Address.Trim();
        if (dto.IsActive != null) h.IsActive = dto.IsActive.Value;

        await _db.SaveChangesAsync();

        var after = new { h.Name, h.Address, h.IsActive };
        await AddAuditAsync(actorUserId, h.Id, "hotel.update", new { before, after });

        return new HotelDetailsDto(h.Id, h.Code, h.Name, h.Address, h.IsActive, h.CreatedAt);
    }

    public async Task<HotelDetailsDto?> ChangeStatusAsync(Guid id, ChangeHotelStatusDto dto, Guid actorUserId)
    {
        var h = await _db.Hotels.FirstOrDefaultAsync(x => x.Id == id);
        if (h == null) return null;

        var action = dto.Action?.Trim().ToLowerInvariant();
        var before = new { h.IsActive };
        switch (action)
        {
            case "pause":
                h.IsActive = false;
                break;
            case "close":
                h.IsActive = false;
                break;
            case "resume":
                h.IsActive = true;
                break;
            default:
                throw new InvalidOperationException("Unsupported status action");
        }
        await _db.SaveChangesAsync();
        var after = new { h.IsActive };
        await AddAuditAsync(actorUserId, h.Id, $"hotel.status.{action}", new { dto.Reason, dto.Until, before, after });
        return new HotelDetailsDto(h.Id, h.Code, h.Name, h.Address, h.IsActive, h.CreatedAt);
    }

    private async Task AddAuditAsync(Guid actorUserId, Guid hotelId, string action, object metadata)
    {
        _db.AuditLogs.Add(new AuditLog
        {
            Id = Guid.NewGuid(),
            Timestamp = DateTime.UtcNow,
            Action = action,
            HotelId = hotelId,
            UserId = actorUserId,
            MetadataJson = System.Text.Json.JsonSerializer.Serialize(metadata)
        });
        await _db.SaveChangesAsync();
    }

    private async Task<IEnumerable<Guid>?> GetAllowedHotelIdsAsync(Guid actorUserId, bool isAdmin)
    {
        if (isAdmin) return null;
        return await _db.UserPropertyRoles
            .Where(upr => upr.UserId == actorUserId)
            .Select(upr => upr.HotelId)
            .Distinct()
            .ToListAsync();
    }
}