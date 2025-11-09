using HotelManagement.Services.Admin.Audit;
using HotelManagement.Services.Admin.Audit.Dtos;
using HotelManagement.Services.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HotelManagement.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/audit")]
public class AuditController : ControllerBase
{
    private readonly IAuditService _svc;

    public AuditController(IAuditService svc)
    {
        _svc = svc;
    }

    private Guid? CurrentUserId()
    {
        var val = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(val, out var id) ? id : null;
    }

    [HttpGet("logs")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<IEnumerable<AuditLogDto>>>> Query([FromQuery] AuditQueryDto query)
    {
        var uid = CurrentUserId();
        if (uid == null) return Forbid();
        var isAdmin = User.IsInRole("Admin");
        var (items, total) = await _svc.QueryAsync(query, uid.Value, isAdmin);
        var meta = new { total, page = query.Page, pageSize = query.PageSize };
        return Ok(ApiResponse<IEnumerable<AuditLogDto>>.Ok(items, meta: meta));
    }
}