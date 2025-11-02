using HotelManagement.Domain.Entities;

namespace HotelManagement.Services.Auth.Dtos;

public record LoginRequestDto(string Username, string Password, string? TwoFactorProvider = null, string? TwoFactorCode = null);

public record LoginResponseDto(bool RequiresTwoFactor, string? AccessToken = null,  DateTimeOffset? ExpiresAt = null, AppUserResponse? user = null);

public record TwoFactorVerifyDto(string Username, string Provider, string Code);

public record LogoutRequestDto(string? RefreshToken = null);

public record ForgotPasswordRequestDto(string UsernameOrEmail, string? OtpDelivery = "Email");

public record ResetPasswordRequestDto(string Username, string OtpCode, string NewPassword);