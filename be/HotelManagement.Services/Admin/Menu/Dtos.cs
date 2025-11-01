using HotelManagement.Domain;
using System.ComponentModel.DataAnnotations;

namespace HotelManagement.Services.Admin.Menu;

public class MenuQueryDto
{
    public Guid? GroupId { get; set; }
    public string? Shift { get; set; }
    public MenuItemStatus? Status { get; set; }
    public bool? IsActive { get; set; }
}

public class MenuItemDto
{
    public Guid Id { get; set; }
    public Guid HotelId { get; set; }
    public Guid? MenuGroupId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public string PortionSize { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public MenuItemStatus Status { get; set; }
    public MenuGroupDto? Group { get; set; }
    public List<MenuItemIngredientDto> Ingredients { get; set; } = new();
}

public class MenuItemIngredientDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Quantity { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;
}

public class CreateMenuItemDto
{
    [Required]
    public Guid? MenuGroupId { get; set; }
    
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [StringLength(500)]
    public string Description { get; set; } = string.Empty;
    
    [Required]
    [Range(0.01, 10000000)]
    public decimal UnitPrice { get; set; }
    
    [Required]
    [StringLength(50)]
    public string PortionSize { get; set; } = string.Empty;
    
    public string ImageUrl { get; set; } = string.Empty;
    
    public MenuItemStatus Status { get; set; } = MenuItemStatus.Available;
    
    public List<CreateMenuItemIngredientDto> Ingredients { get; set; } = new();
}

public class CreateMenuItemIngredientDto
{
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [StringLength(20)]
    public string Quantity { get; set; } = string.Empty;
    
    [Required]
    [StringLength(20)]
    public string Unit { get; set; } = string.Empty;
}

public class UpdateMenuItemDto
{
    public Guid? MenuGroupId { get; set; }
    
    [StringLength(100)]
    public string? Name { get; set; }
    
    [StringLength(500)]
    public string? Description { get; set; }
    
    [Range(0.01, 10000000)]
    public decimal? UnitPrice { get; set; }
    
    [StringLength(50)]
    public string? PortionSize { get; set; }
    
    public string? ImageUrl { get; set; }
    
    public MenuItemStatus? Status { get; set; }
    
    public bool? IsActive { get; set; }
    
    public List<UpdateMenuItemIngredientDto>? Ingredients { get; set; }
}

public class UpdateMenuItemIngredientDto
{
    public Guid? Id { get; set; }
    
    [StringLength(100)]
    public string? Name { get; set; }
    
    [StringLength(20)]
    public string? Quantity { get; set; }
    
    [StringLength(20)]
    public string? Unit { get; set; }
}

public class MenuGroupDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Shift { get; set; }
}

public class CreateMenuGroupDto
{
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [StringLength(50)]
    public string? Shift { get; set; }
}