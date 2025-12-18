using Microsoft.EntityFrameworkCore;
using HotelManagement.Repository;
using HotelManagement.Domain;
using HotelManagement.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;
using System.Globalization;
using System.Text;

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
            SeedBookingsAsync(dbContext).GetAwaiter().GetResult();
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
                        HotelId =legacyHotelId,
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
                    ImageUrl = "https://byvn.net/ajHK"
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
                    ImageUrl = "https://byvn.net/gO4v"
                },
                new RoomType
                {
                    Id = Guid.NewGuid(),
                    HotelId = tts1HotelId.Value,
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
                        HotelId = tts2HotelId.Value,
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
        var hotels = await dbContext.Set<Hotel>().ToListAsync();
        var rnd = new Random(1234);

        decimal RandBetween(decimal min, decimal max)
        {
            if (min >= max) return min;
            var step = 10000m;
            var steps = (int)((max - min) / step) + 1;
            var pick = rnd.Next(0, steps);
            return min + pick * step;
        }

        var defaults = new Dictionary<string, (decimal min, decimal max)>
        {
            { "NGAO", (60000m, 200000m) },
            { "HÀU", (180000m, 300000m) },
            { "SÒ LÔNG", (100000m, 200000m) },
            { "BỀ BỀ", (250000m, 500000m) },
            { "SAM", (250000m, 600000m) },
            { "MÓNG TAY", (200000m, 350000m) },
            { "TRAI", (150000m, 300000m) },
            { "TÔM HÙM", (800000m, 1200000m) },
            { "TÔM", (200000m, 500000m) },
            { "CUA GẠCH - CUA THỊT", (300000m, 800000m) },
            { "RẮN BIỂN", (300000m, 800000m) },
            { "NEM", (200000m, 250000m) },
            { "SÚP KHAI VỊ", (200000m, 300000m) },
            { "GÀ", (200000m, 300000m) },
            { "THỊT LỢN", (180000m, 200000m) },
            { "THỊT BÒ", (250000m, 250000m) },
            { "LƯƠN", (200000m, 250000m) },
            { "CÁ GIÒ", (200000m, 600000m) },
            { "RAU", (40000m, 70000m) },
            { "CANH - CƠM", (60000m, 200000m) },
            { "GHẸ", (300000m, 700000m) },
            { "CÁ THU", (150000m, 200000m) },
            { "CÁ NỤC", (160000m, 200000m) },
            { "MỰC TƯƠI", (300000m, 350000m) },
            { "ỐC HƯƠNG", (300000m, 800000m) },
            { "TU HÀI", (300000m, 800000m) },
            { "SỨA", (150000m, 150000m) },
            { "CÁ MÚ", (200000m, 600000m) },
            { "CÁ SỦ", (150000m, 400000m) },
        };

        var data = new List<(string cat, string name, decimal? min, decimal? max, string desc)>
        {
            ("NGAO", "Ngao hấp sả", 180000m, 180000m, ""),
            ("NGAO", "Canh ngao chua", 60000m, 60000m, ""),
            ("NGAO", "Ngao xào măng", 150000m, 150000m, ""),
            ("NGAO", "Ngao xào dưa chua", 150000m, 150000m, ""),
            ("NGAO", "Ngao hấp mùng tơi", 100000m, 100000m, ""),
            ("NGAO", "Canh ngao mùng tơi", 50000m, 50000m, ""),

            ("HÀU", "Hàu gỏi", 250000m, 250000m, ""),
            ("HÀU", "Hàu nướng mỡ hành", 200000m, 200000m, ""),
            ("HÀU", "Hàu hấp", null, null, ""),

            ("SÒ LÔNG", "Sò hấp sả", 100000m, 100000m, ""),
            ("SÒ LÔNG", "Sò nướng mỡ hành", 150000m, 150000m, ""),
            ("SÒ LÔNG", "Sò xào giá", 150000m, 150000m, ""),
            ("SÒ LÔNG", "Sò xào măng", 150000m, 150000m, ""),
            ("SÒ LÔNG", "Sò xào dưa chua", 150000m, 150000m, ""),
            ("SÒ LÔNG", "Sò xào thập cẩm", 150000m, 150000m, ""),

            ("BỀ BỀ", "Bề bề sốt me", null, null, ""),
            ("BỀ BỀ", "Bề bề rang muối", null, null, ""),
            ("BỀ BỀ", "Bề bề hấp sả ngũ vị", null, null, ""),

            ("SAM", "Sam giả cầy", null, null, ""),
            ("SAM", "Sam chua ngọt", null, null, ""),
            ("SAM", "Tiết sam nấu lá chua", null, null, ""),
            ("SAM", "Sam xào sả ớt", null, null, ""),

            ("MÓNG TAY", "Móng tay nướng", null, null, ""),
            ("MÓNG TAY", "Móng tay hấp xào chua ngọt", null, null, ""),
            ("MÓNG TAY", "Móng tay xào dưa chua", null, null, ""),

            ("TRAI", "Trai nướng", null, null, ""),
            ("TRAI", "Trai hấp", null, null, ""),
            ("TRAI", "Trai xào giá", null, null, ""),

            ("TÔM HÙM", "Tôm hùm hấp bia/sả", null, null, ""),
            ("TÔM HÙM", "Tôm hùm nướng", null, null, ""),

            ("TÔM", "Tôm nướng", 250000m, 300000m, ""),
            ("TÔM", "Tôm hấp", 250000m, 300000m, ""),
            ("TÔM", "Tôm chiên xù", 300000m, 300000m, ""),
            ("TÔM", "Tôm chiên giòn", 250000m, 300000m, ""),
            ("TÔM", "Tôm chao dầu", 250000m, 300000m, ""),
            ("TÔM", "Tôm xào chua ngọt", null, null, ""),
            ("TÔM", "Gỏi tôm", 400000m, 500000m, ""),
            ("TÔM", "Tôm tráng trứng", 150000m, 150000m, ""),

            ("CUA GẠCH - CUA THỊT", "Cua hấp", null, null, ""),
            ("CUA GẠCH - CUA THỊT", "Cua nướng", null, null, ""),
            ("CUA GẠCH - CUA THỊT", "Cua rang me", null, null, ""),
            ("CUA GẠCH - CUA THỊT", "Cua rang muối", null, null, ""),
            ("CUA GẠCH - CUA THỊT", "Cua nhồi thịt hấp", null, null, ""),
            ("CUA GẠCH - CUA THỊT", "Cua sốt chua ngọt", null, null, ""),
            ("CUA GẠCH - CUA THỊT", "Cua xào miến", null, null, ""),
            ("CUA GẠCH - CUA THỊT", "Nem cua", null, null, ""),

            ("RẮN BIỂN", "Rắn biển xào lăn", null, null, ""),
            ("RẮN BIỂN", "Chả rắn", null, null, ""),
            ("RẮN BIỂN", "Rắn biển tẩm bột chiên", null, null, ""),
            ("RẮN BIỂN", "Rắn biển hấp", null, null, ""),
            ("RẮN BIỂN", "Rắn biển rang sả", null, null, ""),
            ("RẮN BIỂN", "Rắn biển nướng ngũ vị", null, null, ""),
            ("RẮN BIỂN", "Cháo rắn", null, null, ""),
            ("RẮN BIỂN", "Rượu tiết rắn", null, null, ""),

            ("NEM", "Nem chua", 40000m, 40000m, ""),
            ("NEM", "Nem hải sản", 200000m, 250000m, ""),
            ("NEM", "Nem thập cẩm", 200000m, 250000m, ""),

            ("SÚP KHAI VỊ", "Súp hải sản", 200000m, 200000m, ""),
            ("SÚP KHAI VỊ", "Súp thập cẩm", 200000m, 200000m, ""),
            ("SÚP KHAI VỊ", "Súp cua ngô non", 300000m, 300000m, ""),

            ("GÀ", "Gà luộc", 250000m, 250000m, ""),
            ("GÀ", "Gà rang sả ớt", 200000m, 250000m, ""),
            ("GÀ", "Gà rang gừng", 200000m, 250000m, ""),
            ("GÀ", "Gà xào chua ngọt", 200000m, 250000m, ""),
            ("GÀ", "Gà rang muối", 200000m, 250000m, ""),
            ("GÀ", "Nộm gà", 200000m, 200000m, ""),

            ("THỊT LỢN", "Thịt ba chỉ rang", 180000m, 180000m, ""),
            ("THỊT LỢN", "Thịt lợn quay", 200000m, 200000m, ""),
            ("THỊT LỢN", "Thịt kho tàu", 200000m, 200000m, ""),
            ("THỊT LỢN", "Sườn xào chua ngọt", 200000m, 200000m, ""),
            ("THỊT LỢN", "Thịt xay rang mắm", 180000m, 180000m, ""),
            ("THỊT LỢN", "Chân giò luộc", 200000m, 200000m, ""),

            ("THỊT BÒ", "Bò xào thập cẩm", 250000m, 250000m, ""),
            ("THỊT BÒ", "Bò xào sả ớt", 250000m, 250000m, ""),
            ("THỊT BÒ", "Bò xào cần tây", 250000m, 250000m, ""),
            ("THỊT BÒ", "Bò nhúng", 250000m, 250000m, ""),

            ("LƯƠN", "Lươn xào sả ớt", 250000m, 250000m, ""),
            ("LƯƠN", "Lươn nướng lá chanh", 200000m, 200000m, ""),
            ("LƯƠN", "Lươn om mẻ", 200000m, 200000m, ""),
            ("LƯƠN", "Lươn om chuối đậu", 250000m, 250000m, ""),

            ("CUA THỊT + CUA GẠCH", "Cua hấp bia", null, null, ""),
            ("CUA THỊT + CUA GẠCH", "Cua rang me", null, null, ""),
            ("CUA THỊT + CUA GẠCH", "Cua rang muối", null, null, ""),
            ("CUA THỊT + CUA GẠCH", "Cua nấu rau muống", null, null, ""),

            ("CÁ GIÒ", "Cá giò om dưa", 500000m, 500000m, ""),
            ("CÁ GIÒ", "Cá giò hấp xì dầu", 500000m, 500000m, ""),
            ("CÁ GIÒ", "Cá giò chiên xù", 500000m, 500000m, ""),
            ("CÁ GIÒ", "Canh chua cá giò", 200000m, 200000m, ""),
            ("CÁ GIÒ", "Cá giò nướng chao", 500000m, 500000m, ""),
            ("CÁ GIÒ", "Cháo cá giò", 200000m, 200000m, ""),
            ("CÁ GIÒ", "Gỏi cá giò", 600000m, 600000m, ""),

            ("RAU", "Rau muống luộc", 40000m, 40000m, ""),
            ("RAU", "Rau muống xào", 40000m, 40000m, ""),
            ("RAU", "Rau khoai lang xào tỏi", 40000m, 40000m, ""),
            ("RAU", "Rau cải xào tỏi", 40000m, 40000m, ""),
            ("RAU", "Rau cải xào tôm", 70000m, 70000m, ""),
            ("RAU", "Rau bí xào tỏi", 50000m, 50000m, ""),
            ("RAU", "Su su + cà rốt luộc", 40000m, 40000m, ""),
            ("RAU", "Su su + cà rốt xào", 40000m, 40000m, ""),

            ("CANH - CƠM", "Canh cá chua", 200000m, 200000m, ""),
            ("CANH - CƠM", "Canh ngao chua", 60000m, 60000m, ""),
            ("CANH - CƠM", "Canh ngao mùng tơi", 60000m, 60000m, ""),
            ("CANH - CƠM", "Canh cải thịt nạc", 60000m, 60000m, ""),
            ("CANH - CƠM", "Canh cải tôm", null, null, ""),
            ("CANH - CƠM", "Rau ngót thịt", 60000m, 60000m, ""),
            ("CANH - CƠM", "Canh cua đồng, cà", 60000m, 60000m, ""),
            ("CANH - CƠM", "Cơm trắng", null, null, ""),

            ("GHẸ", "Ghẹ hấp", null, null, ""),
            ("GHẸ", "Ghẹ rang me", null, null, ""),
            ("GHẸ", "Ghẹ rang muối", null, null, ""),
            ("GHẸ", "Ghẹ nấu rau muống", null, null, ""),
            ("GHẸ", "Nem ghẹ", null, null, ""),

            ("CÁ THU", "Cá thu rán giòn", 200000m, 200000m, ""),
            ("CÁ THU", "Cá thu sốt cà chua", 200000m, 200000m, ""),
            ("CÁ THU", "Cá thu nướng", 200000m, 200000m, ""),
            ("CÁ THU", "Chả cá thu", 200000m, 200000m, ""),
            ("CÁ THU", "Cá thu kho gừng", 200000m, 200000m, ""),
            ("CÁ THU", "Canh chua cá thu", 150000m, 150000m, ""),

            ("CÁ NỤC", "Cá nục rán giòn", 160000m, 160000m, ""),
            ("CÁ NỤC", "Cá nục kho", 180000m, 180000m, ""),
            ("CÁ NỤC", "Cá nục sốt cà chua", 180000m, 180000m, ""),
            ("CÁ NỤC", "Cá nục nướng", 200000m, 200000m, ""),

            ("MỰC TƯƠI", "Mực xào thập cẩm", 300000m, 300000m, ""),
            ("MỰC TƯƠI", "Mực hấp", 300000m, 300000m, ""),
            ("MỰC TƯƠI", "Mực chiên xù", 350000m, 350000m, ""),
            ("MỰC TƯƠI", "Mực chiên giòn", 350000m, 350000m, ""),
            ("MỰC TƯƠI", "Mực trứng nướng", 350000m, 350000m, ""),
            ("MỰC TƯƠI", "Mực trứng chao dầu", 350000m, 350000m, ""),
            ("MỰC TƯƠI", "Mực xào dưa chua", 250000m, 350000m, ""),
            ("MỰC TƯƠI", "Mực nhồi thịt hấp", 350000m, 350000m, ""),
            ("MỰC TƯƠI", "Chả mực", 300000m, 350000m, ""),

            ("ỐC HƯƠNG", "Ốc hương hấp gừng sả", null, null, ""),
            ("ỐC HƯƠNG", "Ốc hương hấp lá chanh", null, null, ""),
            ("ỐC HƯƠNG", "Ốc hương nướng tiêu bắc", null, null, ""),

            ("TU HÀI", "Tu hài nướng mỡ hành", null, null, ""),
            ("TU HÀI", "Tu hài hấp", null, null, ""),
            ("TU HÀI", "Tu hài xào thập cẩm", null, null, ""),

            ("MÓNG TAY", "Móng tay nướng (giá)", 250000m, 300000m, ""),
            ("MÓNG TAY", "Móng tay hấp (giá)", 250000m, 250000m, ""),
            ("MÓNG TAY", "Móng tay sốt me (giá)", 250000m, 300000m, ""),

            ("SỨA", "Nộm sứa", 150000m, 150000m, ""),

            ("CÁ MÚ", "Cá mú hấp xì dầu", 600000m, 600000m, ""),
            ("CÁ MÚ", "Cá mú hấp dưa", 600000m, 600000m, ""),
            ("CÁ MÚ", "Cá mú hấp ngũ vị", 600000m, 600000m, ""),
            ("CÁ MÚ", "Gỏi cá mú", 600000m, 600000m, ""),
            ("CÁ MÚ", "Cá mú nướng giấy bạc", 600000m, 600000m, ""),
            ("CÁ MÚ", "Canh chua cá mú", 200000m, 200000m, ""),
            ("CÁ MÚ", "Cháo cá mú", null, null, ""),

            ("CÁ SỦ", "Cá sủ om dưa", 300000m, 350000m, ""),
            ("CÁ SỦ", "Cá sủ hấp xì dầu", 300000m, 350000m, ""),
            ("CÁ SỦ", "Cá sủ chiên xù", 300000m, 300000m, ""),
            ("CÁ SỦ", "Canh chua cá sủ", 150000m, 150000m, ""),
            ("CÁ SỦ", "Gỏi cá sủ", 400000m, 400000m, ""),
        };

        foreach (var h in hotels)
        {
            var exists = await dbContext.Set<MenuItem>().AnyAsync(mi => mi.HotelId == h.Id && mi.Category != "Set");
            if (exists) continue;

            var items = new List<MenuItem>();
            foreach (var d in data)
            {
                var range = defaults.TryGetValue(d.cat, out var def) ? def : (100000m, 300000m);
                var price = d.min.HasValue && d.max.HasValue
                    ? (d.min.Value == d.max.Value ? d.min.Value : RandBetween(d.min.Value, d.max.Value))
                    : RandBetween(range.Item1, range.Item2);
                items.Add(new MenuItem
                {
                    Id = Guid.NewGuid(),
                    HotelId = h.Id,
                    Category = d.cat,
                    Name = d.name,
                    Description = d.desc,
                    UnitPrice = price,
                    ImageUrl = string.Empty,
                    Status = 0,
                    IsActive = true
                });
            }

            dbContext.Set<MenuItem>().AddRange(items);
            await dbContext.SaveChangesAsync();
        }
    }

    public static async Task SeedMenuSetsAsync(DbContext dbContext)
    {
        var hotels = await dbContext.Set<Hotel>().ToListAsync();

        var s200_1 = string.Join("\n", new[] { "Tôm chao dầu", "Mực xào cần tỏi", "Cá biển sốt cà chua", "Hàu nướng mỡ hành", "Ngô chiên", "Rau theo mùa", "Canh theo ngày", "Cơm trắng", "Cà pháo" });
        var s200_2 = string.Join("\n", new[] { "Tôm nướng mọi", "Mực nhảy hấp", "Cá rim tiêu", "Sò xào măng", "Khoai chiên", "Rau theo mùa", "Canh theo ngày", "Cơm trắng", "Cà pháo" });
        var s200_3 = string.Join("\n", new[] { "Tôm rang muối", "Mực chiên bơ", "Gà rang gừng", "Móng tay xào răm", "Trứng rán", "Rau theo mùa", "Canh theo ngày", "Cơm trắng", "Cà pháo" });
        var s200_4 = string.Join("\n", new[] { "Móng tay rang me", "Mực chiên lá lốt", "Nộm sứa", "Ngao nướng mỡ hành", "Thịt chưng mắm tép", "Rau theo mùa", "Canh theo ngày", "Cơm trắng", "Cà pháo" });

        var s250_1 = string.Join("\n", new[] { "Ngô chiên bơ", "Mực ống xào thập cẩm", "Tôm rang muối", "Hàu nướng mỡ hành", "Cá thu sốt", "Sò xào măng", "Rau muống xào tỏi", "Canh ngao", "Cơm trắng, Cà pháo", "Tráng miệng" });
        var s250_2 = string.Join("\n", new[] { "Khoai lang chiên", "Gà hấp lá chanh", "Cá nướng giấy bạc", "Tôm hấp sả", "Lươn xào rua ngố", "Thịt chưng mắm tép", "Bắp cải luộc chấm trứng", "Canh ngao chua", "Cơm trắng, Cà pháo", "Tráng miệng" });
        var s250_3 = string.Join("\n", new[] { "Khoai lang kén", "Mực nhảy", "Tôm chiên giòn", "Móng tay sốt me", "Cá chim rim tiêu", "Trứng đúc thịt", "Rau cải canh xào", "Canh cua đồng", "Cơm trắng, Cà pháo", "Tráng miệng" });
        var s250_4 = string.Join("\n", new[] { "Ngô chiên bơ", "Bề bề chiên chanh", "Nem hải sản", "Mực nhảy hấp lá lốt", "Cá biển kho tộ", "Vịt rang sả", "Rau muống luộc", "Canh cà chua dọc mùng", "Cơm trắng, Cà pháo", "Tráng miệng" });

        var s300_1 = string.Join("\n", new[] { "Mực hấp lá ổi", "Tôm nướng mọi", "Hàu nướng mỡ hành", "Cá song hấp xì dầu", "Bề bề rang muối", "Lặc lày luộc chấm muối vừng", "Canh ngao chua", "Cơm trắng + cà pháo", "Tráng miệng" });
        var s300_2 = string.Join("\n", new[] { "Ghẹ hấp", "Tôm chao dầu", "Mực chiên bơ", "Sò nướng mỡ hành", "Cá thu sốt cà chua", "Thịt ba chỉ rang cháy cạnh", "Rau muống xào tỏi", "Canh cua + cà", "Cơm tám", "Tráng miệng" });
        var s300_3 = string.Join("\n", new[] { "Tôm chiên giòn", "Mực trứng hấp", "Bề bề rang me", "Cá nục kho tộ", "Sò lông nướng mỡ hành", "Gà luộc lá chanh", "Ngọn su su xào tỏi", "Canh chua thịt nạc", "Cơm tám + cà pháo", "Tráng miệng" });
        var s300_4 = string.Join("\n", new[] { "Nộm sứa", "Mực tươi xào cần tỏi", "Tôm hấp sả", "Hàu gỏi chanh", "Cá biển rán giòn", "Thịt chân giò luộc", "Rau cải luộc", "Canh ngao chua", "Cơm tám + cà pháo", "Tráng miệng" });

        var s350_1 = string.Join("\n", new[] { "Ghẹ hấp", "Mực chiên bơ", "Cá sủ hấp xì dầu", "Tôm hấp bia", "Sò nướng mỡ hành", "Canh cua đồng", "Rau theo mùa", "Cơm trắng", "Cà pháo", "Tráng miệng" });
        var s350_2 = string.Join("\n", new[] { "Bề bề hấp", "Mực xào cần tỏi", "Cá bọc bạc nướng", "Gà rang gừng", "Hàu nướng mỡ hành", "Nộm sứa", "Canh cua đồng", "Rau theo mùa", "Cơm trắng, Cà pháo", "Tráng miệng" });
        var s350_3 = string.Join("\n", new[] { "Ốc hương hấp", "Mực trứng hấp", "Cá biển chiên giòn", "Tôm chao dầu", "Ngao to nướng mỡ hành", "Canh cá chua", "Rau theo mùa", "Cơm tám", "Cà pháo", "Tráng miệng" });
        var s350_4 = string.Join("\n", new[] { "Bề bề rang muối", "Mực trứng nướng", "Tôm chiên giòn", "Cá nướng mọi", "Sò xào măng", "Thịt ba chỉ rang", "Rau theo mùa", "Canh thịt chua", "Cơm trắng, Cà pháo", "Tráng miệng" });

        var s480_1 = string.Join("\n", new[] { "Súp hải sản", "Cua gạch hấp", "Tôm nướng mọi", "Móng tay sốt me", "Mực ống chiên", "Hàu nướng mỡ hành", "Canh ngao chua", "Gà rang gừng", "Rau xào", "Cơm tám + cà pháo", "Hoa quả tráng miệng" });
        var s480_2 = string.Join("\n", new[] { "Nộm hải sản", "Ghẹ hấp", "Tôm nướng", "Mực trứng hấp", "Bề bề rang muối", "Sò nướng mỡ hành", "Cá thu sốt cà chua", "Canh cua mùng tơi", "Rau xào", "Cơm tám + cà pháo", "Hoa quả tráng miệng" });

        var allNew = new List<MenuItem>();
        foreach (var h in hotels)
        {
            var exists = await dbContext.Set<MenuItem>().AnyAsync(mi => mi.HotelId == h.Id && mi.Category == "Set");
            if (exists) continue;

            allNew.AddRange(new[]
            {
                new MenuItem { Id = Guid.NewGuid(), HotelId = h.Id, Category = "Set", Name = "Suất 200.000đ/người - Set 1", Description = s200_1, UnitPrice = 200000, ImageUrl = "", Status = 0, IsActive = true },
                new MenuItem { Id = Guid.NewGuid(), HotelId = h.Id, Category = "Set", Name = "Suất 200.000đ/người - Set 2", Description = s200_2, UnitPrice = 200000, ImageUrl = "", Status = 0, IsActive = true },
                new MenuItem { Id = Guid.NewGuid(), HotelId = h.Id, Category = "Set", Name = "Suất 200.000đ/người - Set 3", Description = s200_3, UnitPrice = 200000, ImageUrl = "", Status = 0, IsActive = true },
                new MenuItem { Id = Guid.NewGuid(), HotelId = h.Id, Category = "Set", Name = "Suất 200.000đ/người - Set 4", Description = s200_4, UnitPrice = 200000, ImageUrl = "", Status = 0, IsActive = true },

                new MenuItem { Id = Guid.NewGuid(), HotelId = h.Id, Category = "Set", Name = "Suất 250.000đ/người - Set 1", Description = s250_1, UnitPrice = 250000, ImageUrl = "", Status = 0, IsActive = true },
                new MenuItem { Id = Guid.NewGuid(), HotelId = h.Id, Category = "Set", Name = "Suất 250.000đ/người - Set 2", Description = s250_2, UnitPrice = 250000, ImageUrl = "", Status = 0, IsActive = true },
                new MenuItem { Id = Guid.NewGuid(), HotelId = h.Id, Category = "Set", Name = "Suất 250.000đ/người - Set 3", Description = s250_3, UnitPrice = 250000, ImageUrl = "", Status = 0, IsActive = true },
                new MenuItem { Id = Guid.NewGuid(), HotelId = h.Id, Category = "Set", Name = "Suất 250.000đ/người - Set 4", Description = s250_4, UnitPrice = 250000, ImageUrl = "", Status = 0, IsActive = true },

                new MenuItem { Id = Guid.NewGuid(), HotelId = h.Id, Category = "Set", Name = "Suất 300.000đ/người - Set 1", Description = s300_1, UnitPrice = 300000, ImageUrl = "", Status = 0, IsActive = true },
                new MenuItem { Id = Guid.NewGuid(), HotelId = h.Id, Category = "Set", Name = "Suất 300.000đ/người - Set 2", Description = s300_2, UnitPrice = 300000, ImageUrl = "", Status = 0, IsActive = true },
                new MenuItem { Id = Guid.NewGuid(), HotelId = h.Id, Category = "Set", Name = "Suất 300.000đ/người - Set 3", Description = s300_3, UnitPrice = 300000, ImageUrl = "", Status = 0, IsActive = true },
                new MenuItem { Id = Guid.NewGuid(), HotelId = h.Id, Category = "Set", Name = "Suất 300.000đ/người - Set 4", Description = s300_4, UnitPrice = 300000, ImageUrl = "", Status = 0, IsActive = true },

                new MenuItem { Id = Guid.NewGuid(), HotelId = h.Id, Category = "Set", Name = "Suất 350.000đ/người - Set 1", Description = s350_1, UnitPrice = 350000, ImageUrl = "", Status = 0, IsActive = true },
                new MenuItem { Id = Guid.NewGuid(), HotelId = h.Id, Category = "Set", Name = "Suất 350.000đ/người - Set 2", Description = s350_2, UnitPrice = 350000, ImageUrl = "", Status = 0, IsActive = true },
                new MenuItem { Id = Guid.NewGuid(), HotelId = h.Id, Category = "Set", Name = "Suất 350.000đ/người - Set 3", Description = s350_3, UnitPrice = 350000, ImageUrl = "", Status = 0, IsActive = true },
                new MenuItem { Id = Guid.NewGuid(), HotelId = h.Id, Category = "Set", Name = "Suất 350.000đ/người - Set 4", Description = s350_4, UnitPrice = 350000, ImageUrl = "", Status = 0, IsActive = true },

                new MenuItem { Id = Guid.NewGuid(), HotelId = h.Id, Category = "Set", Name = "Suất 480.000đ/người - Set 1", Description = s480_1, UnitPrice = 480000, ImageUrl = "", Status = 0, IsActive = true },
                new MenuItem { Id = Guid.NewGuid(), HotelId = h.Id, Category = "Set", Name = "Suất 480.000đ/người - Set 2", Description = s480_2, UnitPrice = 480000, ImageUrl = "", Status = 0, IsActive = true },
            });
        }

        if (allNew.Any())
        {
            dbContext.Set<MenuItem>().AddRange(allNew);
            await dbContext.SaveChangesAsync();
        }
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

        // Custom staff accounts for TTSLEGACY
        var legacyStaffSeeds = new[]
        {
            new { Email = "vinhphm2002@gmail.com", Username = "vinhphm2002", Role = UserRole.Manager, Fullname = "Phạm Hoàng Vinh", Phone = "" },
            new { Email = "vinhk8464@gmail.com", Username = "vinhk8464", Role = UserRole.FrontDesk, Fullname = "Phạm Khánh Vinh", Phone = "" },
            new { Email = "thinhtvhe170782@fpt.edu.vn", Username = "thinhtvhe170782", Role = UserRole.Kitchen, Fullname = "Nguyễn Quốc Thịnh", Phone = "" },
            new { Email = "thinhkesat@gmail.com", Username = "thinhkesat", Role = UserRole.Waiter, Fullname = "Hoàng Văn Thịnh", Phone = "" },
            new { Email = "nguyenthanhlam1070@gmail.com", Username = "nguyenthanhlam", Role = UserRole.Housekeeper, Fullname = "Nguyen Thanh Lam", Phone = "" }
        };

        foreach (var s in legacyStaffSeeds)
        {
            var foundByEmail = await userManager.FindByEmailAsync(s.Email);
            var foundByName = await userManager.FindByNameAsync(s.Username);
            if (foundByEmail != null || foundByName != null) continue;

            var u = new AppUser
            {
                UserName = s.Username,
                Email = s.Email,
                EmailConfirmed = true,
                Fullname = s.Fullname,
                PhoneNumber = s.Phone,
                LockoutEnd = DateTime.Now.AddMonths(-1),
            };

            var created = await userManager.CreateAsync(u, "Password1@");
            if (created.Succeeded)
            {
                await userManager.AddToRoleAsync(u, s.Role.ToString());
                dbContext.Set<UserPropertyRole>().Add(new UserPropertyRole
                {
                    Id = Guid.NewGuid(),
                    HotelId = DEFAULT_HOTEL_ID,
                    UserId = u.Id,
                    Role = s.Role
                });
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

        string Slugify(string s)
        {
            var n = s.Normalize(NormalizationForm.FormD);
            var sb = new StringBuilder();
            foreach (var ch in n)
            {
                var cat = CharUnicodeInfo.GetUnicodeCategory(ch);
                if (cat == UnicodeCategory.NonSpacingMark) continue;
                var c = char.ToLower(ch);
                if (char.IsLetterOrDigit(c)) sb.Append(c);
                else if (char.IsWhiteSpace(c) || c == '-' || c == '_') sb.Append('-');
            }
            var slug = sb.ToString().Trim('-');
            while (slug.Contains("--")) slug = slug.Replace("--", "-");
            return slug;
        }

        foreach (var hotel in hotels)
        {
            foreach (var (role, people) in roleSeeds)
            {
                foreach (var person in people)
                {
                    var baseUser = Slugify(person.name);
                    var username = $"{baseUser}-{hotel.Code.ToLower()}";
                    var email = $"{username}@hotel.com";

                    var existingByName = await userManager.FindByNameAsync(username);
                    var existingByEmail = await userManager.FindByEmailAsync(email);
                    if (existingByName != null || existingByEmail != null) continue;

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

    public static async Task SeedBookingsAsync(DbContext dbContext)
    {
        var hotelId = DEFAULT_HOTEL_ID;

        var already = await dbContext.Set<Booking>().AnyAsync(b => b.HotelId == hotelId);
        if (already) return;

        var roomTypes = await dbContext.Set<RoomType>().Where(rt => rt.HotelId == hotelId).OrderBy(rt => rt.Capacity).ToListAsync();
        var rooms = await dbContext.Set<HotelRoom>().Where(r => r.HotelId == hotelId).ToListAsync();

        var seeds = new[]
        {
            (name: "Nguyễn Trung Hưng", phone: "0366225777", guests: 16, roomsCount: 4, url: "https://drive.google.com/file/d/1NJoI3LyWmx-KMB02q8FjJ6XzpKX7mtsm/view?usp=sharing"),
            (name: "Nguyễn Văn Thành", phone: "0983440891", guests: 4, roomsCount: 1, url: "https://drive.google.com/file/d/1Xh1Fju79Si5divfvIVOt03TIK_xafWdA/view?usp=sharing"),
            (name: "Ngô Tiến Mạnh", phone: "0965291988", guests: 8, roomsCount: 2, url: "https://drive.google.com/file/d/1d4pfs50iQsDG9q7GIuui0dDqsRu4PKPn/view?usp=sharing"),
            (name: "Đặng Thị Hương", phone: "0975297928", guests: 7, roomsCount: 2, url: "https://drive.google.com/file/d/1loTp4Xo1JULqmUvhr_wJr_RHDnM3driE/view?usp=sharing"),
            (name: "Nguyễn Thị Vân Anh", phone: "0399131811", guests: 12, roomsCount: 3, url: "https://drive.google.com/file/d/1kuVu1mEXInrtpF-MiQ-806YuQyiUo0cc/view?usp=sharing"),
            (name: "Phạm Thị Minh", phone: "0356208925", guests: 4, roomsCount: 1, url: "https://drive.google.com/file/d/1G-zp7dRk2aNp4WMqP3qhVOg36HXd3dF3/view?usp=sharing"),
            (name: "Đặng Thành Trung", phone: "0985546541", guests: 24, roomsCount: 6, url: "https://drive.google.com/file/d/165xMdOy8O7kFQw11QWF0JmHykPp4n7HQ/view?usp=sharing"),
            (name: "Vũ Thanh Huyền", phone: "0974099087", guests: 78, roomsCount: 20, url: "https://drive.google.com/file/d/1RBmOd1FSl0ouLK2txTsqMQHKMn5EVaM1/view?usp=sharing"),
            (name: "Đỗ Thanh Huyền", phone: "0364977608", guests: 12, roomsCount: 3, url: "https://drive.google.com/file/d/10OtJcCBqjzCnz4eY7xCch07J4UpyMfZm/view?usp=sharing"),
            (name: "Đỗ Thị Thanh Thủy", phone: "0369105238", guests: 4, roomsCount: 1, url: "https://drive.google.com/file/d/1uxTz_B7VQr1LOlmwD2etQEfdhqS_eFGZ/view?usp=sharing"),
            (name: "Đỗ Thị Cương", phone: "0989200919", guests: 22, roomsCount: 6, url: "https://drive.google.com/file/d/1rNyFd5EFqsgingghDMnQBfQcBJKlVra0/view?usp=sharing"),
            (name: "Phạm Thị Trà My", phone: "0973100791", guests: 18, roomsCount: 5, url: "https://drive.google.com/file/d/1Dd_4275d3vragbzeB0fAQGs4UI6u5dXP/view?usp=sharing"),
            (name: "Đỗ Văn Dũng", phone: "0964056989", guests: 32, roomsCount: 8, url: "https://drive.google.com/file/d/1WXrqh1Y1SygE_ZkWJnPs_18uCsgnEd0I/view?usp=sharing"),
            (name: "Phạm Thanh Mai", phone: "0327652433", guests: 14, roomsCount: 4, url: "https://drive.google.com/file/d/1e3X73q1Tqx4mloN99Unc9hZoBTADPWk3/view?usp=sharing")
        };

        DateTime start = DateTime.Today.AddDays(1);
        DateTime end = start.AddDays(1);

        foreach (var s in seeds)
        {
            var exists = await dbContext.Set<Guest>().AnyAsync(g => g.Phone == s.phone);
            if (exists) continue;

            var g = new Guest
            {
                Id = Guid.NewGuid(),
                FullName = s.name,
                Phone = s.phone,
                IdCard = string.Empty,
                IdCardFrontImageUrl = s.url,
                IdCardBackImageUrl = null,
                Email = null
            };
            dbContext.Set<Guest>().Add(g);
            await dbContext.SaveChangesAsync();

            var perRoom = (int)Math.Ceiling((double)s.guests / Math.Max(s.roomsCount, 1));
            var rt = roomTypes.FirstOrDefault(x => x.Capacity >= perRoom) ?? roomTypes.OrderByDescending(x => x.Capacity).First();
            var price = rt.BasePriceFrom;

            var b = new Booking
            {
                Id = Guid.NewGuid(),
                HotelId = hotelId,
                PrimaryGuestId = g.Id,
                Status = BookingStatus.Pending,
                DepositAmount = 0,
                DiscountAmount = 0,
                TotalAmount = 0,
                LeftAmount = 0,
                AdditionalAmount = 0,
                PromotionCode = null,
                PromotionValue = 0,
                CreatedAt = DateTime.Now,
                Notes = "Seeded"
            };
            dbContext.Set<Booking>().Add(b);
            await dbContext.SaveChangesAsync();

            var brt = new BookingRoomType
            {
                BookingRoomTypeId = Guid.NewGuid(),
                BookingId = b.Id,
                RoomTypeId = rt.Id,
                RoomTypeName = rt.Name,
                Capacity = rt.Capacity,
                Price = price,
                TotalRoom = s.roomsCount,
                StartDate = start,
                EndDate = end
            };
            dbContext.Set<BookingRoomType>().Add(brt);
            await dbContext.SaveChangesAsync();

            var availableRoomIds = rooms.Where(r => r.RoomTypeId == rt.Id).Select(r => r.Id).Take(s.roomsCount).ToList();
            foreach (var rid in availableRoomIds)
            {
                var r = rooms.First(x => x.Id == rid);
                var br = new BookingRoom
                {
                    BookingRoomId = Guid.NewGuid(),
                    BookingRoomTypeId = brt.BookingRoomTypeId,
                    RoomId = r.Id,
                    RoomName = r.Number,
                    StartDate = start,
                    EndDate = end,
                    BookingStatus = BookingRoomStatus.Pending
                };
                dbContext.Set<BookingRoom>().Add(br);
                await dbContext.SaveChangesAsync();

                dbContext.Set<BookingGuest>().Add(new BookingGuest
                {
                    BookingGuestId = Guid.NewGuid(),
                    BookingRoomId = br.BookingRoomId,
                    GuestId = g.Id
                });
                await dbContext.SaveChangesAsync();
            }

            var nights = (end.Date - start.Date).Days;
            var amount = price * nights * Math.Max(availableRoomIds.Count, 1);
            b.TotalAmount = amount;
            b.LeftAmount = amount;
            dbContext.Set<Booking>().Update(b);
            await dbContext.SaveChangesAsync();
        }
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
