using System;
using HotelManagement.Domain.Enums;

namespace HotelManagement.API.Models
{
    /// <summary>
    /// Request model for creating or updating a booking
    /// </summary>
    public class BookingRequest
    {
        public Guid GuestId { get; set; }
        public Guid RoomId { get; set; }
        public DateTime CheckInDate { get; set; }
        public DateTime CheckOutDate { get; set; }
        public int Adults { get; set; }
        public int Children { get; set; }
        public string SpecialRequests { get; set; }
        public Guid RatePlanId { get; set; }
        public decimal DepositAmount { get; set; }
    }

    /// <summary>
    /// Request model for checking in a guest
    /// </summary>
    public class CheckInRequest
    {
        public DateTime ActualCheckInTime { get; set; }
        public decimal DepositAmount { get; set; }
        public PaymentMethod PaymentMethod { get; set; }
        public bool IdVerified { get; set; }
        public Guid? AssignedRoomId { get; set; }
    }

    /// <summary>
    /// Request model for checking out a guest
    /// </summary>
    public class CheckOutRequest
    {
        public DateTime ActualCheckOutTime { get; set; }
        public PaymentMethod PaymentMethod { get; set; }
        public decimal AdditionalCharges { get; set; }
        public decimal Discount { get; set; }
        public string DiscountReason { get; set; }
    }

    /// <summary>
    /// Request model for changing a room for a booking
    /// </summary>
    public class ChangeRoomRequest
    {
        public Guid NewRoomId { get; set; }
        public string ChangeReason { get; set; }
    }

    /// <summary>
    /// Request model for cancelling a booking
    /// </summary>
    public class CancellationRequest
    {
        public string CancellationReason { get; set; }
        public decimal RefundAmount { get; set; }
    }

    /// <summary>
    /// Request model for extending a booking
    /// </summary>
    public class ExtendBookingRequest
    {
        public DateTime NewCheckOutDate { get; set; }
        public Guid? RatePlanId { get; set; }
    }
}