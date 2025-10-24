using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HotelManagement.Domain.Entities;

namespace HotelManagement.Services.Interfaces
{
    /// <summary>
    /// Service interface for managing bookings and reservations
    /// </summary>
    public interface IBookingService
    {
        /// <summary>
        /// Creates a new booking
        /// </summary>
        Task<Booking> CreateBookingAsync(
            Guid guestId,
            Guid roomId,
            DateTime checkInDate,
            DateTime checkOutDate,
            int adults,
            int children,
            string specialRequests,
            Guid ratePlanId,
            decimal depositAmount);

        /// <summary>
        /// Updates an existing booking
        /// </summary>
        Task<bool> UpdateBookingAsync(
            Guid id,
            Guid roomId,
            DateTime checkInDate,
            DateTime checkOutDate,
            int adults,
            int children,
            string specialRequests,
            Guid ratePlanId);

        /// <summary>
        /// Cancels a booking
        /// </summary>
        Task<bool> CancelBookingAsync(
            Guid id,
            string cancellationReason,
            decimal refundAmount);

        /// <summary>
        /// Gets a booking by its ID
        /// </summary>
        Task<Booking> GetBookingByIdAsync(Guid id);

        /// <summary>
        /// Gets bookings with optional filtering
        /// </summary>
        Task<IEnumerable<Booking>> GetBookingsAsync(
            Guid? propertyId = null,
            string status = null,
            DateTime? fromDate = null,
            DateTime? toDate = null);

        /// <summary>
        /// Performs check-in for a booking
        /// </summary>
        Task<Booking> CheckInAsync(
            Guid id,
            DateTime actualCheckInTime,
            decimal depositAmount,
            string paymentMethod,
            bool idVerified,
            Guid assignedRoomId);

        /// <summary>
        /// Performs check-out for a booking
        /// </summary>
        Task<Booking> CheckOutAsync(
            Guid id,
            DateTime actualCheckOutTime,
            string paymentMethod,
            decimal additionalCharges,
            decimal discount,
            string discountReason);

        /// <summary>
        /// Extends a booking stay
        /// </summary>
        Task<Booking> ExtendBookingAsync(
            Guid id,
            DateTime newCheckOutDate,
            Guid ratePlanId);

        /// <summary>
        /// Changes the room for a booking
        /// </summary>
        Task<Booking> ChangeRoomAsync(
            Guid id,
            Guid newRoomId,
            string changeReason);
    }
}