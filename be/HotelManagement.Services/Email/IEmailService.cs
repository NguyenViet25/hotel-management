namespace HotelManagement.Services.Email;

public interface IEmailService
{
    Task<bool> SendForgotPasswordEmailAsync(string toEmail, string? displayName, string token, CancellationToken ct = default);
    Task<bool> SendResetPasswordEmailAsync(string toEmail, string? displayName, string token, CancellationToken ct = default);
}

