using System;
using HotelManagement.Domain.Common;
using HotelManagement.Domain.Enums;

namespace HotelManagement.Domain.Entities
{
    public class Payment : BaseEntity
    {
        public string TransactionId { get; set; }
        public Guid BookingId { get; set; }
        public Guid HotelPropertyId { get; set; }
        public decimal Amount { get; set; }
        public PaymentMethod Method { get; set; }
        public PaymentStatus Status { get; set; }
        public DateTime TransactionDate { get; set; }
        public string CardType { get; set; }
        public string Last4Digits { get; set; }
        public string AuthorizationCode { get; set; }
        public string ReferenceNumber { get; set; }
        public string Notes { get; set; }
        public string ReceiptNumber { get; set; }
        public PaymentType Type { get; set; }
        
        // Navigation properties
        public virtual Booking Booking { get; set; }
        public virtual HotelProperty HotelProperty { get; set; }
    }
}