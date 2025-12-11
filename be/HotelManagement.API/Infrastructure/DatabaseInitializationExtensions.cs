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
            SeedMenuSetsAsync(dbContext).GetAwaiter().GetResult();
            SeedPromotionsAsync(dbContext).GetAwaiter().GetResult();
            SeedMinibarsAsync(dbContext).GetAwaiter().GetResult();
            SeedTablesAsync(dbContext).GetAwaiter().GetResult();
            //SeedHousekeepingTasksAsync(dbContext).GetAwaiter().GetResult();
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
        var legacyHotelId = DEFAULT_HOTEL_ID;

        var tts1 = await dbContext.Set<Hotel>().FirstOrDefaultAsync(h => h.Code == "TTS1");
        var tts1HotelId = tts1?.Id;
        var tts2 = await dbContext.Set<Hotel>().FirstOrDefaultAsync(h => h.Code == "TTS2");
        var tts2HotelId = tts2?.Id;
        var tts3 = await dbContext.Set<Hotel>().FirstOrDefaultAsync(h => h.Code == "TTS3");
        var tts3HotelId = tts3?.Id;

        var allRooms = new List<HotelRoom>();

        var legacyRoomsExist = await dbContext.Set<HotelRoom>().AnyAsync(r => r.HotelId == legacyHotelId);
        if (!legacyRoomsExist)
        {
            var legacyRoomTypes = await dbContext.Set<RoomType>()
                .Where(rt => rt.HotelId == legacyHotelId)
                .ToListAsync();
            if (legacyRoomTypes.Any())
            {
                var mappingLegacy = new Dictionary<string, string[]>
                {
                    {
                        "Phòng Superior Có Giường Cỡ Queen",
                        new[] { "101", "102", "203", "204", "205", "206", "207", "208", "209", "210", "211", "303", "304", "305", "306", "307", "308", "309", "310", "311", "403", "404", "405", "406", "407", "408", "409", "410", "411", "503", "504", "505", "506", "507", "508", "509", "510", "511", "603", "604", "605", "606", "607", "608", "609", "610", "611" }
                    },
                    {
                        "Phòng Deluxe nhìn ra biển",
                        new[] { "201", "202", "301", "302", "401", "402", "501", "502", "601", "602" }
                    },
                    {
                        "Studio nhìn ra quang cảnh đại dương",
                        new[] { "701", "702", "703", "704", "705" }
                    }
                };

                foreach (var kv in mappingLegacy)
                {
                    var rt = legacyRoomTypes.FirstOrDefault(x => x.Name == kv.Key);
                    if (rt == null) continue;
                    foreach (var num in kv.Value)
                    {
                        var floor = int.Parse(num) / 100;
                        allRooms.Add(new HotelRoom
                        {
                            Id = Guid.NewGuid(),
                            HotelId = legacyHotelId,
                            RoomTypeId = rt.Id,
                            Number = num,
                            Floor = floor,
                            Status = RoomStatus.Available
                        });
                    }
                }
            }
        }

        if (tts1HotelId.HasValue)
        {
            var tts1RoomsExist = await dbContext.Set<HotelRoom>().AnyAsync(r => r.HotelId == tts1HotelId.Value);
            if (!tts1RoomsExist)
            {
                var tts1RoomTypes = await dbContext.Set<RoomType>()
                    .Where(rt => rt.HotelId == tts1HotelId.Value)
                    .ToListAsync();
                if (tts1RoomTypes.Any())
                {
                    var mappingTts1 = new Dictionary<string, string[]>
                    {
                        {
                            "Phòng Superior Có Giường Cỡ Queen",
                            new[] { "201", "202", "203", "204", "205", "206", "301", "302", "303", "304", "305", "306", "401", "402", "403", "404", "405", "406", "501", "502", "503", "504", "505", "506", "601", "602", "603", "604", "605", "606", "701", "702", "703", "704", "705", "706", "801", "802", "803", "804", "805", "806", "901", "902", "903", "904", "905", "906" }
                        },
                        {
                            "Phòng Deluxe nhìn ra biển",
                            new[] { "207", "208", "307", "308", "407", "408", "507", "508", "607", "608", "707", "708", "807", "808", "907", "908" }
                        }
                    };

                    foreach (var kv in mappingTts1)
                    {
                        var rt = tts1RoomTypes.FirstOrDefault(x => x.Name == kv.Key);
                        if (rt == null) continue;
                        foreach (var num in kv.Value)
                        {
                            var floor = int.Parse(num) / 100;
                            allRooms.Add(new HotelRoom
                            {
                                Id = Guid.NewGuid(),
                                HotelId = tts1HotelId.Value,
                                RoomTypeId = rt.Id,
                                Number = num,
                                Floor = floor,
                                Status = RoomStatus.Available
                            });
                        }
                    }
                }
            }
        }

        if (tts2HotelId.HasValue)
        {
            var tts2RoomsExist = await dbContext.Set<HotelRoom>().AnyAsync(r => r.HotelId == tts2HotelId.Value);
            if (!tts2RoomsExist)
            {
                var tts2RoomTypes = await dbContext.Set<RoomType>()
                    .Where(rt => rt.HotelId == tts2HotelId.Value)
                    .ToListAsync();
                if (tts2RoomTypes.Any())
                {
                    var mappingTts2 = new Dictionary<string, string[]>
                    {
                        {
                            "Phòng Gia Đình Có Ban Công view Resort",
                            new[] { "301", "302", "303", "306", "401", "402", "403", "406", "501", "502", "503", "506", "604" }
                        },
                        {
                            "Phòng Deluxe nhìn ra biển",
                            new[] { "204", "205", "206", "304", "305", "404", "405", "504", "505", "601", "602", "603" }
                        }
                    };

                    foreach (var kv in mappingTts2)
                    {
                        var rt = tts2RoomTypes.FirstOrDefault(x => x.Name == kv.Key);
                        if (rt == null) continue;
                        foreach (var num in kv.Value)
                        {
                            var floor = int.Parse(num) / 100;
                            allRooms.Add(new HotelRoom
                            {
                                Id = Guid.NewGuid(),
                                HotelId = tts2HotelId.Value,
                                RoomTypeId = rt.Id,
                                Number = num,
                                Floor = floor,
                                Status = RoomStatus.Available
                            });
                        }
                    }
                }
            }
        }

        if (tts3HotelId.HasValue)
        {
            var tts3RoomsExist = await dbContext.Set<HotelRoom>().AnyAsync(r => r.HotelId == tts3HotelId.Value);
            if (!tts3RoomsExist)
            {
                var tts3RoomTypes = await dbContext.Set<RoomType>()
                    .Where(rt => rt.HotelId == tts3HotelId.Value)
                    .ToListAsync();
                if (tts3RoomTypes.Any())
                {
                    var mappingTts3 = new Dictionary<string, string[]>
                    {
                        {
                            "Phòng Deluxe nhìn ra biển",
                            new[] { "201", "202", "203", "206", "301", "302", "303", "306", "401", "402", "403", "406", "501", "502", "503", "506", "601", "602", "603", "606" }
                        },
                        {
                            "Studio nhìn ra quang cảnh đại dương",
                            new[] { "204", "205", "304", "305", "405", "406", "505", "506", "605", "606" }
                        },
                        {
                            "Phòng Superior Có Giường Cỡ Queen",
                            new[] { "207", "208", "209", "210", "307", "308", "309", "310", "407", "408", "409", "410", "507", "508", "509", "510", "607", "608", "609", "610" }
                        }
                    };

                    foreach (var kv in mappingTts3)
                    {
                        var rt = tts3RoomTypes.FirstOrDefault(x => x.Name == kv.Key);
                        if (rt == null) continue;
                        foreach (var num in kv.Value)
                        {
                            var floor = int.Parse(num) / 100;
                            allRooms.Add(new HotelRoom
                            {
                                Id = Guid.NewGuid(),
                                HotelId = tts3HotelId.Value,
                                RoomTypeId = rt.Id,
                                Number = num,
                                Floor = floor,
                                Status = RoomStatus.Available
                            });
                        }
                    }
                }
            }
        }

        if (allRooms.Any())
        {
            dbContext.Set<HotelRoom>().AddRange(allRooms);
            await dbContext.SaveChangesAsync();
        }
    }

    public static async Task SeedRoomTypesAsync(DbContext dbContext)
    {
        var legacyHotelId = DEFAULT_HOTEL_ID;
        var tts1 = await dbContext.Set<Hotel>().FirstOrDefaultAsync(h => h.Code == "TTS1");
        var tts1HotelId = tts1?.Id;
        var tts2 = await dbContext.Set<Hotel>().FirstOrDefaultAsync(h => h.Code == "TTS2");
        var tts2HotelId = tts2?.Id;
        var tts3 = await dbContext.Set<Hotel>().FirstOrDefaultAsync(h => h.Code == "TTS3");
        var tts3HotelId = tts3?.Id;

        var toAdd = new List<RoomType>();

        var legacyExists = await dbContext.Set<RoomType>().AnyAsync(rt => rt.HotelId == legacyHotelId);
        if (!legacyExists)
        {
            toAdd.AddRange(new[]
            {
                new RoomType
                {
                    Id = Guid.NewGuid(),
                    HotelId = legacyHotelId,
                    Capacity = 4,
                    Name = "Phòng Superior Có Giường Cỡ Queen",
                    Description = "Phòng được trang bị máy điều hòa, tivi màn hình phẳng với truyền hình cáp, hệ thống cách âm đảm bảo sự riêng tư và minibar tiện lợi. Không gian được bố trí tủ quần áo gọn gàng và sở hữu tầm nhìn hướng ra thành phố. Phòng gồm 2 giường đơn, phù hợp cho khách đi cùng gia đình hoặc du lịch cùng bạn đồng hành.",
                    BasePriceFrom = 400000,
                    BasePriceTo = 550000,
                    Prices = "",
                    ImageUrl = "https://byvn.net/ajHK"
                },
                new RoomType
                {
                    Id = Guid.NewGuid(),
                    HotelId = legacyHotelId,
                    Capacity = 4,
                    Name = "Phòng Deluxe nhìn ra biển",
                    Description = "Phòng được trang bị máy điều hòa, tivi màn hình phẳng với truyền hình cáp, hệ thống cách âm đảm bảo sự riêng tư và minibar tiện lợi. Không gian được bố trí tủ quần áo gọn gàng và sở hữu tầm nhìn hướng ra biển. Phòng gồm 2 giường cỡ lớn, phù hợp cho khách đi cùng gia đình hoặc du lịch cùng bạn đồng hành.",
                    BasePriceFrom = 500000,
                    BasePriceTo = 650000,
                    Prices = "",
                    ImageUrl = "https://byvn.net/gO4v"
                },
                new RoomType
                {
                    Id = Guid.NewGuid(),
                    HotelId = legacyHotelId,
                    Capacity = 4,
                    Name = "Studio nhìn ra quang cảnh đại dương",
                    Description = "Phòng được trang bị máy điều hòa, bàn làm việc, sofa, TV màn hình phẳng với các kênh truyền hình cáp, hệ thống cách âm đảm bảo sự riêng tư và minibar tiện lợi. Ban công nhìn ra biển. Phòng tắm riêng đi kèm tiện nghi vòi sen và bồn tắm. Phòng gồm 2 giường cỡ lớn, phù hợp cho khách đi cùng gia đình hoặc du lịch cùng bạn bè đồng hành",
                    BasePriceFrom = 1000000,
                    BasePriceTo = 1200000,
                    Prices = "",
                    ImageUrl = "https://byvn.net/8a8J",
                }
            });
        }

        if (tts1HotelId.HasValue)
        {
            var tts1Exists = await dbContext.Set<RoomType>().AnyAsync(rt => rt.HotelId == tts1HotelId.Value);
            if (!tts1Exists)
            {
                toAdd.AddRange(new[]
                {
                    new RoomType
                    {
                        Id = Guid.NewGuid(),
                        HotelId = tts1HotelId.Value,
                        Capacity = 4,
                        Name = "Phòng Superior Có Giường Cỡ Queen",
                        Description = "Phòng được trang bị máy điều hòa, tivi màn hình phẳng với truyền hình cáp, hệ thống cách âm đảm bảo sự riêng tư và minibar tiện lợi. Không gian được bố trí tủ quần áo gọn gàng và sở hữu tầm nhìn hướng ra thành phố. Phòng gồm 2 giường đơn, phù hợp cho khách đi cùng gia đình hoặc du lịch cùng bạn đồng hành.",
                        BasePriceFrom = 400000,
                        BasePriceTo = 550000,
                        Prices = "",
                        ImageUrl = "https://byvn.net/zD6T"
                    },
                    new RoomType
                    {
                        Id = Guid.NewGuid(),
                        HotelId = tts1HotelId.Value,
                        Capacity = 4,
                        Name = "Phòng Deluxe nhìn ra biển",
                        Description = "Phòng được trang bị máy điều hòa, tivi màn hình phẳng với truyền hình cáp, hệ thống cách âm đảm bảo sự riêng tư và minibar tiện lợi. Không gian được bố trí tủ quần áo gọn gàng và sở hữu tầm nhìn hướng ra biển. Phòng gồm 2 giường cỡ lớn, phù hợp cho khách đi cùng gia đình hoặc du lịch cùng bạn đồng hành.",
                        BasePriceFrom = 500000,
                        BasePriceTo = 650000,
                        Prices = "",
                        ImageUrl = "https://byvn.net/RBLG"
                    }
                });
            }
        }

        if (tts2HotelId.HasValue)
        {
            var tts2Exists = await dbContext.Set<RoomType>().AnyAsync(rt => rt.HotelId == tts2HotelId.Value);
            if (!tts2Exists)
            {
                toAdd.AddRange(new[]
                {
                    new RoomType
                    {
                        Id = Guid.NewGuid(),
                        HotelId = tts2HotelId.Value,
                        Capacity = 4,
                        Name = "Phòng Gia Đình Có Ban Công view Resort",
                        Description = "Phòng được trang bị máy điều hòa, tivi màn hình phẳng với truyền hình cáp, hệ thống cách âm đảm bảo sự riêng tư và minibar tiện lợi. Không gian được bố trí tủ quần áo gọn gàng và sở hữu ban công tầm nhìn hướng ra resort FLC. Phòng gồm 2 giường đơn, phù hợp cho khách đi cùng gia đình hoặc du lịch cùng bạn đồng hành.",
                        BasePriceFrom = 750000,
                        BasePriceTo = 950000,
                        Prices = "",
                        ImageUrl = "https://byvn.net/KxLu"
                    },
                    new RoomType
                    {
                        Id = Guid.NewGuid(),
                        HotelId = tts2HotelId.Value,
                        Capacity = 4,
                        Name = "Phòng Deluxe nhìn ra biển",
                        Description = "Phòng được trang bị máy điều hòa, tivi màn hình phẳng với truyền hình cáp, hệ thống cách âm đảm bảo sự riêng tư và minibar tiện lợi. Không gian được bố trí tủ quần áo gọn gàng và sở hữu tầm nhìn hướng ra biển. Phòng gồm 2 giường cỡ lớn, phù hợp cho khách đi cùng gia đình hoặc du lịch cùng bạn đồng hành.",
                        BasePriceFrom = 800000,
                        BasePriceTo = 1000000,
                        Prices = "",
                        ImageUrl = "https://byvn.net/A6jV"
                    }
                });
            }
        }

        if (tts3HotelId.HasValue)
        {
            var tts3Exists = await dbContext.Set<RoomType>().AnyAsync(rt => rt.HotelId == tts3HotelId.Value);
            if (!tts3Exists)
            {
                toAdd.AddRange(new[]
                {
                    new RoomType
                    {
                        Id = Guid.NewGuid(),
                        HotelId = tts3HotelId.Value,
                        Capacity = 4,
                        Name = "Phòng Deluxe nhìn ra biển",
                        Description = "Phòng được trang bị máy điều hòa, tivi màn hình phẳng với truyền hình cáp, hệ thống cách âm đảm bảo sự riêng tư và minibar tiện lợi. Không gian được bố trí tủ quần áo gọn gàng và sở hữu tầm nhìn hướng ra thành phố. Phòng gồm 2 giường đơn, phù hợp cho khách đi cùng gia đình hoặc du lịch cùng bạn đồng hành.",
                        BasePriceFrom = 550000,
                        BasePriceTo = 700000,
                        Prices = "",
                        ImageUrl = "https://byvn.net/Yigf"
                    },
                    new RoomType
                    {
                        Id = Guid.NewGuid(),
                        HotelId = tts3HotelId.Value,
                        Capacity = 4,
                        Name = "Studio nhìn ra quang cảnh đại dương",
                        Description = "Phòng được trang bị máy điều hòa, bàn làm việc, sofa, TV màn hình phẳng với các kênh truyền hình cáp, hệ thống cách âm đảm bảo sự riêng tư và minibar tiện lợi. Ban công nhìn ra biển. Phòng tắm riêng đi kèm tiện nghi vòi sen và bồn tắm. Phòng gồm 2 giường cỡ lớn, phù hợp cho khách đi cùng gia đình hoặc du lịch cùng bạn bè đồng hành",
                        BasePriceFrom = 800000,
                        BasePriceTo = 1000000,
                        Prices = "",
                        ImageUrl = "https://byvn.net/ts1R"
                    },
                    new RoomType
                    {
                        Id = Guid.NewGuid(),
                        HotelId = tts3HotelId.Value,
                        Capacity = 4,
                        Name = "Phòng Superior Có Giường Cỡ Queen",
                        Description = "Phòng được trang bị máy điều hòa, tivi màn hình phẳng với truyền hình cáp, hệ thống cách âm đảm bảo sự riêng tư và minibar tiện lợi. Không gian được bố trí tủ quần áo gọn gàng và sở hữu tầm nhìn hướng ra thành phố. Phòng gồm 2 giường đơn, phù hợp cho khách đi cùng gia đình hoặc du lịch cùng bạn đồng hành.",
                        BasePriceFrom = 450000,
                        BasePriceTo = 600000,
                        Prices = "",
                        ImageUrl = "https://byvn.net/yagH"
                    }
                });
            }
        }

        if (toAdd.Any())
        {
            dbContext.Set<RoomType>().AddRange(toAdd);
            await dbContext.SaveChangesAsync();
        }
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
                CreatedAt = DateTime.Now,
                DefaultCheckInTime = DateTime.Today.AddHours(7),   // 7 AM
                DefaultCheckOutTime = DateTime.Today.AddHours(13), // 1 PM
                VAT = 8,
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
                CreatedAt = DateTime.Now,
                DefaultCheckInTime = DateTime.Today.AddHours(7),   // 7 AM
                DefaultCheckOutTime = DateTime.Today.AddHours(13), // 1 PM
                VAT = 8,
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
                CreatedAt = DateTime.Now,
                DefaultCheckInTime = DateTime.Today.AddHours(7),   // 7 AM
                DefaultCheckOutTime = DateTime.Today.AddHours(13), // 1 PM
                VAT = 8,
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
                CreatedAt = DateTime.Now,
                DefaultCheckInTime = DateTime.Today.AddHours(7),   // 7 AM
                DefaultCheckOutTime = DateTime.Today.AddHours(13), // 1 PM
                VAT = 8,
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
            new MenuItem { Id = Guid.NewGuid(), HotelId = hotelId, Category = "Món chính", Name = "Hamburger bò", Description = "Hamburger thịt bò nóng hổi với rau xà lách, cà chua và sốt đặc trưng.", UnitPrice = 75000, ImageUrl = "https://png.pngtree.com/png-clipart/20230325/original/pngtree-juicy-burgers-with-a-transparent-background-png-image_9002761.png" },
            new MenuItem { Id = Guid.NewGuid(), HotelId = hotelId, Category = "Món khai vị", Name = "Gỏi cuốn tôm thịt", Description = "Món cuốn truyền thống Việt Nam, gồm tôm, thịt heo, rau sống và bún.", UnitPrice = 35000, ImageUrl = "https://static.vecteezy.com/system/resources/previews/021/333/207/original/white-plate-with-food-isolated-on-a-transparent-background-png.png" },
            new MenuItem { Id = Guid.NewGuid(), HotelId = hotelId, Category = "Món khai vị", Name = "Chả giò rế", Description = "Chả giò rế chiên giòn, nhân thịt heo và rau củ.", UnitPrice = 40000, ImageUrl = "https://cjfoods.com.vn/storage/nganh/product-detail-cha-gio-2-1200x1200.png" },
            new MenuItem { Id = Guid.NewGuid(), HotelId = hotelId, Category = "Món chính", Name = "Phở bò đặc biệt", Description = "Phở bò truyền thống với nước dùng đậm đà, thịt bò tái chín.", UnitPrice = 55000, ImageUrl = "https://png.pngtree.com/png-vector/20240827/ourmid/pngtree-pho-beef-noodle-png-image_13375199.png" },
            new MenuItem { Id = Guid.NewGuid(), HotelId = hotelId, Category = "Món chính", Name = "Bún chả Hà Nội", Description = "Bún chả nướng ăn kèm nước mắm chua ngọt và rau sống.", UnitPrice = 50000, ImageUrl = "https://www.mysaigon.cz/wp-content/uploads/2018/11/N11A2761-cropped-1-1170x679.png" },
            new MenuItem { Id = Guid.NewGuid(), HotelId = hotelId, Category = "Món chính", Name = "Cơm tấm sườn bì chả", Description = "Cơm tấm ăn kèm sườn nướng, bì, chả trứng hấp và nước mắm tỏi ớt.", UnitPrice = 60000, ImageUrl = "https://png.pngtree.com/png-vector/20241225/ourmid/pngtree-grilled-pork-chop-with-side-delights-png-image_14849365.png" },
            new MenuItem { Id = Guid.NewGuid(), HotelId = hotelId, Category = "Món chính", Name = "Bánh xèo miền Tây", Description = "Bánh xèo vàng giòn, nhân tôm thịt, giá đỗ, ăn kèm rau sống.", UnitPrice = 45000, ImageUrl = "https://viquekitchen.com/wp-content/uploads/2024/06/Banh-xeo-Xeo-cake-Trans-Small.png" },
            new MenuItem { Id = Guid.NewGuid(), HotelId = hotelId, Category = "Món chính", Name = "Bò lúc lắc", Description = "Thịt bò cắt vuông, xào với hành tây, ớt chuông, dùng kèm khoai tây chiên.", UnitPrice = 85000, ImageUrl = "https://lauductroc.com/wp-content/uploads/2024/08/DSC03901.png" },
            new MenuItem { Id = Guid.NewGuid(), HotelId = hotelId, Category = "Món lẩu", Name = "Lẩu thái hải sản", Description = "Nước lẩu chua cay kiểu Thái, kèm hải sản tươi ngon.", UnitPrice = 250000, ImageUrl = "https://sgfoods.com.vn/sites/default/files/product_images/noi-lau-thai-hres.png" },
            new MenuItem { Id = Guid.NewGuid(), HotelId = hotelId, Category = "Món lẩu", Name = "Lẩu gà lá é", Description = "Món lẩu đặc sản Đà Lạt với gà ta và lá é thơm.", UnitPrice = 220000, ImageUrl = "https://khruabaanthai.com.vn/wp-content/uploads/2024/01/sot-cham-lau-kieu-thai-flyer-a4-15-20240105162205-oqtu6.png" },
            new MenuItem { Id = Guid.NewGuid(), HotelId = hotelId, Category = "Món lẩu", Name = "Lẩu riêu cua bắp bò", Description = "Lẩu riêu cua truyền thống, ăn cùng bắp bò và đậu phụ.", UnitPrice = 230000, ImageUrl = "https://barona.vn/storage/san-pham/nuoc-dung/noi-lau-rieu-cua.png" },
            new MenuItem { Id = Guid.NewGuid(), HotelId = hotelId, Category = "Món nướng", Name = "Ba chỉ nướng Hàn Quốc", Description = "Ba chỉ heo tươi nướng than hoa, ăn kèm rau cuốn và kim chi.", UnitPrice = 120000, ImageUrl = "https://png.pngtree.com/png-vector/20231213/ourmid/pngtree-watercolor-korean-barbecue-platter-free-elements-png-image_11328037.png" },
            new MenuItem { Id = Guid.NewGuid(), HotelId = hotelId, Category = "Món nướng", Name = "Gà nướng mật ong", Description = "Gà nguyên con ướp mật ong nướng thơm phức, da giòn thịt mềm.", UnitPrice = 180000, ImageUrl = "https://png.pngtree.com/png-clipart/20250606/original/pngtree-honey-glazed-grilled-chicken-with-sambal-and-fresh-vegetables-png-image_21130470.png" },
            new MenuItem { Id = Guid.NewGuid(), HotelId = hotelId, Category = "Món nướng", Name = "Hải sản nướng mỡ hành", Description = "Mực, tôm, sò nướng mỡ hành, chấm muối tiêu chanh.", UnitPrice = 160000, ImageUrl = "https://nhahangngocphuongnam.com/wp-content/uploads/2024/06/nha-hang-ngoc-phuong-nam-tu-hai-nuong-mo-hanh.png" },
            new MenuItem { Id = Guid.NewGuid(), HotelId = hotelId, Category = "Món tráng miệng", Name = "Chè khúc bạch", Description = "Chè mát lạnh với thạch sữa tươi, hạnh nhân, nhãn.", UnitPrice = 35000, ImageUrl = "https://product.hstatic.net/200000863609/product/hoang_ty0622_30b240ec959c465faa620c413302311d_master.png" },
            new MenuItem { Id = Guid.NewGuid(), HotelId = hotelId, Category = "Món tráng miệng", Name = "Bánh flan caramel", Description = "Bánh flan mềm mịn, vị ngọt dịu và lớp caramel hấp dẫn.", UnitPrice = 30000, ImageUrl = "https://png.pngtree.com/png-vector/20240603/ourmid/pngtree-creamy-caramel-flan-dessert-png-image_12611534.png" },
            new MenuItem { Id = Guid.NewGuid(), HotelId = hotelId, Category = "Món tráng miệng", Name = "Kem dừa non", Description = "Kem dừa béo ngậy, ăn kèm cơm dừa non và thạch dừa.", UnitPrice = 40000, ImageUrl = "https://png.pngtree.com/png-vector/20240730/ourmid/pngtree-coconut-ice-cream-png-image_13301606.png" },
            new MenuItem { Id = Guid.NewGuid(), HotelId = hotelId, Category = "Thức uống", Name = "Nước mía sầu riêng", Description = "Nước mía tươi pha sầu riêng thơm béo.", UnitPrice = 30000, ImageUrl = "https://png.pngtree.com/png-clipart/20241114/original/pngtree-sugarcane-juice-refreshment-png-image_17003578.png" },
            new MenuItem { Id = Guid.NewGuid(), HotelId = hotelId, Category = "Thức uống", Name = "Cà phê sữa đá", Description = "Cà phê Việt Nam pha phin truyền thống, thêm sữa đặc và đá.", UnitPrice = 25000, ImageUrl = "https://png.pngtree.com/png-vector/20250125/ourmid/pngtree-perfect-summer-iced-coffees-png-image_15333609.png" },
            new MenuItem { Id = Guid.NewGuid(), HotelId = hotelId, Category = "Thức uống", Name = "Trà tắc mật ong", Description = "Trà tắc tươi kết hợp mật ong rừng, vị thanh mát.", UnitPrice = 25000, ImageUrl = "https://thuviendohoa.com/ckfinder/userfiles/files/%E2%80%94Pngtree%E2%80%94png%20hand%20drawn%20illustration%20element_5774665.png" },
            new MenuItem { Id = Guid.NewGuid(), HotelId = hotelId, Category = "Thức uống", Name = "Sinh tố xoài", Description = "Sinh tố xoài tươi xay nhuyễn, vị ngọt tự nhiên.", UnitPrice = 40000, ImageUrl = "https://png.pngtree.com/png-clipart/20240428/original/pngtree-sweet-healthy-mango-smoothie-in-a-glass-png-image_14965979.png" }
        };

        dbContext.Set<MenuItem>().AddRange(menuItems);
        await dbContext.SaveChangesAsync();
    }

    public static async Task SeedMenuSetsAsync(DbContext dbContext)
    {
        var hotelId = DEFAULT_HOTEL_ID;
        bool setsExist = await dbContext.Set<MenuItem>()
            .AnyAsync(mi => mi.HotelId == hotelId && mi.Category == "Set");
        if (setsExist) return;

        var set1 = string.Join("\n", new[]
        {
            "Tôm chao dầu",
            "Mực xào cần tỏi",
            "Cá biển sốt cà chua",
            "Hầu nướng mỡ hành",
            "Ngô chiên",
            "Rau theo mùa",
            "Canh theo ngày",
            "Cơm trắng",
            "Cà pháo"
        });

        var set2 = string.Join("\n", new[]
        {
            "Tôm nướng mọi",
            "Mực nhảy hấp",
            "Cá rim tiêu",
            "Sò xào măng",
            "Khoai chiên",
            "Rau theo mùa",
            "Canh theo ngày",
            "Cơm trắng",
            "Cà pháo"
        });

        var set3 = string.Join("\n", new[]
        {
            "Tôm rang muối",
            "Mực chiên bơ",
            "Gà rang gừng",
            "Mòng tay xào răm",
            "Trứng rán",
            "Rau theo mùa",
            "Canh theo ngày",
            "Cơm trắng",
            "Cà pháo"
        });

        var set4 = string.Join("\n", new[]
        {
            "Móng tay rang me",
            "Mực chiên lá lốt",
            "Ngao nướng mỡ hành",
            "Thịt chưng mắm tép",
            "Rau theo mùa",
            "Canh theo ngày",
            "Cơm trắng",
            "Cà pháo",
            "Khoai chiên",
        });

        var sets = new List<MenuItem>
        {
            new MenuItem { Id = Guid.NewGuid(), HotelId = hotelId, Category = "Set", Name = "Set 1", Description = set1, UnitPrice = 200000, ImageUrl = "https://chacadevuong.com/wp-content/uploads/2023/12/combo-8.png", Status = 0, IsActive = true },
            new MenuItem { Id = Guid.NewGuid(), HotelId = hotelId, Category = "Set", Name = "Set 2", Description = set2, UnitPrice = 300000, ImageUrl = "https://rosepng.com/wp-content/uploads/2024/10/s11728_healthy_food_dish_isolated_on_white_background_-styli_170b6cc9-d8ba-46a5-89e5-537259b148f8_2-photoroom.png", Status = 0, IsActive = true },
            new MenuItem { Id = Guid.NewGuid(), HotelId = hotelId, Category = "Set", Name = "Set 3", Description = set3, UnitPrice = 400000, ImageUrl = "https://freepngimg.com/save/152994-food-junk-combo-free-hq-image/636x397", Status = 0, IsActive = true },
            new MenuItem { Id = Guid.NewGuid(), HotelId = hotelId, Category = "Set", Name = "Set 4", Description = set4, UnitPrice = 500000, ImageUrl = "https://png.pngtree.com/png-clipart/20240909/original/pngtree-best-combo-street-food-tasty-meal-combination-png-image_15972228.png", Status = 0, IsActive = true },
        };

        dbContext.Set<MenuItem>().AddRange(sets);
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
            Description = "Quản lý danh sách bàn, tạo order, chỉnh sửa, void/discount, post charge vào phòng, thu tiền và đóng hóa đơn."
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

        var hotels = await dbContext.Set<Hotel>().Where(h => h.Code == "TTSLEGACY" || h.Code == "TTS1" || h.Code == "TTS2" || h.Code == "TTS3").ToListAsync();
        var roleSeeds = new List<(UserRole role, List<(string name, string phone)> people)> {
            (UserRole.Manager, new List<(string,string)> { ("Văn Việt Anh","0967092888") }),
            (UserRole.FrontDesk, new List<(string,string)> { ("Trần Thị Hương","0361129678"), ("Đinh Hà Quang Anh","0989375972") }),
            (UserRole.Kitchen, new List<(string,string)> { ("Nguyễn Hữu Dũng","0783672973"), ("Trần Viết Hùng","0983452428"), ("Phạm Nguyên Ngọc","0919647283"), ("Hà Thị Lý","0975836475") }),
            (UserRole.Waiter, new List<(string,string)> { ("Nguyễn Thị Huyền","0366127378"), ("Nguyễn Đình Tuấn","0979153656"), ("Hà Văn Dũng","0363945781"), ("Đinh Thị Thanh Thủy","0974231237"), ("Trần Hạ Vy","0904864923") }),
            (UserRole.Housekeeper, new List<(string,string)> { ("Trần Thùy Anh","0989182738"), ("Đinh Thanh Hà","0791283923"), ("Cao Thị Vân","0581769141"), ("Trần Nguyễn Bảo Ngọc","0979123746"), ("Hoàng Thị Loan","0904888157") })
        };

        foreach (var hotel in hotels)
        {
            foreach (var (role, people) in roleSeeds)
            {
                for (int i = 0; i < 2; i++)
                {
                    var person = people[i % people.Count];
                    var username = $"{role.ToString().ToLower()}-{hotel.Code.ToLower()}-{i + 1}";
                    var email = $"{username}@hotel.com";

                    var existing = await userManager.FindByNameAsync(username);
                    if (existing != null) continue;

                    var newUser = new AppUser
                    {
                        UserName = username,
                        Email = email,
                        EmailConfirmed = true,
                        Fullname = person.name,
                        PhoneNumber = person.phone,
                        LockoutEnd = DateTime.Now.AddMonths(-1),
                    };

                    var createResult = await userManager.CreateAsync(newUser, "Password1@");
                    if (createResult.Succeeded)
                    {
                        await userManager.AddToRoleAsync(newUser, role.ToString());
                        dbContext.Set<UserPropertyRole>().Add(new UserPropertyRole
                        {
                            Id = Guid.NewGuid(),
                            HotelId = hotel.Id,
                            UserId = newUser.Id,
                            Role = role
                        });
                    }
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
            Id = Guid.Parse("aaaaaaaa-bbbb-aaaa-aaaa-aaaaaaaaaaaa"),
            HotelId = hotelId,
            Code = "FOOD10",
            Description = "Giảm 10% cho khách mới",
            Value = 10,
            IsActive = true,
            StartDate = new DateTime(2025, 1, 1),
            EndDate = new DateTime(2025, 12, 31),
            CreatedAt = DateTime.Now,
            Scope = "food"
        },
         new Promotion
        {
            Id = Guid.Parse("bbbbbbbb-cccc-bbbb-bbbb-bbbbbbbbbbbb"),
            HotelId = hotelId,
            Code = "SUMMER5",
            Description = "Khuyến mãi mùa hè giảm 5%",
            Value = 5,
            IsActive = true,
            StartDate = new DateTime(2025, 6, 1),
            EndDate = new DateTime(2025, 8, 31),
            CreatedAt = DateTime.Now,
            Scope = "food"

        },

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
            CreatedAt = DateTime.Now
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
            CreatedAt = DateTime.Now
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
            CreatedAt = DateTime.Now
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
            CreatedAt = DateTime.Now
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
            CreatedAt = DateTime.Now
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
                ImageUrl = "https://thanhhaphat.vn/wp-content/uploads/2020/08/nuoc-tinh-khiet-aquafina-350ml-chai.png",
                Price = 10000,
                Quantity = 2
            },
            new Minibar
            {
                Id = Guid.NewGuid(),
                HotelId = hotelId,
                RoomTypeId = roomType.Id,
                Name = "Coca-Cola",
                ImageUrl = "https://shopstocktc.com/cdn/shop/products/stock_coca_cola_800x.png?v=1631722202",
                Price = 15000,
                Quantity = 2
            },
            new Minibar
            {
                Id = Guid.NewGuid(),
                HotelId = hotelId,
                RoomTypeId = roomType.Id,
                Name = "Snack khoai tây",
                ImageUrl = "https://orion.vn/media/u1ldttkf/orion-post-new-26.png",
                Price = 20000,
                Quantity = 1
            },
            new Minibar
            {
                Id = Guid.NewGuid(),
                HotelId = hotelId,
                RoomTypeId = roomType.Id,
                Name = "Bia Heineken",
                ImageUrl = "https://boozy.ph/cdn/shop/files/2024_-_2nd_Platforms_-_Product_Image_Template_11_grande.png?v=1727745062",
                Price = 25000,
                Quantity = 2
            },
            new Minibar
            {
                Id = Guid.NewGuid(),
                HotelId = hotelId,
                RoomTypeId = roomType.Id,
                Name = "Trà xanh Không Độ",
                ImageUrl = "https://www.thp.com.vn/wp-content/uploads/2017/01/slider-zero5.png",
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

        for (int j = 1; j <= 5; j++)
        {
            for (int i = 1; i <= 10; i++)
            {
                tables.Add(new Table
                {
                    Id = Guid.NewGuid(),
                    HotelId = hotelId,
                    Name = $"Bàn {(j - 1) * 10 + i}",              // Table name T1 → T20
                    Capacity = j,        // Capacity 2–5 seats (cycle)
                    IsActive = true,
                    TableStatus = 0              // 0 = Available
                });
            }
        }

        dbContext.Set<Table>().AddRange(tables);
        await dbContext.SaveChangesAsync();
    }

    public static async Task SeedHousekeepingTasksAsync(DbContext dbContext)
    {
        var hotelId = DEFAULT_HOTEL_ID;
        // If tasks already exist, skip
        if (await dbContext.Set<HousekeepingTask>().AnyAsync(t => t.HotelId == hotelId)) return;

        var anyRooms = await dbContext.Set<HotelRoom>().Where(r => r.HotelId == hotelId).Take(3).ToListAsync();
        if (!anyRooms.Any()) return;

        var tasks = new List<HousekeepingTask>();
        for (int i = 0; i < anyRooms.Count; i++)
        {
            var room = anyRooms[i];
            tasks.Add(new HousekeepingTask
            {
                Id = Guid.NewGuid(),
                HotelId = hotelId,
                RoomId = room.Id,
                Notes = i == 0 ? "Ưu tiên dọn trước 15:00" : (i == 1 ? "Lưu ý ga giường" : "Kiểm tra vòi nước"),
                CreatedAt = DateTime.Now
            });
        }
        dbContext.Set<HousekeepingTask>().AddRange(tasks);
        await dbContext.SaveChangesAsync();
    }

}
