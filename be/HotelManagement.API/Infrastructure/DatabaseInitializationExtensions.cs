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
            SeedMenuItemsAsync(dbContext).GetAwaiter().GetResult();
            SeedPromotionsAsync(dbContext).GetAwaiter().GetResult();
            SeedMinibarsAsync(dbContext).GetAwaiter().GetResult();
            SeedTablesAsync(dbContext).GetAwaiter().GetResult();
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
            var floor = 1;
            for (int i = index; i <= 5; i++)
            {
                floor = (i - 1) / 2 + 1;
                rooms.Add(new HotelRoom
                {
                    Id = Guid.NewGuid(),
                    HotelId = hotelId,
                    RoomTypeId = roomType.Id,
                    Number = $"P-{floor}{(i + index):D2}", // e.g., STD-001
                    Floor = floor, // simple floor calculation
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

    public static async Task SeedMenuItemsAsync(DbContext dbContext)
    {
        var hotelId = DEFAULT_HOTEL_ID;
        // Check if there are any menu items already
        if (await dbContext.Set<MenuItem>().AnyAsync())
            return; // Already seeded

        var menuItems = new List<MenuItem>
        {
            new MenuItem { Id = Guid.NewGuid(), HotelId = hotelId, Category = "Món khai vị", Name = "Gỏi cuốn tôm thịt", Description = "Món cuốn truyền thống Việt Nam, gồm tôm, thịt heo, rau sống và bún.", UnitPrice = 35000, ImageUrl = "/images/menu/goi-cuon-tom-thit.jpg" },
            new MenuItem { Id = Guid.NewGuid(), HotelId = hotelId, Category = "Món khai vị", Name = "Chả giò rế", Description = "Chả giò rế chiên giòn, nhân thịt heo và rau củ.", UnitPrice = 40000, ImageUrl = "/images/menu/cha-gio-re.jpg" },
            new MenuItem { Id = Guid.NewGuid(), HotelId = hotelId, Category = "Món chính", Name = "Phở bò đặc biệt", Description = "Phở bò truyền thống với nước dùng đậm đà, thịt bò tái chín.", UnitPrice = 55000, ImageUrl = "/images/menu/pho-bo.jpg" },
            new MenuItem { Id = Guid.NewGuid(), HotelId = hotelId, Category = "Món chính", Name = "Bún chả Hà Nội", Description = "Bún chả nướng ăn kèm nước mắm chua ngọt và rau sống.", UnitPrice = 50000, ImageUrl = "/images/menu/bun-cha.jpg" },
            new MenuItem { Id = Guid.NewGuid(), HotelId = hotelId, Category = "Món chính", Name = "Cơm tấm sườn bì chả", Description = "Cơm tấm ăn kèm sườn nướng, bì, chả trứng hấp và nước mắm tỏi ớt.", UnitPrice = 60000, ImageUrl = "/images/menu/com-tam.jpg" },
            new MenuItem { Id = Guid.NewGuid(), HotelId = hotelId, Category = "Món chính", Name = "Bánh xèo miền Tây", Description = "Bánh xèo vàng giòn, nhân tôm thịt, giá đỗ, ăn kèm rau sống.", UnitPrice = 45000, ImageUrl = "/images/menu/banh-xeo.jpg" },
            new MenuItem { Id = Guid.NewGuid(), HotelId = hotelId, Category = "Món chính", Name = "Bò lúc lắc", Description = "Thịt bò cắt vuông, xào với hành tây, ớt chuông, dùng kèm khoai tây chiên.", UnitPrice = 85000, ImageUrl = "/images/menu/bo-luc-lac.jpg" },
            new MenuItem { Id = Guid.NewGuid(), HotelId = hotelId, Category = "Món lẩu", Name = "Lẩu thái hải sản", Description = "Nước lẩu chua cay kiểu Thái, kèm hải sản tươi ngon.", UnitPrice = 250000, ImageUrl = "/images/menu/lau-thai.jpg" },
            new MenuItem { Id = Guid.NewGuid(), HotelId = hotelId, Category = "Món lẩu", Name = "Lẩu gà lá é", Description = "Món lẩu đặc sản Đà Lạt với gà ta và lá é thơm.", UnitPrice = 220000, ImageUrl = "/images/menu/lau-ga-la-e.jpg" },
            new MenuItem { Id = Guid.NewGuid(), HotelId = hotelId, Category = "Món lẩu", Name = "Lẩu riêu cua bắp bò", Description = "Lẩu riêu cua truyền thống, ăn cùng bắp bò và đậu phụ.", UnitPrice = 230000, ImageUrl = "/images/menu/lau-rieu-cua.jpg" },
            new MenuItem { Id = Guid.NewGuid(), HotelId = hotelId, Category = "Món nướng", Name = "Ba chỉ nướng Hàn Quốc", Description = "Ba chỉ heo tươi nướng than hoa, ăn kèm rau cuốn và kim chi.", UnitPrice = 120000, ImageUrl = "/images/menu/ba-chi-nuong.jpg" },
            new MenuItem { Id = Guid.NewGuid(), HotelId = hotelId, Category = "Món nướng", Name = "Gà nướng mật ong", Description = "Gà nguyên con ướp mật ong nướng thơm phức, da giòn thịt mềm.", UnitPrice = 180000, ImageUrl = "/images/menu/ga-nuong-mat-ong.jpg" },
            new MenuItem { Id = Guid.NewGuid(), HotelId = hotelId, Category = "Món nướng", Name = "Hải sản nướng mỡ hành", Description = "Mực, tôm, sò nướng mỡ hành, chấm muối tiêu chanh.", UnitPrice = 160000, ImageUrl = "/images/menu/hai-san-nuong.jpg" },
            new MenuItem { Id = Guid.NewGuid(), HotelId = hotelId, Category = "Món tráng miệng", Name = "Chè khúc bạch", Description = "Chè mát lạnh với thạch sữa tươi, hạnh nhân, nhãn.", UnitPrice = 35000, ImageUrl = "/images/menu/che-khuc-bach.jpg" },
            new MenuItem { Id = Guid.NewGuid(), HotelId = hotelId, Category = "Món tráng miệng", Name = "Bánh flan caramel", Description = "Bánh flan mềm mịn, vị ngọt dịu và lớp caramel hấp dẫn.", UnitPrice = 30000, ImageUrl = "/images/menu/banh-flan.jpg" },
            new MenuItem { Id = Guid.NewGuid(), HotelId = hotelId, Category = "Món tráng miệng", Name = "Kem dừa non", Description = "Kem dừa béo ngậy, ăn kèm cơm dừa non và thạch dừa.", UnitPrice = 40000, ImageUrl = "/images/menu/kem-dua.jpg" },
            new MenuItem { Id = Guid.NewGuid(), HotelId = hotelId, Category = "Thức uống", Name = "Nước mía sầu riêng", Description = "Nước mía tươi pha sầu riêng thơm béo.", UnitPrice = 30000, ImageUrl = "/images/menu/nuoc-mia-sau-rieng.jpg" },
            new MenuItem { Id = Guid.NewGuid(), HotelId = hotelId, Category = "Thức uống", Name = "Cà phê sữa đá", Description = "Cà phê Việt Nam pha phin truyền thống, thêm sữa đặc và đá.", UnitPrice = 25000, ImageUrl = "/images/menu/ca-phe-sua-da.jpg" },
            new MenuItem { Id = Guid.NewGuid(), HotelId = hotelId, Category = "Thức uống", Name = "Trà tắc mật ong", Description = "Trà tắc tươi kết hợp mật ong rừng, vị thanh mát.", UnitPrice = 25000, ImageUrl = "/images/menu/tra-tac-mat-ong.jpg" },
            new MenuItem { Id = Guid.NewGuid(), HotelId = hotelId, Category = "Thức uống", Name = "Sinh tố xoài", Description = "Sinh tố xoài tươi xay nhuyễn, vị ngọt tự nhiên.", UnitPrice = 40000, ImageUrl = "/images/menu/sinh-to-xoai.jpg" }
        };

        dbContext.Set<MenuItem>().AddRange(menuItems);
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
        },
         new {
            Username = "housekeeping",
            Email = "housekeeping@hotel.com",
            Password = "Password1@",
            Role = UserRole.Housekeeper,
            Fullname = "Nguyễn Thùy Linh",
            PhoneNumber = "0901000005",
            Description = "Dọn phòng, báo cáo tình trọng phòng."
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

    public static async Task SeedPromotionsAsync(DbContext dbContext)
    {
        var hotelId = DEFAULT_HOTEL_ID;

        // Prevent duplicate seeding
        if (await dbContext.Set<Promotion>().AnyAsync())
            return;

        var promotions = new List<Promotion>
    {
        new Promotion
        {
            Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
            HotelId = hotelId,
            Code = "WELCOME10",
            Description = "Giảm 10% cho khách mới",
            Value = 10,
            IsActive = true,
            StartDate = new DateTime(2025, 1, 1),
            EndDate = new DateTime(2025, 12, 31),
            CreatedAt = DateTime.UtcNow
        },
        new Promotion
        {
            Id = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
            HotelId = hotelId,
            Code = "SUMMER20",
            Description = "Khuyến mãi mùa hè giảm 20%",
            Value = 20,
            IsActive = true,
            StartDate = new DateTime(2025, 6, 1),
            EndDate = new DateTime(2025, 8, 31),
            CreatedAt = DateTime.UtcNow
        },
        new Promotion
        {
            Id = Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccccccc"),
            HotelId = hotelId,
            Code = "WEEKEND15",
            Description = "Giảm 15% cho khách đặt phòng cuối tuần",
            Value = 15,
            IsActive = true,
            StartDate = new DateTime(2025, 1, 1),
            EndDate = new DateTime(2025, 12, 31),
            CreatedAt = DateTime.UtcNow
        },
        new Promotion
        {
            Id = Guid.Parse("dddddddd-dddd-dddd-dddd-dddddddddddd"),
            HotelId = hotelId,
            Code = "LONGSTAY25",
            Description = "Giảm 25% cho khách ở trên 7 đêm",
            Value = 25,
            IsActive = true,
            StartDate = new DateTime(2025, 1, 1),
            EndDate = new DateTime(2025, 12, 31),
            CreatedAt = DateTime.UtcNow
        },
        new Promotion
        {
            Id = Guid.Parse("eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee"),
            HotelId = hotelId,
            Code = "FLASH5",
            Description = "Giảm 5% trong khung giờ vàng",
            Value = 5,
            IsActive = true,
            StartDate = new DateTime(2025, 2, 1),
            EndDate = new DateTime(2025, 2, 7),
            CreatedAt = DateTime.UtcNow
        }
    };

        dbContext.Set<Promotion>().AddRange(promotions);
        await dbContext.SaveChangesAsync();
    }

    public static async Task SeedMinibarsAsync(DbContext dbContext)
    {
        var hotelId = DEFAULT_HOTEL_ID;

        // Get all room types for this hotel
        var roomTypes = await dbContext.Set<RoomType>()
            .Where(rt => rt.HotelId == hotelId)
            .ToListAsync();

        if (!roomTypes.Any())
            return; // No room types → nothing to seed

        foreach (var roomType in roomTypes)
        {
            // Check if minibar items already seeded for this room type
            bool exists = await dbContext.Set<Minibar>()
                .AnyAsync(m => m.RoomTypeId == roomType.Id);

            if (exists)
                continue;

            var items = new List<Minibar>
        {
            new Minibar
            {
                Id = Guid.NewGuid(),
                HotelId = hotelId,
                RoomTypeId = roomType.Id,
                Name = "Nước suối Aquafina",
                Price = 10000,
                Quantity = 2
            },
            new Minibar
            {
                Id = Guid.NewGuid(),
                HotelId = hotelId,
                RoomTypeId = roomType.Id,
                Name = "Coca-Cola",
                Price = 15000,
                Quantity = 2
            },
            new Minibar
            {
                Id = Guid.NewGuid(),
                HotelId = hotelId,
                RoomTypeId = roomType.Id,
                Name = "Snack khoai tây",
                Price = 20000,
                Quantity = 1
            },
            new Minibar
            {
                Id = Guid.NewGuid(),
                HotelId = hotelId,
                RoomTypeId = roomType.Id,
                Name = "Bia Heineken",
                Price = 25000,
                Quantity = 2
            },
            new Minibar
            {
                Id = Guid.NewGuid(),
                HotelId = hotelId,
                RoomTypeId = roomType.Id,
                Name = "Trà xanh Không Độ",
                Price = 12000,
                Quantity = 1
            }
        };

            dbContext.Set<Minibar>().AddRange(items);
        }

        await dbContext.SaveChangesAsync();
    }

    public static async Task SeedTablesAsync(DbContext dbContext)
    {
        var hotelId = DEFAULT_HOTEL_ID;

        // If tables already exist, skip
        if (await dbContext.Set<Table>().AnyAsync(t => t.HotelId == hotelId))
            return;

        var tables = new List<Table>();

        for (int i = 1; i <= 20; i++)
        {
            tables.Add(new Table
            {
                Id = Guid.NewGuid(),
                HotelId = hotelId,
                Name = $"T{i}",              // Table name T1 → T20
                Capacity = i % 4 + 2,        // Capacity 2–5 seats (cycle)
                IsActive = true,
                TableStatus = 0              // 0 = Available
            });
        }

        dbContext.Set<Table>().AddRange(tables);
        await dbContext.SaveChangesAsync();
    }

}
