namespace HotelManagement.Domain;

public class MenuGroup
{
    public Guid Id { get; set; }
    public Guid HotelId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Shift { get; set; } // breakfast/lunch/dinner etc.
    public ICollection<MenuItem> Items { get; set; } = new List<MenuItem>();
}

public class MenuItem
{
    public Guid Id { get; set; }
    public Guid HotelId { get; set; }
    public Guid? MenuGroupId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public string PortionSize { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public MenuItemStatus Status { get; set; } = MenuItemStatus.Available;
    public MenuGroup? Group { get; set; }
    public ICollection<MenuItemIngredient> Ingredients { get; set; } = new List<MenuItemIngredient>();
}

public class MenuItemIngredient
{
    public Guid Id { get; set; }
    public Guid MenuItemId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Quantity { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;
    public MenuItem? MenuItem { get; set; }
}

public enum MenuItemStatus
{
    Available = 0,
    Unavailable = 1,
    SeasonallyUnavailable = 2
}