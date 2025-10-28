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
    public decimal UnitPrice { get; set; }
    public bool IsActive { get; set; } = true;
    public MenuGroup? Group { get; set; }
}