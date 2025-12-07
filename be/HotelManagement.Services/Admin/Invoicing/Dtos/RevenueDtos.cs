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

