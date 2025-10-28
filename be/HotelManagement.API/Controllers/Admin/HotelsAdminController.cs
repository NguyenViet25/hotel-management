using HotelManagement.Services.Admin.Hotels;
using HotelManagement.Services.Admin.Hotels.Dtos;
using HotelManagement.Services.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HotelManagement.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/hotels")]
public class HotelsAdminController : ControllerBase
{
    private readonly IHotelsAdminService _svc;

    public HotelsAdminController(IHotelsAdminService svc)
    {
        _svc = svc;
    }

    private Guid? CurrentUserId()
    {
        var val = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(val, out var id) ? id : null;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<IEnumerable<HotelSummaryDto>>>> List([FromQuery] HotelsQueryDto query)
    {
        var uid = CurrentUserId();
        if (uid == null) return Forbid();
        var isAdmin = User.IsInRole("Admin");
        var (items, total) = await _svc.ListAsync(query, uid.Value, isAdmin);
        var meta = new { total, page = query.Page, pageSize = query.PageSize };
        return Ok(ApiResponse<IEnumerable<HotelSummaryDto>>.Ok(items, meta: meta));
    }

    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<HotelDetailsDto>>> Get(Guid id)
    {
        var uid = CurrentUserId();
        if (uid == null) return Forbid();
        var isAdmin = User.IsInRole("Admin");
        var dto = await _svc.GetAsync(id, uid.Value, isAdmin);
        if (dto == null) return NotFound(ApiResponse<HotelDetailsDto>.Fail("Hotel not found"));
        return Ok(ApiResponse<HotelDetailsDto>.Ok(dto));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<HotelDetailsDto>>> Create([FromBody] CreateHotelDto request)
    {
        try
        {
            var uid = CurrentUserId();
            if (uid == null) return Forbid();
            var created = await _svc.CreateAsync(request, uid.Value);
            return CreatedAtAction(nameof(Get), new { id = created.Id }, ApiResponse<HotelDetailsDto>.Ok(created));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<HotelDetailsDto>.Fail(ex.Message));
        }
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<HotelDetailsDto>>> Update(Guid id, [FromBody] UpdateHotelDto request)
    {
        try
        {
            var uid = CurrentUserId();
            if (uid == null) return Forbid();
            var updated = await _svc.UpdateAsync(id, request, uid.Value);
            if (updated == null) return NotFound(ApiResponse<HotelDetailsDto>.Fail("Hotel not found"));
            return Ok(ApiResponse<HotelDetailsDto>.Ok(updated));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<HotelDetailsDto>.Fail(ex.Message));
        }
    }

    [HttpPost("{id:guid}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<HotelDetailsDto>>> ChangeStatus(Guid id, [FromBody] ChangeHotelStatusDto request)
    {
        try
        {
            var uid = CurrentUserId();
            if (uid == null) return Forbid();
            var updated = await _svc.ChangeStatusAsync(id, request, uid.Value);
            if (updated == null) return NotFound(ApiResponse<HotelDetailsDto>.Fail("Hotel not found"));
            return Ok(ApiResponse<HotelDetailsDto>.Ok(updated));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<HotelDetailsDto>.Fail(ex.Message));
        }
    }
}