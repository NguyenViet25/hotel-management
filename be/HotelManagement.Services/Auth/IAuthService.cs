using HotelManagement.Services.Auth.Dtos;

namespace HotelManagement.Services.Auth;

public interface IAuthService
{
    Task<LoginResponseDto> LoginAsync(LoginRequestDto request);
    Task LogoutAsync(string userName);
    Task<bool> SendForgotPasswordOtpAsync(ForgotPasswordRequestDto request);
    Task<bool> ResetPasswordAsync(ResetPasswordRequestDto request);
}