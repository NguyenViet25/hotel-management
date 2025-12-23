using HotelManagement.Services.Auth;
using HotelManagement.Services.Auth.Dtos;
using HotelManagement.Services.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.Api.Controllers;

[ApiController]
[Route("api/auth")]
[AllowAnonymous]
public class AuthController(IAuthService auth) : ControllerBase
{
    private readonly IAuthService _auth = auth;

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<LoginResponseDto>>> Login([FromBody] LoginRequestDto request)
    {
        var result = await _auth.LoginAsync(request);
        if (result.RequiresTwoFactor) return Ok(ApiResponse<LoginResponseDto>.Ok(result, "Two-factor required"));

        if (result.ExpiresAt > DateTimeOffset.Now) // <-- Assuming your LoginAsync sets this
        {
            // Optional: calculate remaining lockout time
            var remainingLockout = result.ExpiresAt.HasValue
                ? (result.ExpiresAt.Value - DateTimeOffset.Now).TotalMinutes
                : 0;

            return Unauthorized(ApiResponse<LoginResponseDto>.Fail(
                $"Tải khoản của bạn đã bị khóa."
            ));
        }

        var lockedHotel = await _auth.IsHotelLockedAsync(request);
        if (lockedHotel)
            return Unauthorized(ApiResponse<LoginResponseDto>.Fail($"Cơ sở của bạn đã ngừng hoạt động."));



        if (string.IsNullOrEmpty(result.AccessToken))
            return Unauthorized(ApiResponse<LoginResponseDto>.Fail("Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập."));
        return Ok(ApiResponse<LoginResponseDto>.Ok(result, "Đăng nhập thành công"));
    }


    [HttpPost("logout")]
    [Authorize]
    public async Task<ActionResult<ApiResponse>> Logout()
    {
        await _auth.LogoutAsync(User.Identity?.Name ?? string.Empty);
        return Ok(ApiResponse.Ok("Logged out"));
    }

    [HttpPost("forgot-password")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse>> ForgotPassword([FromBody] ForgotPasswordRequestDto request)
    {
        var ok = await _auth.SendForgotPasswordOtpAsync(request);
        if (!ok) return NotFound(ApiResponse.Fail("User not found"));
        return Ok(ApiResponse.Ok("Reset OTP sent"));
    }

    [HttpPost("reset-password")]
    public async Task<ActionResult<ApiResponse>> ResetPassword([FromBody] ResetPasswordRequestDto request)
    {
        var ok = await _auth.ResetPasswordAsync(request);
        if (!ok) return BadRequest(ApiResponse.Fail("Reset failed"));
        return Ok(ApiResponse.Ok("Password reset successful"));
    }



}