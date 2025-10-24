using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using HotelManagement.Domain.Enums;

namespace HotelManagement.API.Models
{
    /// <summary>
    /// Request model for creating or updating a restaurant
    /// </summary>
    public class RestaurantRequest
    {
        /// <summary>
        /// The name of the restaurant
        /// </summary>
        [Required]
        public string Name { get; set; }

        /// <summary>
        /// The description of the restaurant
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// The property ID the restaurant belongs to
        /// </summary>
        [Required]
        public Guid PropertyId { get; set; }

        /// <summary>
        /// The opening time of the restaurant
        /// </summary>
        [Required]
        public TimeSpan OpeningTime { get; set; }

        /// <summary>
        /// The closing time of the restaurant
        /// </summary>
        [Required]
        public TimeSpan ClosingTime { get; set; }

        /// <summary>
        /// The capacity of the restaurant
        /// </summary>
        [Required]
        public int Capacity { get; set; }
    }

    /// <summary>
    /// Request model for creating or updating a table
    /// </summary>
    public class TableRequest
    {
        /// <summary>
        /// The table number or identifier
        /// </summary>
        [Required]
        public string TableNumber { get; set; }

        /// <summary>
        /// The capacity of the table
        /// </summary>
        [Required]
        public int Capacity { get; set; }

        /// <summary>
        /// The location of the table in the restaurant
        /// </summary>
        public string Location { get; set; }

        /// <summary>
        /// The current status of the table
        /// </summary>
        [Required]
        public TableStatus Status { get; set; }
    }

    /// <summary>
    /// Request model for updating table status
    /// </summary>
    public class UpdateTableStatusRequest
    {
        /// <summary>
        /// The new status of the table
        /// </summary>
        [Required]
        public TableStatus Status { get; set; }
    }

    /// <summary>
    /// Request model for creating an order
    /// </summary>
    public class OrderRequest
    {
        /// <summary>
        /// The items in the order
        /// </summary>
        [Required]
        public IEnumerable<OrderItemRequest> Items { get; set; }

        /// <summary>
        /// Special instructions for the order
        /// </summary>
        public string SpecialInstructions { get; set; }

        /// <summary>
        /// The ID of the waiter who took the order
        /// </summary>
        [Required]
        public Guid WaiterId { get; set; }
    }

    /// <summary>
    /// Request model for an order item
    /// </summary>
    public class OrderItemRequest
    {
        /// <summary>
        /// The ID of the menu item
        /// </summary>
        [Required]
        public Guid MenuItemId { get; set; }

        /// <summary>
        /// The quantity of the item ordered
        /// </summary>
        [Required]
        public int Quantity { get; set; }

        /// <summary>
        /// Special instructions for the item
        /// </summary>
        public string SpecialInstructions { get; set; }
    }

    /// <summary>
    /// Request model for updating order item status
    /// </summary>
    public class UpdateOrderItemStatusRequest
    {
        /// <summary>
        /// The new status of the order item
        /// </summary>
        [Required]
        public OrderItemStatus Status { get; set; }

        /// <summary>
        /// Notes about the status update
        /// </summary>
        public string Notes { get; set; }
    }

    /// <summary>
    /// Request model for charging an order to a room
    /// </summary>
    public class RoomChargeRequest
    {
        /// <summary>
        /// The ID of the room to charge
        /// </summary>
        [Required]
        public Guid RoomId { get; set; }

        /// <summary>
        /// The name of the guest
        /// </summary>
        [Required]
        public string GuestName { get; set; }

        /// <summary>
        /// The ID of the staff member who authorized the charge
        /// </summary>
        [Required]
        public Guid AuthorizedBy { get; set; }
    }

    /// <summary>
    /// Request model for processing payment
    /// </summary>
    public class RestaurantPaymentRequest
    {
        /// <summary>
        /// The payment method used
        /// </summary>
        [Required]
        public PaymentMethod PaymentMethod { get; set; }

        /// <summary>
        /// The payment amount
        /// </summary>
        [Required]
        public decimal Amount { get; set; }

        /// <summary>
        /// The tip amount
        /// </summary>
        public decimal Tip { get; set; }

        /// <summary>
        /// The ID of the staff member who processed the payment
        /// </summary>
        [Required]
        public Guid ProcessedBy { get; set; }
    }
}