using HotelManagement.Services.Email.Providers;
using HotelManagement.Services.Email.Templates;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace HotelManagement.Services.Email;

public class EmailService : IEmailService
{
    private readonly IEmailProvider _provider;
    private readonly EmailOptions _options;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IEmailProvider provider, IOptions<EmailOptions> options, ILogger<EmailService> logger)
    {
        _provider = provider;
        _options = options.Value;
        _logger = logger;
    }

    public Task<bool> SendForgotPasswordEmailAsync(string toEmail, string? displayName, string token, CancellationToken ct = default)
    {
        var link = BuildResetUrl(_options.ResetBaseUrl, token);
        var tpl = EmailTemplates.ForgotPassword(displayName, link);
        return Send(toEmail, tpl.subject, tpl.html, tpl.text, ct);
    }

    public Task<bool> SendResetPasswordEmailAsync(string toEmail, string? displayName, string token, CancellationToken ct = default)
    {
        var link = BuildResetUrl(_options.ResetBaseUrl, token);
        var tpl = EmailTemplates.ResetPassword(displayName, link);
        return Send(toEmail, tpl.subject, tpl.html, tpl.text, ct);
    }

    private Task<bool> Send(string toEmail, string subject, string html, string text, CancellationToken ct)
    {
        try
        {
            _logger.LogInformation("Sending email to {To} {Subject}", toEmail, subject);
            return _provider.SendAsync(toEmail, subject, html, text, ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Email send failed");
            return Task.FromResult(false);
        }
    }

    private static string BuildResetUrl(string baseUrl, string token)
    {
        var encodedToken = Uri.EscapeDataString(token);
        return string.IsNullOrWhiteSpace(baseUrl) ? encodedToken : $"{baseUrl}?token={encodedToken}";
    }
}

