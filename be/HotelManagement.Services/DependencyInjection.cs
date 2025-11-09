using HotelManagement.Services.Auth;
using HotelManagement.Services.Admin.Users;
using HotelManagement.Services.Admin.Hotels;
using HotelManagement.Services.Admin.Audit;
using HotelManagement.Services.Admin.RoomTypes;
using HotelManagement.Services.Admin.Rooms;
using HotelManagement.Services.Admin.Menu;
using HotelManagement.Services.Admin.Kitchen;
using HotelManagement.Services.Profile;
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
            services.AddScoped<IRoomsService, RoomsService>();
            services.AddScoped<IMenuService, MenuService>();
            services.AddScoped<IKitchenService, KitchenService>();
            services.AddScoped<IProfileService, ProfileService>();
            services.AddScoped<Admin.Bookings.IBookingsService, Admin.Bookings.BookingsService>();
        return services;
    }
}