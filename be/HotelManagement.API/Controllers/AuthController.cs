using HotelManagement.Services.Auth;
using HotelManagement.Services.Auth.Dtos;
using HotelManagement.Services.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;

    public AuthController(IAuthService auth)
    {
        _auth = auth;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<LoginResponseDto>>> Login([FromBody] LoginRequestDto request)
    {
        var result = await _auth.LoginAsync(request);
        if (result.RequiresTwoFactor) return Ok(ApiResponse<LoginResponseDto>.Ok(result, "Two-factor required"));
        if (string.IsNullOrEmpty(result.AccessToken)) return Unauthorized(ApiResponse<LoginResponseDto>.Fail("Invalid credentials"));
        return Ok(ApiResponse<LoginResponseDto>.Ok(result, "Login successful"));
    }

    [HttpPost("2fa/verify")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<LoginResponseDto>>> VerifyTwoFactor([FromBody] TwoFactorVerifyDto request)
    {
        var result = await _auth.VerifyTwoFactorAsync(request);
        if (string.IsNullOrEmpty(result.AccessToken)) return Unauthorized(ApiResponse<LoginResponseDto>.Fail("Invalid 2FA code"));
        return Ok(ApiResponse<LoginResponseDto>.Ok(result, "2FA success"));
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
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse>> ResetPassword([FromBody] ResetPasswordRequestDto request)
    {
        var ok = await _auth.ResetPasswordAsync(request);
        if (!ok) return BadRequest(ApiResponse.Fail("Reset failed"));
        return Ok(ApiResponse.Ok("Password reset successful"));
    }
}