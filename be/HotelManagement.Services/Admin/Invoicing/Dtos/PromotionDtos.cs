using System.ComponentModel.DataAnnotations;
using HotelManagement.Domain;

namespace HotelManagement.Services.Admin.Invoicing.Dtos;

public class PromotionDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public PromotionType Type { get; set; }
    public string TypeName => Type.ToString();
    public decimal Value { get; set; }
    public decimal? MinimumSpend { get; set; }
    public decimal? MaximumDiscount { get; set; }
    public bool IsActive { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int? UsageLimit { get; set; }
    public int UsageCount { get; set; }
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

public class LoyaltyPointsDto
{
    public Guid GuestId { get; set; }
    public string GuestName { get; set; } = string.Empty;
    public decimal PointsBalance { get; set; }
    public string MembershipTier { get; set; } = string.Empty;
    public decimal PointValue { get; set; }
    public decimal MonetaryValue => PointsBalance * PointValue;
}

public class ApplyLoyaltyPointsDto
{
    [Required]
    public Guid GuestId { get; set; }
    
    [Required]
    [Range(1, double.MaxValue, ErrorMessage = "Points must be greater than 0")]
    public decimal PointsToRedeem { get; set; }
}