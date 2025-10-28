using HotelManagement.Domain.Entities;
using HotelManagement.Services.Auth.Dtos;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;

namespace HotelManagement.Services.Auth;

public class AuthService : IAuthService
{
    private readonly UserManager<AppUser> _userManager;
    private readonly ITokenService _tokenService;

    public AuthService(UserManager<AppUser> userManager, ITokenService tokenService)
    {
        _userManager = userManager;
        _tokenService = tokenService;
    }

    public async Task<LoginResponseDto> LoginAsync(LoginRequestDto request)
    {
        var user = await _userManager.FindByNameAsync(request.Username) ?? await _userManager.FindByEmailAsync(request.Username);
        if (user is null) return new LoginResponseDto(false, null, null);

        var passwordValid = await _userManager.CheckPasswordAsync(user, request.Password);
        if (!passwordValid) return new LoginResponseDto(false, null, null);

        var requires2fa = await _userManager.GetTwoFactorEnabledAsync(user);
        if (requires2fa && string.IsNullOrEmpty(request.TwoFactorCode))
        {
            // Typically we would generate & send OTP here if provider is email/sms
            return new LoginResponseDto(true, null, null);
        }

        if (requires2fa && !string.IsNullOrEmpty(request.TwoFactorCode))
        {
            var provider = request.TwoFactorProvider ?? TokenOptions.DefaultAuthenticatorProvider;
            var valid2fa = await _userManager.VerifyTwoFactorTokenAsync(user, provider, request.TwoFactorCode);
            if (!valid2fa) return new LoginResponseDto(true, null, null);
        }

        var roles = await _userManager.GetRolesAsync(user);
        var token = _tokenService.CreateAccessToken(user.Id, user.UserName!, roles, new[]
        {
            new Claim("twoFactor", (await _userManager.GetTwoFactorEnabledAsync(user)).ToString())
        });

        return new LoginResponseDto(false, token, DateTimeOffset.UtcNow.AddHours(1));
    }

    public async Task<LoginResponseDto> VerifyTwoFactorAsync(TwoFactorVerifyDto request)
    {
        var user = await _userManager.FindByNameAsync(request.Username);
        if (user is null) return new LoginResponseDto(true, null, null);

        var valid2fa = await _userManager.VerifyTwoFactorTokenAsync(user, request.Provider, request.Code);
        if (!valid2fa) return new LoginResponseDto(true, null, null);

        var roles = await _userManager.GetRolesAsync(user);
        var token = _tokenService.CreateAccessToken(user.Id, user.UserName!, roles);
        return new LoginResponseDto(false, token, DateTimeOffset.UtcNow.AddHours(1));
    }

    public Task LogoutAsync(string userName)
    {
        // Stateless JWT logout is generally client-side; here we could add audit log or token blacklist.
        return Task.CompletedTask;
    }

    public async Task<bool> SendForgotPasswordOtpAsync(ForgotPasswordRequestDto request)
    {
        var user = await _userManager.FindByNameAsync(request.UsernameOrEmail) ?? await _userManager.FindByEmailAsync(request.UsernameOrEmail);
        if (user is null) return false;

        // Use Email provider for simplicity
        var code = await _userManager.GeneratePasswordResetTokenAsync(user);
        // TODO: send code via email/SMS based on OtpDelivery
        // For now, we can store in-memory or rely on client to provide code from email
        return !string.IsNullOrWhiteSpace(code);
    }

    public async Task<bool> ResetPasswordAsync(ResetPasswordRequestDto request)
    {
        var user = await _userManager.FindByNameAsync(request.Username) ?? await _userManager.FindByEmailAsync(request.Username);
        if (user is null) return false;
        var result = await _userManager.ResetPasswordAsync(user, request.OtpCode, request.NewPassword);
        return result.Succeeded;
    }
}