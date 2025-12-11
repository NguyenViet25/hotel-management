namespace HotelManagement.Domain;

public class Order
{
    public Guid Id { get; set; }
    public Guid HotelId { get; set; }
    public Guid? BookingId { get; set; }
    public Guid? DiningSessionId { get; set; }
    public string? CustomerName { get; set; }
    public string? CustomerPhone { get; set; }
    public bool IsWalkIn { get; set; }
    public OrderStatus Status { get; set; } = OrderStatus.InProgress;
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public DateTime? ServingDate { get; set; }
    public decimal? PromotionValue { get; set; }
    public string? PromotionCode { get; set; }
    public int Guests { get; set; }
    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
}

public class OrderItem
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public Guid MenuItemId { get; set; }
    public required string Name { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public OrderItemStatus Status { get; set; } = OrderItemStatus.Pending;
    public Guid? ProposedReplacementMenuItemId { get; set; }
    public bool? ReplacementConfirmedByGuest { get; set; }
}