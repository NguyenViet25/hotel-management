using System.ComponentModel.DataAnnotations;
using HotelManagement.Domain;

namespace HotelManagement.Services.Admin.Invoicing.Dtos;

public class InvoiceDto
{
    public Guid Id { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public Guid HotelId { get; set; }
    public Guid? BookingId { get; set; }
    public Guid? OrderId { get; set; }
    public Guid? GuestId { get; set; }
    public string? GuestName { get; set; }
    public bool IsWalkIn { get; set; }
    public decimal SubTotal { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal RemainingAmount => TotalAmount - PaidAmount;
    public bool VatIncluded { get; set; }
    public string? PdfUrl { get; set; }
    public InvoiceStatus Status { get; set; }
    public string StatusName => Status.ToString();
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? IssuedAt { get; set; }
    public DateTime? PaidAt { get; set; }
    public List<InvoiceLineDto> Lines { get; set; } = new();
    public List<PaymentDto> Payments { get; set; } = new();
}

public class InvoiceLineDto
{
    public Guid Id { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public InvoiceLineSourceType SourceType { get; set; }
    public string SourceTypeName => SourceType.ToString();
    public Guid? SourceId { get; set; }
}

public class CreateInvoiceDto
{
    [Required]
    public Guid HotelId { get; set; }
    
    public Guid? BookingId { get; set; }
    
    public Guid? OrderId { get; set; }
    
    public Guid? GuestId { get; set; }
    
    public bool IsWalkIn { get; set; }
    
    public string? Notes { get; set; }
    
    [Required]
    public List<CreateInvoiceLineDto> Lines { get; set; } = new();
}

public class CreateInvoiceLineDto
{
    [Required]
    public string Description { get; set; } = string.Empty;
    
    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0")]
    public decimal Amount { get; set; }
    
    [Required]
    public InvoiceLineSourceType SourceType { get; set; }
    
    public Guid? SourceId { get; set; }
}

public class UpdateInvoiceDto
{
    public string? Notes { get; set; }
    
    public List<CreateInvoiceLineDto>? AddLines { get; set; }
    
    public List<Guid>? RemoveLineIds { get; set; }
}

public class InvoiceFilterDto
{
    public Guid? HotelId { get; set; }
    public Guid? BookingId { get; set; }
    public Guid? GuestId { get; set; }
    public InvoiceStatus? Status { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}

public class PagedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
}