using Microsoft.EntityFrameworkCore;
using HotelManagement.Repository;
using HotelManagement.Domain;
using HotelManagement.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;

namespace HotelManagement.Api.Infrastructure;

public static class DatabaseInitializationExtensions
{

    private static Guid DEFAULT_HOTEL_ID = Guid.Parse("3f2504e0-4f89-11d3-9a0c-0305e82c3301");

    public static IApplicationBuilder InitializeDatabase(this IApplicationBuilder app)
    {
        using (var scope = app.ApplicationServices.CreateScope())
        {
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<AppUser>>();
            var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<Guid>>>();

            // Apply any pending migrations
            dbContext.Database.Migrate();

            SeedHotelsAsync(dbContext).GetAwaiter().GetResult();
            SeedRoomTypesAsync(dbContext).GetAwaiter().GetResult();
            SeedHotelRoomsAsync(dbContext).GetAwaiter().GetResult();
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

    public static async Task SeedHotelRoomsAsync(DbContext dbContext)
    {
        var hotelId = DEFAULT_HOTEL_ID;

        // Get all room types for the hotel
        var roomTypes = await dbContext.Set<RoomType>()
            .Where(rt => rt.HotelId == hotelId)
            .ToListAsync();

        if (!roomTypes.Any()) return; // No room types to seed
        var index = 1;

        foreach (var roomType in roomTypes)
        {
            // Check if rooms already exist for this room type
            bool exists = await dbContext.Set<HotelRoom>()
                .AnyAsync(r => r.RoomTypeId == roomType.Id);
            if (exists) continue;

            var rooms = new List<HotelRoom>();

            for (int i = index; i <= 5; i++)
            {
                rooms.Add(new HotelRoom
                {
                    Id = Guid.NewGuid(),
                    HotelId = hotelId,
                    RoomTypeId = roomType.Id,
                    Number = $"P-{(i + index):D3}", // e.g., STD-001
                    Floor = (i - 1) / 2 + 1, // simple floor calculation
                    Status = RoomStatus.Available
                });

            }
            index += 5;

            dbContext.Set<HotelRoom>().AddRange(rooms);
        }

        await dbContext.SaveChangesAsync();
    }

    public static async Task SeedRoomTypesAsync(DbContext dbContext)
    {
        var hotelId = DEFAULT_HOTEL_ID;
        // Check if there are already room types for this hotel
        bool exists = await dbContext.Set<RoomType>().AnyAsync(rt => rt.HotelId == hotelId);
        if (exists)
            return; // Already seeded

        var roomTypes = new List<RoomType>
        {
            new RoomType
            {
                Id = Guid.NewGuid(),
                HotelId = hotelId,
                Capacity = 2,
                Name = "Phòng Standard",
                Description = "Phòng Standard tiện nghi cho 2 khách, có cửa sổ hướng ra thành phố.",
                BasePriceFrom = 500000,
                BasePriceTo = 700000,
                Prices = "", // JSON string or empty for now
            },
            new RoomType
            {
                Id = Guid.NewGuid(),
                HotelId = hotelId,
                Capacity = 3,
                Name = "Phòng Superior",
                Description = "Phòng Superior rộng rãi, trang bị đầy đủ tiện nghi, phù hợp gia đình nhỏ.",
                BasePriceFrom = 800000,
                BasePriceTo = 1200000,
                Prices = "",
            },
            new RoomType
            {
                Id = Guid.NewGuid(),
                HotelId = hotelId,
                Capacity = 4,
                Name = "Phòng Deluxe",
                Description = "Phòng Deluxe sang trọng, có ban công và tầm nhìn hướng biển.",
                BasePriceFrom = 1500000,
                BasePriceTo = 2000000,
                Prices = "",
            }
        };

        dbContext.Set<RoomType>().AddRange(roomTypes);
        await dbContext.SaveChangesAsync();
    }

    public static async Task SeedHotelsAsync(DbContext dbContext)
    {
        // Check if there are any hotels already
        if (await dbContext.Set<Hotel>().AnyAsync())
            return; // Already seeded

        var hotels = new List<Hotel>
        {
            new Hotel
            {
                Id = Guid.NewGuid(),
                Code = "TTS1",
                Name = "Tân Trường Sơn 1",
                Address = "02 Nguyễn Thị Lợi, Trung Sơn, Sầm Sơn",
                Phone = "0967092888",
                Email = "kstantruongson@gmail.com",
                Description = "Tọa lạc tại vị trí đắc địa bậc nhất Sầm Sơn, Khách sạn Tân Trường Sơn 1... [truncated for brevity]",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new Hotel
            {
                Id = Guid.NewGuid(),
                Code = "TTS2",
                Name = "Tân Trường Sơn 2",
                Address = "06 Nguyễn Thị Lợi, Trung Sơn, Sầm Sơn",
                Phone = "0919153868",
                Email = "kstantruongson@gmail.com",
                Description = "Tọa lạc tại trái tim Bãi tắm C sầm uất, Khách sạn Tân Trường Sơn 2... [truncated]",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new Hotel
            {
                Id = Guid.NewGuid(),
                Code = "TTS3",
                Name = "Tân Trường Sơn 3",
                Address = "Khu phố Hồng Thắng, Sầm Sơn",
                Phone = "0904231333",
                Email = "kstantruongson@gmail.com",
                Description = "Khách sạn Tân Trường Sơn 3 tọa lạc tại khu phố Hồng Thắng...",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new Hotel
            {
                Id = DEFAULT_HOTEL_ID,
                Code = "TTSLEGACY",
                Name = "Tân Trường Sơn Legacy",
                Address = "Khu đô thị FLC, Sầm Sơn",
                Phone = "0976199368",
                Email = "kstantruongson@gmail.com",
                Description = "Nằm tách biệt khỏi sự náo nhiệt của trung tâm bãi tắm, Khách sạn Tân Trường Sơn Legacy...",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            }
        };

        dbContext.Set<Hotel>().AddRange(hotels);
        await dbContext.SaveChangesAsync();
    }

    private static async Task SeedUsers(UserManager<AppUser> userManager, ApplicationDbContext dbContext)
    {

        // Define user data with Vietnamese fullname and phone number
        var userData = new[]
        {
        new {
            Username = "admin",
            Email = "admin@hotel.com",
            Password = "Password1@",
            Role = UserRole.Admin,
            Fullname = "Nguyễn Văn Admin",
            PhoneNumber = "0901000001",
            Description = "Quản trị hệ thống toàn chuỗi: tạo tài khoản, phân quyền, cấu hình giá, quản lý cơ sở, theo dõi audit, thiết lập báo cáo, cấu hình cổng thanh toán và dashboard."
        },
        new {
            Username = "manager",
            Email = "manager@hotel.com",
            Password = "Password1@",
            Role = UserRole.Manager,
            Fullname = "Trần Thị Quản Lý",
            PhoneNumber = "0901000002",
            Description = "Quản lý vận hành tại từng cơ sở: giám sát tình trạng phòng, báo cáo doanh thu, xử lý ticket bảo trì, duyệt ngoại lệ giá, kiểm soát ca làm việc, báo cáo và bảo trì thiết bị."
        },
        new {
            Username = "frontdesk",
            Email = "frontdesk@hotel.com",
            Password = "Password1@",
            Role = UserRole.FrontDesk,
            Fullname = "Lê Văn Lễ Tân",
            PhoneNumber = "0901000003",
            Description = "Thực hiện nghiệp vụ front desk: đặt phòng, check-in/out, thu cọc, ghi charge F&B/minibar, đổi phòng, thao tác trên calendar, đối soát thu chi và gửi yêu cầu ngoại lệ."
        },
        new {
            Username = "kitchen",
            Email = "kitchen@hotel.com",
            Password = "Password1@",
            Role = UserRole.Kitchen,
            Fullname = "Phạm Thị Bếp",
            PhoneNumber = "0901000004",
            Description = "Nhận và xử lý ticket món ăn trong Kitchen Display System, cập nhật trạng thái chế biến."
        },
        new {
            Username = "waiter",
            Email = "waiter@hotel.com",
            Password = "Password1@",
            Role = UserRole.Waiter,
            Fullname = "Hoàng Văn Phục Vụ",
            PhoneNumber = "0901000005",
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
                    Fullname = user.Fullname,
                    PhoneNumber = user.PhoneNumber,
                    LockoutEnd = DateTime.Now.AddMonths(-1),
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
                        HotelId = DEFAULT_HOTEL_ID,
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
