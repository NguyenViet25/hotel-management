using System;
using System.ComponentModel.DataAnnotations;

namespace HotelManagement.API.Models
{
    /// <summary>
    /// Request model for creating a payment
    /// </summary>
    public class PaymentRequest
    {
        /// <summary>
        /// The ID of the booking associated with this payment
        /// </summary>
        [Required]
        public Guid BookingId { get; set; }

        /// <summary>
        /// The payment amount
        /// </summary>
        [Required]
        public decimal Amount { get; set; }

        /// <summary>
        /// The payment method used
        /// </summary>
        [Required]
        public string PaymentMethod { get; set; }

        /// <summary>
        /// The type of payment (Deposit, FullPayment, Refund)
        /// </summary>
        [Required]
        public string PaymentType { get; set; }

        /// <summary>
        /// Reference number for the payment
        /// </summary>
        public string ReferenceNumber { get; set; }

        /// <summary>
        /// Additional notes about the payment
        /// </summary>
        public string Notes { get; set; }

        /// <summary>
        /// ID of the staff member who processed the payment
        /// </summary>
        [Required]
        public Guid ProcessedById { get; set; }
    }

    /// <summary>
    /// Request model for processing a payment through a payment gateway
    /// </summary>
    public class ProcessPaymentRequest
    {
        /// <summary>
        /// The ID of the booking associated with this payment
        /// </summary>
        [Required]
        public Guid BookingId { get; set; }

        /// <summary>
        /// The payment amount
        /// </summary>
        [Required]
        public decimal Amount { get; set; }

        /// <summary>
        /// The payment method used
        /// </summary>
        [Required]
        public string PaymentMethod { get; set; }

        /// <summary>
        /// The payment gateway to use (Momo, VNPAY, etc.)
        /// </summary>
        [Required]
        public string PaymentGateway { get; set; }

        /// <summary>
        /// Additional payment details required by the gateway
        /// </summary>
        public object PaymentDetails { get; set; }

        /// <summary>
        /// ID of the staff member who processed the payment
        /// </summary>
        [Required]
        public Guid ProcessedById { get; set; }
    }

    /// <summary>
    /// Request model for voiding or refunding a payment
    /// </summary>
    public class VoidRefundRequest
    {
        /// <summary>
        /// The amount to void or refund
        /// </summary>
        [Required]
        public decimal Amount { get; set; }

        /// <summary>
        /// The reason for the void or refund
        /// </summary>
        [Required]
        public string Reason { get; set; }

        /// <summary>
        /// ID of the staff member who processed the void/refund
        /// </summary>
        [Required]
        public Guid ProcessedById { get; set; }
    }

    /// <summary>
    /// Request model for updating payment gateway settings
    /// </summary>
    public class PaymentGatewaySettingsRequest
    {
        /// <summary>
        /// The ID of the property these settings apply to
        /// </summary>
        [Required]
        public Guid PropertyId { get; set; }

        /// <summary>
        /// The type of payment gateway (Momo, VNPAY, etc.)
        /// </summary>
        [Required]
        public string GatewayType { get; set; }

        /// <summary>
        /// The gateway-specific settings
        /// </summary>
        public object Settings { get; set; }

        /// <summary>
        /// Whether this gateway is active
        /// </summary>
        public bool IsActive { get; set; }
    }

    /// <summary>
    /// Request model for generating an invoice
    /// </summary>
    public class GenerateInvoiceRequest
    {
        /// <summary>
        /// The type of invoice to generate (Standard, Tax)
        /// </summary>
        [Required]
        public string InvoiceType { get; set; }

        /// <summary>
        /// Customer information for the invoice
        /// </summary>
        public object CustomerInfo { get; set; }

        /// <summary>
        /// ID of the staff member who generated the invoice
        /// </summary>
        [Required]
        public Guid GeneratedById { get; set; }
    }
}