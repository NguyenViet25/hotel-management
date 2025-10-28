using HotelManagement.Services.Auth;
using HotelManagement.Services.Admin.Users;
using HotelManagement.Services.Admin.Hotels;
using HotelManagement.Services.Admin.Audit;
using HotelManagement.Services.Admin.RoomTypes;
using HotelManagement.Services.Admin.Pricing;
using HotelManagement.Services.Admin.Bookings;
using HotelManagement.Services.Admin.GroupBookings;
using HotelManagement.Services.Admin.Rooms;
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
        services.AddScoped<IRoomTypeService, RoomTypeService>();
        services.AddScoped<IPricingService, PricingService>();
        services.AddScoped<IBookingService, BookingService>();
        services.AddScoped<IGroupBookingService, GroupBookingService>();
        services.AddScoped<IRoomsService, RoomsService>();
        return services;
    }
}