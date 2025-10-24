using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HotelManagement.Domain.Entities;
using HotelManagement.Domain.Enums;

namespace HotelManagement.Services.Interfaces
{
    /// <summary>
    /// Interface for restaurant service operations
    /// </summary>
    public interface IRestaurantService
    {
        /// <summary>
        /// Gets all restaurants for a property
        /// </summary>
        /// <param name="propertyId">The property ID to filter by</param>
        /// <returns>A list of restaurants for the specified property</returns>
        Task<IEnumerable<Restaurant>> GetRestaurantsByPropertyAsync(Guid propertyId);

        /// <summary>
        /// Gets a restaurant by its ID
        /// </summary>
        /// <param name="id">The ID of the restaurant to retrieve</param>
        /// <returns>The restaurant if found, or null if not found</returns>
        Task<Restaurant> GetRestaurantByIdAsync(Guid id);

        /// <summary>
        /// Creates a new restaurant
        /// </summary>
        /// <param name="name">The name of the restaurant</param>
        /// <param name="description">The description of the restaurant</param>
        /// <param name="propertyId">The property ID the restaurant belongs to</param>
        /// <param name="openingTime">The opening time of the restaurant</param>
        /// <param name="closingTime">The closing time of the restaurant</param>
        /// <param name="capacity">The capacity of the restaurant</param>
        /// <returns>The created restaurant</returns>
        Task<Restaurant> CreateRestaurantAsync(string name, string description, Guid propertyId, TimeSpan openingTime, TimeSpan closingTime, int capacity);

        /// <summary>
        /// Updates an existing restaurant
        /// </summary>
        /// <param name="id">The ID of the restaurant to update</param>
        /// <param name="name">The updated name of the restaurant</param>
        /// <param name="description">The updated description of the restaurant</param>
        /// <param name="openingTime">The updated opening time of the restaurant</param>
        /// <param name="closingTime">The updated closing time of the restaurant</param>
        /// <param name="capacity">The updated capacity of the restaurant</param>
        /// <returns>True if the restaurant was updated, false otherwise</returns>
        Task<bool> UpdateRestaurantAsync(Guid id, string name, string description, TimeSpan openingTime, TimeSpan closingTime, int capacity);

        /// <summary>
        /// Gets all tables for a restaurant (UC-25)
        /// </summary>
        /// <param name="restaurantId">The restaurant ID to filter by</param>
        /// <returns>A list of tables for the specified restaurant</returns>
        Task<IEnumerable<object>> GetRestaurantTablesAsync(Guid restaurantId);

        /// <summary>
        /// Creates a new table for a restaurant (UC-25)
        /// </summary>
        /// <param name="restaurantId">The restaurant ID</param>
        /// <param name="tableNumber">The table number</param>
        /// <param name="capacity">The capacity of the table</param>
        /// <param name="location">The location of the table</param>
        /// <param name="status">The initial status of the table</param>
        /// <returns>The created table</returns>
        Task<object> CreateRestaurantTableAsync(Guid restaurantId, string tableNumber, int capacity, string location, TableStatus status);

        /// <summary>
        /// Gets a table by its ID
        /// </summary>
        /// <param name="restaurantId">The restaurant ID</param>
        /// <param name="tableId">The table ID</param>
        /// <returns>The table if found, or null if not found</returns>
        Task<object> GetRestaurantTableByIdAsync(Guid restaurantId, Guid tableId);

        /// <summary>
        /// Updates the status of a table
        /// </summary>
        /// <param name="restaurantId">The restaurant ID</param>
        /// <param name="tableId">The table ID</param>
        /// <param name="status">The new status of the table</param>
        /// <returns>The updated table</returns>
        Task<object> UpdateTableStatusAsync(Guid restaurantId, Guid tableId, TableStatus status);

        /// <summary>
        /// Creates a new order for a table (UC-26)
        /// </summary>
        /// <param name="restaurantId">The restaurant ID</param>
        /// <param name="tableId">The table ID</param>
        /// <param name="items">The order items</param>
        /// <param name="specialInstructions">Any special instructions for the order</param>
        /// <param name="waiterId">The ID of the waiter who took the order</param>
        /// <returns>The created order</returns>
        Task<Order> CreateOrderAsync(Guid restaurantId, Guid tableId, IEnumerable<OrderItemRequest> items, string specialInstructions, Guid waiterId);

