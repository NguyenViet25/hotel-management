namespace HotelManagement.Domain.Entities;

public class ShoppingOrder
{
    public Guid Id { get; set; }
    public Guid HotelId { get; set; }
    public DateTime OrderDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public ShoppingOrderStatus ShoppingOrderStatus { get; set; }
    public string? Notes { get; set; }
    public ICollection<ShoppingItem> Items { get; set; } = [];
}

public enum ShoppingOrderStatus
{
    Draft = 0,
    Confirmed = 1,
    Cancelled = 2,
}

public class ShoppingItem
{
    public Guid Id { get; set; }
    public Guid ShoppingOrderId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Quantity { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;
    public QualityStatus QualityStatus { get; set; } = QualityStatus.Good;
    public ShoppingOrder? ShoppingOrder { get; set; }
}
public enum QualityStatus
{
    NotRated = 0,
    Good = 1,
    Acceptable = 2,
    Poor = 3,
    Expired = 4
}

