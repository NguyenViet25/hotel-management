using HotelManagement.Services.Auth;
using HotelManagement.Services.Admin.Users;
using HotelManagement.Services.Admin.Hotels;
using HotelManagement.Services.Admin.Audit;
using Microsoft.Extensions.DependencyInjection;

namespace HotelManagement.Services;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IUsersAdminService, UsersAdminService>();
        services.AddScoped<IHotelsAdminService, HotelsAdminService>();
        services.AddScoped<IAuditService, AuditService>();
        return services;
    }
}