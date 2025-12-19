using HotelManagement.Services.Common;
using HotelManagement.Services.Profile;
using HotelManagement.Services.Profile.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HotelManagement.Api.Controllers;

[ApiController]
[Route("api/profile")]
//[Authorize]

public class ProfileController : ControllerBase
{
    private readonly IProfileService _svc;

    public ProfileController(IProfileService svc)
    {
        _svc = svc;
    }

    private Guid? CurrentUserId()
    {
        var val = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(val, out var id) ? id : null;
    }

    [HttpGet("me")]
    public async Task<ActionResult<ApiResponse<ProfileDto>>> Me()
    {
        var id = CurrentUserId();
        if (id == null) return Unauthorized(ApiResponse<ProfileDto>.Fail("Unauthorized"));
        var dto = await _svc.GetAsync(id.Value);
        if (dto == null) return NotFound(ApiResponse<ProfileDto>.Fail("Không tìm thấy người dùng"));
        return Ok(ApiResponse<ProfileDto>.Ok(dto));
    }

    [HttpPut]
    public async Task<ActionResult<ApiResponse<ProfileDto>>> Update([FromBody] UpdateProfileDto request)
    {
        var id = CurrentUserId();
        if (id == null) return Unauthorized(ApiResponse<ProfileDto>.Fail("Unauthorized"));
        var dto = await _svc.UpdateAsync(id.Value, request);
        if (dto == null) return Ok(ApiResponse<ProfileDto>.Fail("Cập nhật thông tin thất bại"));
        return Ok(ApiResponse<ProfileDto>.Ok(dto, message: "Cập nhật thông tin thành công"));
    }

    [HttpPost("change-password")]
    public async Task<ActionResult<ApiResponse>> ChangePassword([FromBody] ChangePasswordDto request)
    {
        var id = CurrentUserId();
        if (id == null) return Unauthorized(ApiResponse.Fail("Unauthorized"));
        var ok = await _svc.ChangePasswordAsync(id.Value, request);
        if (!ok) return Ok(ApiResponse.Fail("Mật khẩu cũ không chính xác"));
        return Ok(ApiResponse.Ok("Thay đổi mật khẩu thành công"));
    }
}