namespace HotelManagement.Domain;

public class OrderItemHistory
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public Guid OldOrderItemId { get; set; }
    public Guid NewOrderItemId { get; set; }
    public Guid OldMenuItemId { get; set; }
    public Guid NewMenuItemId { get; set; }
    public DateTime ChangedAt { get; set; } = DateTime.Now;
    public Guid? UserId { get; set; }
    public string? Reason { get; set; }
}