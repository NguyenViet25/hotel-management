using System.ComponentModel.DataAnnotations;
using HotelManagement.Domain;

namespace HotelManagement.Services.Admin.Invoicing.Dtos;

public class PaymentDto
{
    public Guid Id { get; set; }
    public Guid HotelId { get; set; }
    public Guid? BookingId { get; set; }
    public Guid? OrderId { get; set; }
    public Guid? InvoiceId { get; set; }
    public decimal Amount { get; set; }
    public PaymentType Type { get; set; }
    public string TypeName => Type.ToString();
    public PaymentMethod Method { get; set; }
    public string MethodName => Method.ToString();
    public PaymentStatus Status { get; set; }
    public string StatusName => Status.ToString();
    public string? TransactionReference { get; set; }
    public string? Notes { get; set; }
    public DateTime Timestamp { get; set; }
}

public class ProcessPaymentDto
{
    [Required]
    public Guid HotelId { get; set; }
    
    [Required]
    public Guid InvoiceId { get; set; }
    
    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0")]
    public decimal Amount { get; set; }
    
    [Required]
    public PaymentMethod Method { get; set; }
    
    public string? TransactionReference { get; set; }
    
    public string? Notes { get; set; }
}

public class RefundDepositDto
{
    [Required]
    public Guid HotelId { get; set; }
    
    [Required]
    public Guid BookingId { get; set; }
    
    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0")]
    public decimal Amount { get; set; }
    
    [Required]
    public PaymentMethod Method { get; set; }
    
    public string? TransactionReference { get; set; }
    
    public string? Notes { get; set; }
}

public class CashRegisterSummaryDto
{
    public DateTime Date { get; set; }
    public decimal OpeningBalance { get; set; }
    public decimal ClosingBalance { get; set; }
    public decimal TotalPaymentsIn { get; set; }
    public decimal TotalPaymentsOut { get; set; }
    public List<PaymentDto> Transactions { get; set; } = new();
}