using HotelManagement.Services.Email;
using HotelManagement.Services.Email.Providers;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace HotelManagement.Api.Infrastructure;

public static class EmailExtensions
{
    public static IServiceCollection AddEmailing(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<EmailOptions>(configuration.GetSection("Email"));

        services.AddSingleton<IEmailProvider>(sp =>
        {
            var options = sp.GetRequiredService<IOptions<EmailOptions>>();
            var loggerFactory = sp.GetRequiredService<ILoggerFactory>();
            return new SmtpEmailProvider(options, loggerFactory.CreateLogger<SmtpEmailProvider>());
        });

        services.AddScoped<IEmailService, EmailService>();
        return services;
    }
}

