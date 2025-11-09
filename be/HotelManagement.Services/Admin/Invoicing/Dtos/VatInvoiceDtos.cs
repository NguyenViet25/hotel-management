using System.ComponentModel.DataAnnotations;

namespace HotelManagement.Services.Admin.Invoicing.Dtos;

public class VatInvoiceDto
{
    public Guid Id { get; set; }
    public Guid InvoiceId { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public string VatNumber { get; set; } = string.Empty;
    public string CompanyName { get; set; } = string.Empty;
    public string CompanyAddress { get; set; } = string.Empty;
    public string CompanyTaxCode { get; set; } = string.Empty;
    public string? RecipientEmail { get; set; }
    public string? RecipientPhone { get; set; }
    public bool EmailSent { get; set; }
    public DateTime? EmailSentAt { get; set; }
    public string? ElectronicInvoiceReference { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? PdfUrl { get; set; }
}

public class GenerateVatInvoiceDto
{
    [Required]
    public Guid InvoiceId { get; set; }
    
    [Required]
    public string CompanyName { get; set; } = string.Empty;
    
    [Required]
    public string CompanyAddress { get; set; } = string.Empty;
    
    [Required]
    public string CompanyTaxCode { get; set; } = string.Empty;
    
    [EmailAddress]
    public string? RecipientEmail { get; set; }
    
    public string? RecipientPhone { get; set; }
}

public class SendVatInvoiceEmailDto
{
    [Required]
    public Guid VatInvoiceId { get; set; }
    
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
}