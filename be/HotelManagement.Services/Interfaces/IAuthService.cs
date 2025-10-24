using System.Threading.Tasks;
using HotelManagement.Domain.Entities;

namespace HotelManagement.Services.Interfaces
{
    public interface IAuthService
    {
        Task<(bool Success, string Token, string RefreshToken, User User)> LoginAsync(string username, string password);
        Task<(bool Success, string Message)> RegisterAsync(string username, string email, string password, string firstName, string lastName);
        Task<(bool Success, string Token, string RefreshToken)> RefreshTokenAsync(string token, string refreshToken);
        Task<bool> ValidateTokenAsync(string token);
        Task<(bool Success, string Message)> ChangePasswordAsync(string userId, string currentPassword, string newPassword);
        Task<(bool Success, string Message)> ForgotPasswordAsync(string email);
        Task<(bool Success, string Message)> ResetPasswordAsync(string email, string token, string newPassword);
        Task<(bool Success, string Message)> VerifyEmailAsync(string userId, string token);
        Task<(bool Success, string Message)> SendVerificationEmailAsync(string userId);
        Task<(bool Success, string Token, string RefreshToken)> GoogleLoginAsync(string credential);
    }
}