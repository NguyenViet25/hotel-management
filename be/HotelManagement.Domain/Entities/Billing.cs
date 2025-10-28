namespace HotelManagement.Domain;

public class Payment
{
    public Guid Id { get; set; }
    public Guid HotelId { get; set; }
    public Guid? BookingId { get; set; }
    public Guid? OrderId { get; set; }
    public decimal Amount { get; set; }
    public PaymentType Type { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}

public class Invoice
{
    public Guid Id { get; set; }
    public Guid HotelId { get; set; }
    public Guid? BookingId { get; set; }
    public Guid? OrderId { get; set; }
    public decimal TotalAmount { get; set; }
    public bool VatIncluded { get; set; } = true;
    public string? PdfUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<InvoiceLine> Lines { get; set; } = new List<InvoiceLine>();
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