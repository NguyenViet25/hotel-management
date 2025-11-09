namespace HotelManagement.Domain;

public class VatInvoice
{
    public Guid Id { get; set; }
    public Guid InvoiceId { get; set; }
    public string VatNumber { get; set; } = string.Empty;
    public string CompanyName { get; set; } = string.Empty;
    public string CompanyAddress { get; set; } = string.Empty;
    public string CompanyTaxCode { get; set; } = string.Empty;
    public string? RecipientEmail { get; set; }
    public string? RecipientPhone { get; set; }
    public bool EmailSent { get; set; }
    public DateTime? EmailSentAt { get; set; }
    public string? ElectronicInvoiceReference { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public Guid CreatedById { get; set; }
    
    // Navigation properties
    public Invoice Invoice { get; set; } = null!;
}