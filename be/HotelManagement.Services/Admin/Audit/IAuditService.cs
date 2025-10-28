using HotelManagement.Services.Admin.Audit.Dtos;

namespace HotelManagement.Services.Admin.Audit;

public interface IAuditService
{
    Task<(IEnumerable<AuditLogDto> Items, int Total)> QueryAsync(AuditQueryDto query, Guid actorUserId, bool isAdmin);
}