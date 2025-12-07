using HotelManagement.Domain;
using System.ComponentModel.DataAnnotations;

namespace HotelManagement.Services.Admin.Invoicing.Dtos;

public class RevenueQueryDto
{
    [Required]
    public Guid HotelId { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public string? Granularity { get; set; } // "day" | "month"
    public bool IncludeIssued { get; set; } = true;
    public bool IncludePaid { get; set; } = true;
}

public class RevenuePointDto
{
    public DateTime Date { get; set; }
    public decimal Total { get; set; }
}

public class RevenueStatsDto
{
    public decimal Total { get; set; }
    public int Count { get; set; }
    public List<RevenuePointDto> Points { get; set; } = new();
}

public class RevenueCategoryPointDto
{
    public DateTime Date { get; set; }
    public decimal RoomTotal { get; set; }
    public decimal FnbTotal { get; set; }
    public decimal OtherTotal { get; set; }
    public decimal DiscountTotal { get; set; }
}

public class RevenueBreakdownDto
{
    public decimal RoomTotal { get; set; }
    public decimal FnbTotal { get; set; }
    public decimal OtherTotal { get; set; }
    public decimal DiscountTotal { get; set; }
    public List<RevenueCategoryPointDto> Points { get; set; } = new();
}

public class RevenueDetailItemDto
{
    public Guid InvoiceId { get; set; }
    public Guid? BookingId { get; set; }
    public Guid? OrderId { get; set; }
    public DateTime CreatedAt { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public InvoiceLineSourceType SourceType { get; set; }
}


