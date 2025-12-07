namespace HotelManagement.Domain;

public class MenuItem
{
    public Guid Id { get; set; }
    public Guid HotelId { get; set; }
    public string? Category { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public MenuItemStatus Status { get; set; } = MenuItemStatus.Available;
}


public enum MenuItemStatus
{
    Available = 0,
    Unavailable = 1,
}

