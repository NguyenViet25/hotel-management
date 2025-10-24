using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HotelManagement.API.Models;
using HotelManagement.Domain.Entities;
using HotelManagement.Services.Interfaces;

namespace HotelManagement.API.Controllers
{
    /// <summary>
    /// Controller for managing bookings and reservations
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class BookingController : ControllerBase
    {
        private readonly IBookingService _bookingService;

        public BookingController(IBookingService bookingService)
        {
            _bookingService = bookingService;
        }

        /// <summary>
        /// Creates a new booking (UC-12)
        /// </summary>
        /// <param name="request">The booking request details</param>
        /// <returns>The created booking</returns>
        [HttpPost]
        [Authorize(Roles = "Administrator,PropertyManager,Receptionist")]
        public async Task<ActionResult<Booking>> CreateBooking([FromBody] BookingRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var booking = await _bookingService.CreateBookingAsync(
                request.GuestId,
                request.RoomId,
                request.CheckInDate,
                request.CheckOutDate,
                request.Adults,
                request.Children,
                request.SpecialRequests,
                request.RatePlanId,
                request.DepositAmount);

            return CreatedAtAction(nameof(GetBookingById), new { id = booking.Id }, booking);
        }

        /// <summary>
        /// Updates an existing booking (UC-13)
        /// </summary>
        /// <param name="id">The ID of the booking to update</param>
        /// <param name="request">The updated booking details</param>
        /// <returns>No content if successful</returns>
        [HttpPut("{id}")]
        [Authorize(Roles = "Administrator,PropertyManager,Receptionist")]
        public async Task<IActionResult> UpdateBooking(Guid id, [FromBody] BookingRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _bookingService.UpdateBookingAsync(
                id,
                request.RoomId,
                request.CheckInDate,
                request.CheckOutDate,
                request.Adults,
                request.Children,
                request.SpecialRequests,
                request.RatePlanId);

            if (!result)
            {
                return NotFound();
            }

            return NoContent();
        }

        /// <summary>
        /// Cancels a booking (UC-13)
        /// </summary>
        /// <param name="id">The ID of the booking to cancel</param>
        /// <param name="request">The cancellation details</param>
        /// <returns>No content if successful</returns>
        [HttpPost("{id}/cancel")]
        [Authorize(Roles = "Administrator,PropertyManager,Receptionist")]
        public async Task<IActionResult> CancelBooking(Guid id, [FromBody] CancellationRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _bookingService.CancelBookingAsync(
                id,
                request.CancellationReason,
                request.RefundAmount);

            if (!result)
            {
                return NotFound();
            }

            return NoContent();
        }

        /// <summary>
        /// Gets a booking by its ID
        /// </summary>
        /// <param name="id">The ID of the booking to retrieve</param>
        /// <returns>The booking if found, or NotFound if not found</returns>
        [HttpGet("{id}")]
        [Authorize(Roles = "Administrator,PropertyManager,Receptionist")]
        public async Task<ActionResult<Booking>> GetBookingById(Guid id)
        {
            var booking = await _bookingService.GetBookingByIdAsync(id);
            if (booking == null)
            {
                return NotFound();
            }

            return Ok(booking);
        }

        /// <summary>
        /// Gets all bookings with optional filtering
        /// </summary>
        /// <param name="propertyId">Optional property ID filter</param>
        /// <param name="status">Optional booking status filter</param>
        /// <param name="fromDate">Optional from date filter</param>
        /// <param name="toDate">Optional to date filter</param>
        /// <returns>A list of bookings matching the criteria</returns>
        [HttpGet]
        [Authorize(Roles = "Administrator,PropertyManager,Receptionist")]
        public async Task<ActionResult<IEnumerable<Booking>>> GetBookings(
            [FromQuery] Guid? propertyId = null,
            [FromQuery] string? status = null,
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null)
        {
            var bookings = await _bookingService.GetBookingsAsync(propertyId, status, fromDate, toDate);
            return Ok(bookings);
        }

        /// <summary>
        /// Performs check-in for a booking (UC-14)
        /// </summary>
        /// <param name="id">The ID of the booking to check in</param>
        /// <param name="request">The check-in details</param>
        /// <returns>The updated booking</returns>
        [HttpPost("{id}/check-in")]
        [Authorize(Roles = "Administrator,PropertyManager,Receptionist")]
        public async Task<ActionResult<Booking>> CheckIn(Guid id, [FromBody] dynamic request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var booking = await _bookingService.CheckInAsync(
                id,
                request.ActualCheckInTime,
                request.DepositAmount,
                request.PaymentMethod,
                request.IdVerified,
                request.AssignedRoomId);

            if (booking == null)
            {
                return NotFound();
            }

            return Ok(booking);
        }

        /// <summary>
        /// Performs check-out for a booking (UC-16)
        /// </summary>
        /// <param name="id">The ID of the booking to check out</param>
        /// <param name="request">The check-out details</param>
        /// <returns>The updated booking with final bill</returns>
        [HttpPost("{id}/check-out")]
        [Authorize(Roles = "Administrator,PropertyManager,Receptionist")]
        public async Task<ActionResult<Booking>> CheckOut(Guid id, [FromBody] dynamic request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var booking = await _bookingService.CheckOutAsync(
                id,
                request.ActualCheckOutTime,
                request.PaymentMethod,
                request.AdditionalCharges,
                request.Discount,
                request.DiscountReason);

            if (booking == null)
            {
                return NotFound();
            }

            return Ok(booking);
        }

        /// <summary>
        /// Extends a booking stay (UC-18)
        /// </summary>
        /// <param name="id">The ID of the booking to extend</param>
        /// <param name="request">The extension details</param>
        /// <returns>The updated booking</returns>
        [HttpPost("{id}/extend")]
        [Authorize(Roles = "Administrator,PropertyManager,Receptionist")]
        public async Task<ActionResult<Booking>> ExtendBooking(Guid id, [FromBody] dynamic request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var booking = await _bookingService.ExtendBookingAsync(
                id,
                request.NewCheckOutDate,
                request.RatePlanId);

            if (booking == null)
            {
                return NotFound();
            }

            return Ok(booking);
        }

        /// <summary>
        /// Changes the room for a booking (UC-18)
        /// </summary>
        /// <param name="id">The ID of the booking to change room</param>
        /// <param name="request">The room change details</param>
        /// <returns>The updated booking</returns>
        [HttpPost("{id}/change-room")]
        [Authorize(Roles = "Administrator,PropertyManager,Receptionist")]
        public async Task<ActionResult<Booking>> ChangeRoom(Guid id, [FromBody] ChangeRoomRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var booking = await _bookingService.ChangeRoomAsync(
                id,
                request.NewRoomId,
                request.ChangeReason);

            if (booking == null)
            {
                return NotFound();
            }

            return Ok(booking);
        }
    }
}