using System.ComponentModel.DataAnnotations;

namespace HotelManagement.Services.Admin.Invoicing.Dtos;

public class PromotionDto
{
    public Guid? Id { get; set; }
    public Guid? HotelId { get; set; }
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal? Value { get; set; }
    public bool? IsActive { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}

public class ApplyPromotionDto
{
    [Required]
    public string PromotionCode { get; set; } = string.Empty;
}

public class PromotionValidationResult
{
    public bool IsValid { get; set; }
    public string? ErrorMessage { get; set; }
    public PromotionDto? Promotion { get; set; }
    public decimal DiscountAmount { get; set; }
}