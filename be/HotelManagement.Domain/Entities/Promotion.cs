namespace HotelManagement.Domain;

public class Promotion
{
    public Guid Id { get; set; }
    public Guid HotelId { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public PromotionType Type { get; set; }
    public decimal Value { get; set; }
    public decimal? MinimumSpend { get; set; }
    public decimal? MaximumDiscount { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int? UsageLimit { get; set; }
    public int UsageCount { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public Guid CreatedById { get; set; }
}

public class LoyaltyProgram
{
    public Guid Id { get; set; }
    public Guid HotelId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal PointsPerSpend { get; set; } // e.g., 1 point per $10 spent
    public decimal PointValue { get; set; } // e.g., 1 point = $0.01
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public Guid CreatedById { get; set; }
}

public class GuestLoyalty
{
    public Guid Id { get; set; }
    public Guid GuestId { get; set; }
    public Guid LoyaltyProgramId { get; set; }
    public decimal PointsBalance { get; set; }
    public string MembershipTier { get; set; } = "Standard";
    public DateTime JoinedDate { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public LoyaltyProgram LoyaltyProgram { get; set; } = null!;
}

public class LoyaltyTransaction
{
    public Guid Id { get; set; }
    public Guid GuestLoyaltyId { get; set; }
    public Guid? InvoiceId { get; set; }
    public decimal Points { get; set; }
    public string Description { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public GuestLoyalty GuestLoyalty { get; set; } = null!;
    public Invoice? Invoice { get; set; }
}