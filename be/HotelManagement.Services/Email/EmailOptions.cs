using Microsoft.Extensions.Options;

namespace HotelManagement.Services.Email;

public enum EmailProviderType
{
    Smtp
}

public class EmailOptions
{
    public EmailProviderType Provider { get; set; } = EmailProviderType.Smtp;
    public string FromName { get; set; } = "";
    public string FromAddress { get; set; } = "";
    public string ResetBaseUrl { get; set; } = "";
    public SmtpOptions Smtp { get; set; } = new();
}

public class SmtpOptions
{
    public string Host { get; set; } = "";
    public int Port { get; set; } = 587;
    public bool EnableSsl { get; set; } = true;
    public string Username { get; set; } = "";
    public string Password { get; set; } = "";
}

