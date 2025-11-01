namespace HotelManagement.Domain;

public class Payment
{
    public Guid Id { get; set; }
    public Guid HotelId { get; set; }
    public Guid? BookingId { get; set; }
    public Guid? OrderId { get; set; }
    public Guid? InvoiceId { get; set; }
    public decimal Amount { get; set; }
    public PaymentType Type { get; set; }
    public PaymentMethod Method { get; set; }
    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
    public string? TransactionReference { get; set; }
    public string? Notes { get; set; }
    public Guid CreatedById { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public Invoice? Invoice { get; set; }
}

public class Invoice
{
    public Guid Id { get; set; }
    public Guid HotelId { get; set; }
    public Guid? BookingId { get; set; }
    public Guid? OrderId { get; set; }
    public Guid? GuestId { get; set; }
    public bool IsWalkIn { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public decimal SubTotal { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public bool VatIncluded { get; set; } = true;
    public string? PdfUrl { get; set; }
    public InvoiceStatus Status { get; set; } = InvoiceStatus.Draft;
    public string? Notes { get; set; }
    public Guid CreatedById { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? IssuedAt { get; set; }
    public DateTime? PaidAt { get; set; }
    
    // Navigation properties
    public ICollection<InvoiceLine> Lines { get; set; } = new List<InvoiceLine>();
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
}

public enum InvoiceLineSourceType
{
    RoomCharge = 0,
    Fnb = 1,
    Surcharge = 2,
    Discount = 3
}

public class InvoiceLine
{
    public Guid Id { get; set; }
    public Guid InvoiceId { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public InvoiceLineSourceType SourceType { get; set; }
    public Guid? SourceId { get; set; }
}