using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Net;
using System.Net.Mail;

namespace HotelManagement.Services.Email.Providers;

public class SmtpEmailProvider : IEmailProvider
{
    private readonly EmailOptions _options;
    private readonly ILogger<SmtpEmailProvider> _logger;

    public SmtpEmailProvider(IOptions<EmailOptions> options, ILogger<SmtpEmailProvider> logger)
    {
        _options = options.Value;
        _logger = logger;
    }

    public async Task<bool> SendAsync(string toEmail, string subject, string htmlBody, string textBody, CancellationToken ct = default)
    {
        try
        {
            using var msg = new MailMessage();
            msg.From = new MailAddress(_options.FromAddress, _options.FromName);
            msg.To.Add(new MailAddress(toEmail));
            msg.Subject = subject;
            msg.Body = htmlBody;
            msg.IsBodyHtml = true;
            var altView = AlternateView.CreateAlternateViewFromString(textBody);
            msg.AlternateViews.Add(altView);

            using var client = new SmtpClient(_options.Smtp.Host, _options.Smtp.Port);
            client.EnableSsl = _options.Smtp.EnableSsl;
            client.Credentials = new NetworkCredential(_options.Smtp.Username, _options.Smtp.Password);
            await client.SendMailAsync(msg);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Email send failed");
            return false;
        }
    }
}

