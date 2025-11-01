using Microsoft.EntityFrameworkCore;
using HotelManagement.Repository;

namespace HotelManagement.Api.Infrastructure;

public static class DatabaseInitializationExtensions
{
    public static IApplicationBuilder InitializeDatabase(this IApplicationBuilder app)
    {
        using (var scope = app.ApplicationServices.CreateScope())
        {
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            
            // Apply any pending migrations
            dbContext.Database.Migrate();
            
            // You can add seed data here if needed
            // SeedData(dbContext);
        }
        
        return app;
    }
    
    /*
    private static void SeedData(ApplicationDbContext dbContext)
    {
        // Add seed data logic here if needed
    }
    */
}