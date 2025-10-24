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
    /// Controller for managing payments
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentService _paymentService;

        public PaymentController(IPaymentService paymentService)
        {
            _paymentService = paymentService;
        }

        /// <summary>
        /// Gets all payments for a booking
        /// </summary>
        /// <param name="bookingId">The booking ID</param>
        /// <returns>A list of payments for the booking</returns>
        [HttpGet("by-booking/{bookingId}")]
        public async Task<ActionResult<IEnumerable<Payment>>> GetPaymentsByBooking(Guid bookingId)
        {
            var payments = await _paymentService.GetPaymentsByBookingAsync(bookingId);
            return Ok(payments);
        }

        /// <summary>
        /// Gets a payment by its ID
        /// </summary>
        /// <param name="id">The payment ID</param>
        /// <returns>The payment if found, or NotFound if not found</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<Payment>> GetPaymentById(Guid id)
        {
            var payment = await _paymentService.GetPaymentByIdAsync(id);
            if (payment == null)
            {
                return NotFound();
            }

            return Ok(payment);
        }

        /// <summary>
        /// Creates a new payment (UC-40)
        /// </summary>
        /// <param name="request">The payment details</param>
        /// <returns>The created payment</returns>
        [HttpPost]
        [Authorize(Roles = "Administrator,PropertyManager,Receptionist,Accountant")]
        public async Task<ActionResult<Payment>> CreatePayment([FromBody] dynamic request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var payment = await _paymentService.CreatePaymentAsync(
                request.BookingId,
                request.Amount,
                request.PaymentMethod,
                request.PaymentType,
                request.ReferenceNumber,
                request.Notes,
                request.ProcessedById);

            return CreatedAtAction(nameof(GetPaymentById), new { id = payment.Id }, payment);
        }

        /// <summary>
        /// Processes a payment through a payment gateway (UC-44)
        /// </summary>
        /// <param name="request">The payment gateway request details</param>
        /// <returns>The payment gateway response</returns>
        [HttpPost("process")]
        [Authorize(Roles = "Administrator,PropertyManager,Receptionist,Accountant")]
        public async Task<ActionResult<object>> ProcessPayment([FromBody] ProcessPaymentRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var response = await _paymentService.ProcessPaymentAsync(
                request.BookingId,
                request.Amount,
                request.PaymentMethod,
                request.PaymentGateway,
                request.PaymentDetails,
                request.ProcessedById);

            return Ok(response);
        }

        /// <summary>
        /// Voids or refunds a payment
        /// </summary>
        /// <param name="id">The payment ID</param>
        /// <param name="request">The void/refund details</param>
        /// <returns>The updated payment</returns>
        [HttpPost("{id}/void-refund")]
        [Authorize(Roles = "Administrator,PropertyManager,Accountant")]
        public async Task<ActionResult<Payment>> VoidOrRefundPayment(Guid id, [FromBody] VoidRefundRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var payment = await _paymentService.VoidOrRefundPaymentAsync(
                id,
                request.Amount,
                request.Reason,
                request.ProcessedById);

            if (payment == null)
            {
                return NotFound();
            }

            return Ok(payment);
        }

        /// <summary>
        /// Gets payment gateway settings (UC-44)
        /// </summary>
        /// <param name="propertyId">The property ID</param>
        /// <returns>Payment gateway settings</returns>
        [HttpGet("gateway-settings")]
        [Authorize(Roles = "Administrator")]
        public async Task<ActionResult<object>> GetPaymentGatewaySettings([FromQuery] Guid propertyId)
        {
            var settings = await _paymentService.GetPaymentGatewaySettingsAsync(propertyId);
            return Ok(settings);
        }

        /// <summary>
        /// Updates payment gateway settings (UC-44)
        /// </summary>
        /// <param name="request">The updated payment gateway settings</param>
        /// <returns>The updated payment gateway settings</returns>
        [HttpPut("gateway-settings")]
        [Authorize(Roles = "Administrator")]
        public async Task<ActionResult<object>> UpdatePaymentGatewaySettings([FromBody] PaymentGatewaySettingsRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var settings = await _paymentService.UpdatePaymentGatewaySettingsAsync(
                request.PropertyId,
                request.GatewayType,
                request.Settings,
                request.IsActive);

            return Ok(settings);
        }

        /// <summary>
        /// Generates an electronic invoice (UC-45)
        /// </summary>
        /// <param name="bookingId">The booking ID</param>
        /// <param name="request">The invoice generation details</param>
        /// <returns>The generated invoice information</returns>
        [HttpPost("generate-invoice")]
        [Authorize(Roles = "Administrator,PropertyManager,Receptionist,Accountant")]
        public async Task<ActionResult<object>> GenerateInvoice(Guid bookingId, [FromBody] GenerateInvoiceRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var invoice = await _paymentService.GenerateInvoiceAsync(
                bookingId,
                request.InvoiceType,
                request.CustomerInfo,
                request.GeneratedById);

            return Ok(invoice);
        }

        /// <summary>
        /// Gets payment reconciliation report (UC-40)
        /// </summary>
        /// <param name="propertyId">The property ID</param>
        /// <param name="fromDate">Start date for the report</param>
        /// <param name="toDate">End date for the report</param>
        /// <param name="paymentMethod">Optional payment method filter</param>
        /// <returns>Payment reconciliation report data</returns>
        [HttpGet("reconciliation")]
        [Authorize(Roles = "Administrator,PropertyManager,Accountant")]
        public async Task<ActionResult<object>> GetPaymentReconciliationReport(
            [FromQuery] Guid propertyId,
            [FromQuery] DateTime fromDate,
            [FromQuery] DateTime toDate,
            [FromQuery] string paymentMethod = null)
        {
            var report = await _paymentService.GetPaymentReconciliationReportAsync(
                propertyId,
                fromDate,
                toDate,
                paymentMethod);

            return Ok(report);
        }
    }


}