using System;
using HotelManagement.Domain.Common;
using HotelManagement.Domain.Enums;

namespace HotelManagement.Domain.Entities
{
    public class Reservation : BaseEntity
    {
        public string ReservationNumber { get; set; }
        public Guid RestaurantId { get; set; }
        public Guid? GuestId { get; set; }
        public Guid? BookingId { get; set; }
        public string CustomerName { get; set; }
        public string ContactNumber { get; set; }
        public string Email { get; set; }
        public DateTime ReservationDate { get; set; }
        public TimeSpan ReservationTime { get; set; }
        public int PartySize { get; set; }
        public string SpecialRequests { get; set; }
        public ReservationStatus Status { get; set; }
        public string TableNumber { get; set; }
        public DateTime? ArrivalTime { get; set; }
        public DateTime? DepartureTime { get; set; }
        
        // Navigation properties
        public virtual Restaurant Restaurant { get; set; }
        public virtual Guest Guest { get; set; }
        public virtual Booking Booking { get; set; }
    }
}