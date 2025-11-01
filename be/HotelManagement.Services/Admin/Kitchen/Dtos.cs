using System.ComponentModel.DataAnnotations;

namespace HotelManagement.Services.Admin.Kitchen;

public class ShoppingListRequestDto
{
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public List<Guid>? MenuItemIds { get; set; }
}

public class ShoppingListDto
{
    public Guid Id { get; set; }
    public DateTime GeneratedDate { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public List<ShoppingListItemDto> Items { get; set; } = new();
}

public class ShoppingListItemDto
{
    public string IngredientName { get; set; } = string.Empty;
    public decimal TotalQuantity { get; set; }
    public string Unit { get; set; } = string.Empty;
    public List<string> RelatedMenuItems { get; set; } = new();
}

public class IngredientQualityCheckDto
{
    [Required]
    public string IngredientName { get; set; } = string.Empty;
    
    [Required]
    public QualityStatus Status { get; set; }
    
    public string? Notes { get; set; }
    
    public bool NeedsReplacement { get; set; }
    
    public decimal? ReplacementQuantity { get; set; }
    
    public string? ReplacementUnit { get; set; }
}

public class IngredientQualityCheckResultDto
{
    public Guid Id { get; set; }
    public string IngredientName { get; set; } = string.Empty;
    public QualityStatus Status { get; set; }
    public string? Notes { get; set; }
    public bool NeedsReplacement { get; set; }
    public decimal? ReplacementQuantity { get; set; }
    public string? ReplacementUnit { get; set; }
    public DateTime CheckedDate { get; set; }
    public string CheckedByUserName { get; set; } = string.Empty;
}

public enum QualityStatus
{
    Good = 0,
    Acceptable = 1,
    Poor = 2,
    Expired = 3
}