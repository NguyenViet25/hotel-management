using System;
using System.Collections.Generic;
using HotelManagement.Domain.Common;
using HotelManagement.Domain.Enums;

namespace HotelManagement.Domain.Entities
{
    public class Order : BaseEntity
    {
        public string OrderNumber { get; set; }
        public Guid RestaurantId { get; set; }
        public Guid? ReservationId { get; set; }
        public Guid? BookingId { get; set; }
        public Guid? GuestId { get; set; }
        public string TableNumber { get; set; }
        public string ServerName { get; set; }
        public DateTime OrderDate { get; set; }
        public OrderStatus Status { get; set; }
        public decimal Subtotal { get; set; }
        public decimal TaxAmount { get; set; }
        public decimal TipAmount { get; set; }
        public decimal TotalAmount { get; set; }
        public PaymentMethod PaymentMethod { get; set; }
        public string PaymentReference { get; set; }
        public bool IsPaid { get; set; }
        public string Notes { get; set; }
        public bool IsRoomCharge { get; set; }
        public string RoomNumber { get; set; }
        
        // Navigation properties
        public virtual Restaurant Restaurant { get; set; }
        public virtual Reservation Reservation { get; set; }
        public virtual Booking Booking { get; set; }
        public virtual Guest Guest { get; set; }
        public virtual ICollection<OrderItem> OrderItems { get; set; }
    }
}