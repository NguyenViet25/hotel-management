using System;
using System.Collections.Generic;
using HotelManagement.Domain.Common;
using HotelManagement.Domain.Enums;

namespace HotelManagement.Domain.Entities
{
    public class Booking : BaseEntity
    {
        public string BookingNumber { get; set; }
        public Guid GuestId { get; set; }
        public Guid RoomId { get; set; }
        public Guid? RatePlanId { get; set; }
        public Guid HotelPropertyId { get; set; }
        public DateTime CheckInDate { get; set; }
        public DateTime CheckOutDate { get; set; }
        public int Adults { get; set; }
        public int Children { get; set; }
        public BookingStatus Status { get; set; }
        public BookingSource Source { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal? DepositAmount { get; set; }
        public bool DepositPaid { get; set; }
        public decimal? TaxAmount { get; set; }
        public string SpecialRequests { get; set; }
        public DateTime? CancellationDate { get; set; }
        public string CancellationReason { get; set; }
        public decimal? CancellationFee { get; set; }
        public DateTime? ActualCheckInDate { get; set; }
        public DateTime? ActualCheckOutDate { get; set; }
        
        // Navigation properties
        public virtual Guest Guest { get; set; }
        public virtual Room Room { get; set; }
        public virtual RatePlan RatePlan { get; set; }
        public virtual HotelProperty HotelProperty { get; set; }
        public virtual ICollection<Payment> Payments { get; set; }
    }
}