        /// <summary>
        /// Gets an order by its ID
        /// </summary>
        /// <param name="orderId">The order ID</param>
        /// <returns>The order if found, or null if not found</returns>
        Task<Order> GetOrderByIdAsync(Guid orderId);

        /// <summary>
        /// Updates the status of an order item (UC-27)
        /// </summary>
        /// <param name="orderId">The order ID</param>
        /// <param name="itemId">The order item ID</param>
        /// <param name="status">The new status of the order item</param>
        /// <param name="notes">Any notes about the status update</param>
        /// <returns>The updated order</returns>
        Task<Order> UpdateOrderItemStatusAsync(Guid orderId, Guid itemId, OrderItemStatus status, string notes);

        /// <summary>
        /// Gets pending orders for the kitchen (UC-27)
        /// </summary>
        /// <param name="restaurantId">The restaurant ID</param>
        /// <returns>A list of pending orders for the kitchen</returns>
        Task<IEnumerable<Order>> GetPendingKitchenOrdersAsync(Guid restaurantId);

        /// <summary>
        /// Charges an order to a room (UC-28)
        /// </summary>
        /// <param name="orderId">The order ID</param>
        /// <param name="roomId">The room ID</param>
        /// <param name="guestName">The name of the guest</param>
        /// <param name="authorizedBy">The ID of the user who authorized the charge</param>
        /// <returns>The updated order with room charge information</returns>
        Task<Order> ChargeOrderToRoomAsync(Guid orderId, Guid roomId, string guestName, Guid authorizedBy);

        /// <summary>
        /// Processes payment for an order (UC-29)
        /// </summary>
        /// <param name="orderId">The order ID</param>
        /// <param name="paymentMethod">The payment method</param>
        /// <param name="amount">The payment amount</param>
        /// <param name="tip">The tip amount</param>
        /// <param name="processedBy">The ID of the user who processed the payment</param>
        /// <returns>The payment receipt</returns>
        Task<object> ProcessOrderPaymentAsync(Guid orderId, PaymentMethod paymentMethod, decimal amount, decimal tip, Guid processedBy);

        /// <summary>
        /// Gets restaurant sales report
        /// </summary>
        /// <param name="restaurantId">The restaurant ID</param>
        /// <param name="fromDate">From date</param>
        /// <param name="toDate">To date</param>
        /// <returns>Restaurant sales report</returns>
        Task<object> GetRestaurantSalesReportAsync(Guid restaurantId, DateTime fromDate, DateTime toDate);
    }

    /// <summary>
    /// Request model for creating or updating a restaurant
    /// </summary>
    public class RestaurantRequest
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public Guid PropertyId { get; set; }
        public TimeSpan OpeningTime { get; set; }
        public TimeSpan ClosingTime { get; set; }
        public int Capacity { get; set; }
    }

    /// <summary>
    /// Request model for creating or updating a table
    /// </summary>
    public class TableRequest
    {
        public string TableNumber { get; set; }
        public int Capacity { get; set; }
        public string Location { get; set; }
        public TableStatus Status { get; set; }
    }

    /// <summary>
    /// Request model for updating table status
    /// </summary>
    public class UpdateTableStatusRequest
    {
        public TableStatus Status { get; set; }
    }

    /// <summary>
    /// Request model for creating an order
    /// </summary>
    public class OrderRequest
    {
        public IEnumerable<OrderItemRequest> Items { get; set; }
        public string SpecialInstructions { get; set; }
        public Guid WaiterId { get; set; }
    }

    /// <summary>
    /// Request model for an order item
    /// </summary>
    public class OrderItemRequest
    {
        public Guid MenuItemId { get; set; }
        public int Quantity { get; set; }
        public string SpecialInstructions { get; set; }
    }

    /// <summary>
    /// Request model for updating order item status
    /// </summary>
    public class UpdateOrderItemStatusRequest
    {
        public OrderItemStatus Status { get; set; }
        public string Notes { get; set; }
    }

    /// <summary>
    /// Request model for charging an order to a room
    /// </summary>
    public class RoomChargeRequest
    {
        public Guid RoomId { get; set; }
        public string GuestName { get; set; }
        public Guid AuthorizedBy { get; set; }
    }

    /// <summary>
    /// Request model for processing payment
    /// </summary>
    public class PaymentRequest
    {
        public PaymentMethod PaymentMethod { get; set; }
        public decimal Amount { get; set; }
        public decimal Tip { get; set; }
        public Guid ProcessedBy { get; set; }
    }
}