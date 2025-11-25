namespace HotelManagement.Services.Email.Providers;

public interface IEmailProvider
{
    Task<bool> SendAsync(string toEmail, string subject, string htmlBody, string textBody, CancellationToken ct = default);
}

