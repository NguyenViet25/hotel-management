using HotelManagement.Repository.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace HotelManagement.Repository;

public static class DependencyInjection
{
    public static IServiceCollection AddRepositories(this IServiceCollection services)
    {
        services.AddScoped<DbContext, ApplicationDbContext>();
        services.AddScoped(typeof(IRepository<>), typeof(EfRepository<>));
        return services;
    }
}