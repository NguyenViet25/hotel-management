using HotelManagement.Services.Admin.Users;
using HotelManagement.Services.Admin.Users.Dtos;
using HotelManagement.Services.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/users")]
[Authorize(Roles = "Admin")]
public class UsersAdminController : ControllerBase
{
    private readonly IUsersAdminService _svc;
    public UsersAdminController(IUsersAdminService svc) => _svc = svc;

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IEnumerable<UserSummaryDto>>>> List([FromQuery] UsersQueryDto query)
    {
        var (items, total) = await _svc.ListAsync(query);
        var meta = new { total, page = query.Page, pageSize = query.PageSize };
        return Ok(ApiResponse<IEnumerable<UserSummaryDto>>.Ok(items, meta: meta));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<UserDetailsDto>>> Get(Guid id)
    {
        var dto = await _svc.GetAsync(id);
        if (dto == null) return NotFound(ApiResponse<UserDetailsDto>.Fail("User not found"));
        return Ok(ApiResponse<UserDetailsDto>.Ok(dto));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<UserDetailsDto>>> Create([FromBody] CreateUserDto request)
    {
        try
        {
            var created = await _svc.CreateAsync(request);
            return CreatedAtAction(nameof(Get), new { id = created.Id }, ApiResponse<UserDetailsDto>.Ok(created));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<UserDetailsDto>.Fail(ex.Message));
        }
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<UserDetailsDto>>> Update(Guid id, [FromBody] UpdateUserDto request)
    {
        try
        {
            var updated = await _svc.UpdateAsync(id, request);
            if (updated == null) return NotFound(ApiResponse<UserDetailsDto>.Fail("User not found"));
            return Ok(ApiResponse<UserDetailsDto>.Ok(updated));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<UserDetailsDto>.Fail(ex.Message));
        }
    }

    [HttpPost("{id:guid}/lock")]
    public async Task<ActionResult<ApiResponse>> Lock(Guid id, [FromBody] LockUserDto request)
    {
        var ok = await _svc.LockAsync(id, request);
        if (!ok) return NotFound(ApiResponse.Fail("User not found or lock failed"));
        var msg = request.LockedUntil.HasValue ? $"Locked until {request.LockedUntil.Value:O}" : "Unlocked";
        return Ok(ApiResponse.Ok(msg));
    }

    [HttpPost("{id:guid}/reset-password")]
    public async Task<ActionResult<ApiResponse>> ResetPassword(Guid id, [FromBody] ResetPasswordAdminDto request)
    {
        var ok = await _svc.ResetPasswordAsync(id, request);
        if (!ok) return NotFound(ApiResponse.Fail("User not found or reset failed"));
        return Ok(ApiResponse.Ok("Password reset successful"));
    }

    [HttpPost("{id:guid}/property-roles")]
    public async Task<ActionResult<ApiResponse<UserPropertyRoleDto>>> AssignPropertyRole(Guid id, [FromBody] AssignPropertyRoleDto request)
    {
        var dto = await _svc.AssignPropertyRoleAsync(id, request);
        if (dto == null) return BadRequest(ApiResponse<UserPropertyRoleDto>.Fail("Duplicate or user not found"));
        return Ok(ApiResponse<UserPropertyRoleDto>.Ok(dto));
    }

    [HttpDelete("{id:guid}/property-roles/{propertyRoleId:guid}")]
    public async Task<ActionResult<ApiResponse>> RemovePropertyRole(Guid id, Guid propertyRoleId)
    {
        var ok = await _svc.RemovePropertyRoleAsync(id, propertyRoleId);
        if (!ok) return NotFound(ApiResponse.Fail("Role not found"));
        return Ok(ApiResponse.Ok("Role removed"));
    }
}