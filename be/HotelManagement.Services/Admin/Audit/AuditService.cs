using HotelManagement.Repository;
using HotelManagement.Services.Admin.Audit.Dtos;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace HotelManagement.Services.Admin.Audit;

public class AuditService : IAuditService
{
    private readonly ApplicationDbContext _db;

    public AuditService(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<(IEnumerable<AuditLogDto> Items, int Total)> QueryAsync(AuditQueryDto query, Guid actorUserId, bool isAdmin)
    {
        var baseQuery = _db.AuditLogs.AsQueryable();
        var allowedHotelIds = await GetAllowedHotelIdsAsync(actorUserId, isAdmin);
        if (allowedHotelIds != null)
        {
            baseQuery = baseQuery.Where(l => l.HotelId != null && allowedHotelIds.Contains(l.HotelId.Value));
        }
        if (query.From != null) baseQuery = baseQuery.Where(l => l.Timestamp >= query.From);
        if (query.To != null) baseQuery = baseQuery.Where(l => l.Timestamp <= query.To);
        if (query.UserId != null) baseQuery = baseQuery.Where(l => l.UserId == query.UserId);
        if (query.HotelId != null) baseQuery = baseQuery.Where(l => l.HotelId == query.HotelId);
        if (!string.IsNullOrWhiteSpace(query.Action))
        {
            var a = query.Action.ToLower();
            baseQuery = baseQuery.Where(l => l.Action.ToLower().Contains(a));
        }

        baseQuery = baseQuery.OrderByDescending(l => l.Timestamp);
        var total = await baseQuery.CountAsync();
        var items = await baseQuery.Skip((query.Page - 1) * query.PageSize).Take(query.PageSize)
            .Select(l => new AuditLogDto(l.Id, l.Timestamp, l.Action, l.HotelId, l.UserId,
                SafeDeserialize(l.MetadataJson)))
            .ToListAsync();
        return (items, total);
    }

    private static object? SafeDeserialize(string? json)
    {
        if (string.IsNullOrWhiteSpace(json)) return null;
        try
        {
            return JsonSerializer.Deserialize<JsonElement>(json);
        }
        catch
        {
            return json;
        }
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