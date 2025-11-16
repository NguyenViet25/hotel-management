using HotelManagement.Domain;
using HotelManagement.Domain.Entities;
using HotelManagement.Repository.Common;
using HotelManagement.Services.Admin.Users;
using HotelManagement.Services.Common;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Services.Admin.Kitchen;

public class KitchenService : IKitchenService
{
    private readonly IRepository<MenuItem> _menuItemRepository;
    private readonly IRepository<ShoppingItem> _shoppingItemRepository;
    private readonly IRepository<ShoppingOrder> _shoppingOrderRepository;
    private readonly IRepository<Order> _orderRepository;
    private readonly IUsersAdminService _userService;

    public KitchenService(
        IRepository<MenuItem> menuItemRepository,
        IRepository<ShoppingItem> shoppingItemRepository,
        IRepository<ShoppingOrder> shoppingOrderRepository,
        IRepository<Order> orderRepository,
        IUsersAdminService userService)
    {
        _menuItemRepository = menuItemRepository;
        _shoppingItemRepository = shoppingItemRepository;
        _shoppingOrderRepository = shoppingOrderRepository;
        _orderRepository = orderRepository;
        _userService = userService;
    }

    public async Task<ApiResponse> GenerateShoppingListAsync(ShoppingListRequestDto request)
    {
        try
        {
            var newShoppingOrder = new ShoppingOrder()
            {
                Id = Guid.NewGuid(),
                CreatedAt = DateTime.Now,
                OrderDate = request.OrderDate,
                Notes = request.Notes,
                HotelId = request.HotelId,
            };
            await _shoppingOrderRepository.AddAsync(newShoppingOrder);
            await _shoppingOrderRepository.SaveChangesAsync();

            if (request.ShoppingItems?.Count > 0)
            {
                foreach (var item in request.ShoppingItems)
                {
                    var newShoppingItem = new ShoppingItem()
                    {
                        Id = Guid.NewGuid(),
                        ShoppingOrderId = newShoppingOrder.Id,
                        Name = item.Name,
                        Quantity = item.Quantity,
                        Unit = item.Unit,
                        QualityStatus = QualityStatus.NotRated,
                    };

                    await _shoppingItemRepository.AddAsync(newShoppingItem);
                    await _shoppingItemRepository.SaveChangesAsync();
                }
            }

            return ApiResponse.Ok();
        }
        catch (Exception ex)
        {
            return ApiResponse.Fail($"Failed to generate shopping list: {ex.Message}");
        }
    }

    public async Task<ApiResponse<GetFoodsByWeekResponse>> GetFoodByWeekRequestAsync(GetFoodsByWeekRequest request)
    {
        var (startDate, endDate) = GetWeekRange();
        var foodsByDays = new List<FoodsByDay>();

        for (DateTime date = startDate; date <= endDate; date = date.AddDays(1))
        {
            var foods = await _orderRepository.Query()
                .Where(o => o.CreatedAt == date)
                .SelectMany(o => o.Items)                   // flatten items
                .GroupBy(i => i.Id)                         // group by Id
                .Select(g => new FoodsByDayItem
                {
                    Id = g.Key,
                    Name = g.First().Name,
                    Quantity = g.Sum(x => x.Quantity),       // sum quantities
                    UnitPrice = g.First().UnitPrice
                })
                .ToListAsync();

            foodsByDays.Add(new FoodsByDay()
            {
                Date = date,
                FoodsByDayItems = foods,
            });
        }

        return ApiResponse<GetFoodsByWeekResponse>.Ok(new GetFoodsByWeekResponse()
        {
            StartDate = startDate,
            EndDate = endDate,
            FoodsByDays = foodsByDays
        });
    }

    public static (DateTime StartDate, DateTime EndDate) GetWeekRange()
    {
        DateTime today = DateTime.Now;
        int diff = today.DayOfWeek - DayOfWeek.Monday;
        if (diff < 0) diff += 7;

        DateTime startDate = today.AddDays(-diff).Date;
        DateTime endDate = startDate.AddDays(6).Date;

        return (startDate, endDate);
    }
}


public class UserDto
{
    public Guid Id { get; set; }
    public string? UserName { get; set; }
}