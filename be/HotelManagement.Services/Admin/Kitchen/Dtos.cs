using HotelManagement.Domain.Entities;

namespace HotelManagement.Services.Admin.Kitchen;

public class GetFoodsByWeekRequest
{
    public DateTime StartDate { get; set; }
    public Guid HotelId { get; set; }
}

public class GetFoodsByWeekResponse
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public List<FoodsByDay> FoodsByDays { get; set; } = [];

}

public class FoodsByDayItem
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}
public class FoodsByDay
{
    public DateTime Date { get; set; }
    public Guid? ShoppingOrderId { get; set; }
    public List<FoodsByDayItem> FoodsByDayItems { get; set; } = [];

}

public class ShoppingListRequestDto
{
    public Guid? Id { get; set; }
    public DateTime OrderDate { get; set; }
    public Guid HotelId { get; set; }
    public string? Notes { get; set; }
    public List<ShoppingItemDto>? ShoppingItems { get; set; }
}

public class ShoppingDto
{
    public Guid Id { get; set; }
    public DateTime OrderDate { get; set; }
    public Guid HotelId { get; set; }
    public string? Notes { get; set; }
    public ShoppingOrderStatus ShoppingOrderStatus { get; set; }
    public List<ShoppingItemDto>? ShoppingItems { get; set; }
}

public class ShoppingItemDto
{
    public Guid? Id { get; set; }
    public Guid? ShoppingOrderId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Quantity { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;
    public QualityStatus? QualityStatus { set; get; }
}

public class UpdateShoppingOrderStatusRequest
{
    public ShoppingOrderStatus Status { get; set; }
}
