using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HotelManagement.Services.Interfaces
{
    /// <summary>
    /// Interface for inventory service operations
    /// </summary>
    public interface IInventoryService
    {
        /// <summary>
        /// Gets all inventory items for a property
        /// </summary>
        /// <param name="propertyId">The property ID</param>
        /// <returns>A list of inventory items</returns>
        Task<IEnumerable<object>> GetInventoryByPropertyAsync(Guid propertyId);

        /// <summary>
        /// Gets an inventory item by ID
        /// </summary>
        /// <param name="id">The inventory item ID</param>
        /// <returns>The inventory item if found, or null if not found</returns>
        Task<object> GetInventoryItemByIdAsync(Guid id);

        /// <summary>
        /// Creates a new inventory item
        /// </summary>
        /// <param name="propertyId">The property ID</param>
        /// <param name="name">The item name</param>
        /// <param name="description">The item description</param>
        /// <param name="category">The item category</param>
        /// <param name="quantity">The initial quantity</param>
        /// <param name="unitOfMeasure">The unit of measure</param>
        /// <param name="reorderLevel">The reorder level</param>
        /// <param name="unitCost">The unit cost</param>
        /// <param name="location">The storage location</param>
        /// <param name="supplier">The supplier information</param>
        /// <param name="notes">Additional notes</param>
        /// <returns>The created inventory item</returns>
        Task<object> CreateInventoryItemAsync(
            Guid propertyId,
            string name,
            string description,
            string category,
            decimal quantity,
            string unitOfMeasure,
            decimal reorderLevel,
            decimal unitCost,
            string location,
            string supplier,
            string notes);

        /// <summary>
        /// Updates an existing inventory item
        /// </summary>
        /// <param name="id">The inventory item ID</param>
        /// <param name="propertyId">The property ID</param>
        /// <param name="name">The item name</param>
        /// <param name="description">The item description</param>
        /// <param name="category">The item category</param>
        /// <param name="quantity">The quantity</param>
        /// <param name="unitOfMeasure">The unit of measure</param>
        /// <param name="reorderLevel">The reorder level</param>
        /// <param name="unitCost">The unit cost</param>
        /// <param name="location">The storage location</param>
        /// <param name="supplier">The supplier information</param>
        /// <param name="notes">Additional notes</param>
        /// <returns>The updated inventory item, or null if not found</returns>
        Task<object> UpdateInventoryItemAsync(
            Guid id,
            Guid propertyId,
            string name,
            string description,
            string category,
            decimal quantity,
            string unitOfMeasure,
            decimal reorderLevel,
            decimal unitCost,
            string location,
            string supplier,
            string notes);

        /// <summary>
        /// Updates inventory quantity
        /// </summary>
        /// <param name="id">The inventory item ID</param>
        /// <param name="quantityChange">The quantity change (positive for increase, negative for decrease)</param>
        /// <param name="reason">The reason for the quantity change</param>
        /// <param name="transactionType">The transaction type (Consumption, Restock, Adjustment, etc.)</param>
        /// <param name="userId">The ID of the user making the change</param>
        /// <returns>The updated inventory item, or null if not found</returns>
        Task<object> UpdateInventoryQuantityAsync(
            Guid id,
            decimal quantityChange,
            string reason,
            string transactionType,
            Guid userId);

        /// <summary>
        /// Gets inventory items that need to be reordered
        /// </summary>
        /// <param name="propertyId">The property ID</param>
        /// <returns>A list of inventory items that need to be reordered</returns>
        Task<IEnumerable<object>> GetItemsNeedingReorderAsync(Guid propertyId);

        /// <summary>
        /// Gets inventory transaction history for an item
        /// </summary>
        /// <param name="itemId">The inventory item ID</param>
        /// <param name="fromDate">Optional start date for filtering</param>
        /// <param name="toDate">Optional end date for filtering</param>
        /// <returns>A list of inventory transactions</returns>
        Task<IEnumerable<object>> GetInventoryTransactionsAsync(
            Guid itemId,
            DateTime? fromDate = null,
            DateTime? toDate = null);

        /// <summary>
        /// Creates a purchase order for inventory items
        /// </summary>
        /// <param name="propertyId">The property ID</param>
        /// <param name="supplierId">The supplier ID</param>
        /// <param name="items">The list of items to order</param>
        /// <param name="expectedDeliveryDate">The expected delivery date</param>
        /// <param name="notes">Additional notes</param>
        /// <param name="createdById">The ID of the user creating the purchase order</param>
        /// <returns>The created purchase order</returns>
        Task<object> CreatePurchaseOrderAsync(
            Guid propertyId,
            Guid supplierId,
            List<PurchaseOrderItem> items,
            DateTime expectedDeliveryDate,
            string notes,
            Guid createdById);

        /// <summary>
        /// Updates the status of a purchase order
        /// </summary>
        /// <param name="id">The purchase order ID</param>
        /// <param name="status">The new status</param>
        /// <param name="notes">Additional notes</param>
        /// <param name="updatedById">The ID of the user updating the status</param>
        /// <returns>The updated purchase order, or null if not found</returns>
        Task<object> UpdatePurchaseOrderStatusAsync(
            Guid id,
            string status,
            string notes,
            Guid updatedById);

        /// <summary>
        /// Gets inventory usage report
        /// </summary>
        /// <param name="propertyId">The property ID</param>
        /// <param name="fromDate">Start date for the report</param>
        /// <param name="toDate">End date for the report</param>
        /// <param name="category">Optional category filter</param>
        /// <returns>Inventory usage report data</returns>
        Task<object> GetInventoryUsageReportAsync(
            Guid propertyId,
            DateTime fromDate,
            DateTime toDate,
            string category = null);
    }

    /// <summary>
    /// Model for a purchase order item
    /// </summary>
    public class PurchaseOrderItem
    {
        public Guid InventoryItemId { get; set; }
        public decimal Quantity { get; set; }
        public decimal UnitPrice { get; set; }
    }
}