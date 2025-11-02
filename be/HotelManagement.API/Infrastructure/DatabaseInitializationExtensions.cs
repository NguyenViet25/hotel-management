using Microsoft.EntityFrameworkCore;
using HotelManagement.Repository;
using HotelManagement.Domain;
using HotelManagement.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;

namespace HotelManagement.Api.Infrastructure;

public static class DatabaseInitializationExtensions
{
    public static IApplicationBuilder InitializeDatabase(this IApplicationBuilder app)
    {
        using (var scope = app.ApplicationServices.CreateScope())
        {
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<AppUser>>();
            var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
            
            // Apply any pending migrations
            dbContext.Database.Migrate();
            
            // Seed roles and users
            SeedRoles(roleManager).GetAwaiter().GetResult();
            SeedUsers(userManager, dbContext).GetAwaiter().GetResult();
        }
        
        return app;
    }
    
    private static async Task SeedRoles(RoleManager<IdentityRole<Guid>> roleManager)
    {
        // Create roles if they don't exist
        string[] roleNames = Enum.GetNames(typeof(UserRole));
        
        foreach (var roleName in roleNames)
        {
            var roleExists = await roleManager.RoleExistsAsync(roleName);
            if (!roleExists)
            {
                await roleManager.CreateAsync(new IdentityRole<Guid>(roleName));
            }
        }
    }
    
    private static async Task SeedUsers(UserManager<AppUser> userManager, ApplicationDbContext dbContext)
    {
        // Create a hotel if none exists (for user property roles)
        var hotel = await dbContext.Set<Hotel>().FirstOrDefaultAsync();
        if (hotel == null)
        {
            hotel = new Hotel
            {
                Id = Guid.NewGuid(),
                Code = "MAIN",
                Name = "Main Hotel",
                Address = "123 Main Street",
                IsActive = true
            };
            dbContext.Set<Hotel>().Add(hotel);
            await dbContext.SaveChangesAsync();
        }
        
        // Define user data with role descriptions
        var userData = new[]
        {
            new { 
                Username = "admin", 
                Email = "admin@hotel.com", 
                Password = "Password1@", 
                Role = UserRole.Admin, 
                Fullname = "Admin User",
                Description = "Quản trị hệ thống toàn chuỗi: tạo tài khoản, phân quyền, cấu hình giá, quản lý cơ sở, theo dõi audit, thiết lập báo cáo, cấu hình cổng thanh toán và dashboard."
            },
            new { 
                Username = "manager", 
                Email = "manager@hotel.com", 
                Password = "Password1@", 
                Role = UserRole.Manager, 
                Fullname = "Manager User",
                Description = "Quản lý vận hành tại từng cơ sở: giám sát tình trạng phòng, báo cáo doanh thu, xử lý ticket bảo trì, duyệt ngoại lệ giá, kiểm soát ca làm việc, báo cáo và bảo trì thiết bị."
            },
            new { 
                Username = "frontdesk", 
                Email = "frontdesk@hotel.com", 
                Password = "Password1@", 
                Role = UserRole.FrontDesk, 
                Fullname = "Front Desk User",
                Description = "Thực hiện nghiệp vụ front desk: đặt phòng, check-in/out, thu cọc, ghi charge F&B/minibar, đổi phòng, thao tác trên calendar, đối soát thu chi và gửi yêu cầu ngoại lệ."
            },
            new { 
                Username = "kitchen", 
                Email = "kitchen@hotel.com", 
                Password = "Password1@", 
                Role = UserRole.Kitchen, 
                Fullname = "Kitchen User",
                Description = "Nhận và xử lý ticket món ăn trong Kitchen Display System, cập nhật trạng thái chế biến."
            },
            new { 
                Username = "waiter", 
                Email = "waiter@hotel.com", 
                Password = "Password1@", 
                Role = UserRole.Waiter, 
                Fullname = "Waiter User",
                Description = "Quản lý sơ đồ bàn, tạo order, chỉnh sửa, void/discount, post charge vào phòng, thu tiền và đóng hóa đơn."
            }
        };
        
        // Create users if they don't exist
        foreach (var user in userData)
        {
            var appUser = await userManager.FindByNameAsync(user.Username);
            
            if (appUser == null)
            {
                appUser = new AppUser
                {
                    UserName = user.Username,
                    Email = user.Email,
                    EmailConfirmed = true,
                    Fullname = user.Fullname
                };
                
                var result = await userManager.CreateAsync(appUser, user.Password);
                
                if (result.Succeeded)
                {
                    // Add user to role
                    await userManager.AddToRoleAsync(appUser, user.Role.ToString());
                    
                    // Add user property role
                    var userPropertyRole = new UserPropertyRole
                    {
                        Id = Guid.NewGuid(),
                        HotelId = hotel.Id,
                        UserId = appUser.Id,
                        Role = user.Role
                    };
                    
                    dbContext.Set<UserPropertyRole>().Add(userPropertyRole);
                }
            }
        }
        
        await dbContext.SaveChangesAsync();
    }
}