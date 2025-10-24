using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HotelManagement.Domain.Entities;

namespace HotelManagement.Services.Interfaces
{
    /// <summary>
    /// Interface for payment service operations
    /// </summary>
    public interface IPaymentService
    {
        /// <summary>
        /// Gets all payments for a booking
        /// </summary>
        /// <param name="bookingId">The booking ID</param>
        /// <returns>A list of payments for the booking</returns>
        Task<IEnumerable<Payment>> GetPaymentsByBookingAsync(Guid bookingId);

        /// <summary>
        /// Gets a payment by its ID
        /// </summary>
        /// <param name="id">The payment ID</param>
        /// <returns>The payment if found, or null if not found</returns>
        Task<Payment> GetPaymentByIdAsync(Guid id);

        /// <summary>
        /// Creates a new payment (UC-40)
        /// </summary>
        /// <param name="bookingId">The booking ID</param>
        /// <param name="amount">The payment amount</param>
        /// <param name="paymentMethod">The payment method (Cash, Card, Bank Transfer, etc.)</param>
        /// <param name="paymentType">The payment type (Deposit, FullPayment, Refund)</param>
        /// <param name="referenceNumber">Optional reference number</param>
        /// <param name="notes">Optional notes</param>
        /// <param name="processedById">The ID of the user who processed the payment</param>
        /// <returns>The created payment</returns>
        Task<Payment> CreatePaymentAsync(
            Guid bookingId,
            decimal amount,
            string paymentMethod,
            string paymentType,
            string referenceNumber,
            string notes,
            Guid processedById);

        /// <summary>
        /// Processes a payment through a payment gateway (UC-44)
        /// </summary>
        /// <param name="bookingId">The booking ID</param>
        /// <param name="amount">The payment amount</param>
        /// <param name="paymentMethod">The payment method</param>
        /// <param name="paymentGateway">The payment gateway (Momo, VNPAY, etc.)</param>
        /// <param name="paymentDetails">Additional payment details required by the gateway</param>
        /// <param name="processedById">The ID of the user who processed the payment</param>
        /// <returns>The payment gateway response</returns>
        Task<object> ProcessPaymentAsync(
            Guid bookingId,
            decimal amount,
            string paymentMethod,
            string paymentGateway,
            object paymentDetails,
            Guid processedById);

        /// <summary>
        /// Voids or refunds a payment
        /// </summary>
        /// <param name="paymentId">The payment ID</param>
        /// <param name="amount">The amount to void or refund</param>
        /// <param name="reason">The reason for the void or refund</param>
        /// <param name="processedById">The ID of the user who processed the void or refund</param>
        /// <returns>The updated payment</returns>
        Task<Payment> VoidOrRefundPaymentAsync(
            Guid paymentId,
            decimal amount,
            string reason,
            Guid processedById);

        /// <summary>
        /// Gets payment gateway settings (UC-44)
        /// </summary>
        /// <param name="propertyId">The property ID</param>
        /// <returns>Payment gateway settings</returns>
        Task<object> GetPaymentGatewaySettingsAsync(Guid propertyId);

        /// <summary>
        /// Updates payment gateway settings (UC-44)
        /// </summary>
        /// <param name="propertyId">The property ID</param>
        /// <param name="gatewayType">The gateway type (Momo, VNPAY, etc.)</param>
        /// <param name="settings">The gateway settings</param>
        /// <param name="isActive">Whether the gateway is active</param>
        /// <returns>The updated payment gateway settings</returns>
        Task<object> UpdatePaymentGatewaySettingsAsync(
            Guid propertyId,
            string gatewayType,
            object settings,
            bool isActive);

        /// <summary>
        /// Generates an electronic invoice (UC-45)
        /// </summary>
        /// <param name="bookingId">The booking ID</param>
        /// <param name="invoiceType">The invoice type (Standard, Tax)</param>
        /// <param name="customerInfo">Customer information for the invoice</param>
        /// <param name="generatedById">The ID of the user who generated the invoice</param>
        /// <returns>The generated invoice information</returns>
        Task<object> GenerateInvoiceAsync(
            Guid bookingId,
            string invoiceType,
            object customerInfo,
            Guid generatedById);

        /// <summary>
        /// Gets payment reconciliation report (UC-40)
        /// </summary>
        /// <param name="propertyId">The property ID</param>
        /// <param name="fromDate">Start date for the report</param>
        /// <param name="toDate">End date for the report</param>
        /// <param name="paymentMethod">Optional payment method filter</param>
        /// <returns>Payment reconciliation report data</returns>
        Task<object> GetPaymentReconciliationReportAsync(
            Guid propertyId,
            DateTime fromDate,
            DateTime toDate,
            string paymentMethod = null);
    }
}