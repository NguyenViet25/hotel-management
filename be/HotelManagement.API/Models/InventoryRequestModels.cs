using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace HotelManagement.API.Models
{
    /// <summary>
    /// Request model for creating or updating an inventory item
    /// </summary>
    public class InventoryItemRequest
    {
        /// <summary>
        /// The ID of the property this inventory item belongs to
        /// </summary>
        [Required]
        public Guid PropertyId { get; set; }

        /// <summary>
        /// The name of the inventory item
        /// </summary>
        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        /// <summary>
        /// The description of the inventory item
        /// </summary>
        [StringLength(500)]
        public string Description { get; set; }

        /// <summary>
        /// The category of the inventory item
        /// </summary>
        [Required]
        [StringLength(50)]
        public string Category { get; set; }

        /// <summary>
        /// The quantity of the inventory item
        /// </summary>
        [Required]
        [Range(0, 9999999.99)]
        public decimal Quantity { get; set; }

        /// <summary>
        /// The unit of measure for the inventory item
        /// </summary>
        [Required]
        [StringLength(20)]
        public string UnitOfMeasure { get; set; }

        /// <summary>
        /// The reorder level for the inventory item
        /// </summary>
        [Required]
        [Range(0, 9999999.99)]
        public decimal ReorderLevel { get; set; }

        /// <summary>
        /// The unit cost of the inventory item
        /// </summary>
        [Required]
        [Range(0, 9999999.99)]
        public decimal UnitCost { get; set; }

        /// <summary>
        /// The location of the inventory item within the property
        /// </summary>
        [StringLength(100)]
        public string Location { get; set; }

        /// <summary>
        /// The supplier of the inventory item
        /// </summary>
        [StringLength(100)]
        public string Supplier { get; set; }

        /// <summary>
        /// Additional notes about the inventory item
        /// </summary>
        [StringLength(500)]
        public string Notes { get; set; }
    }

    /// <summary>
    /// Request model for updating inventory quantity
    /// </summary>
    public class QuantityUpdateRequest
    {
        /// <summary>
        /// The change in quantity (positive for increase, negative for decrease)
        /// </summary>
        [Required]
        public decimal QuantityChange { get; set; }

        /// <summary>
        /// The reason for the quantity change
        /// </summary>
        [Required]
        [StringLength(200)]
        public string Reason { get; set; }

        /// <summary>
        /// The type of transaction (Consumption, Restock, Adjustment, etc.)
        /// </summary>
        [Required]
        [StringLength(50)]
        public string TransactionType { get; set; }

        /// <summary>
        /// The ID of the user making the change
        /// </summary>
        [Required]
        public Guid UserId { get; set; }
    }

    /// <summary>
    /// Request model for creating a purchase order
    /// </summary>
    public class PurchaseOrderRequest
    {
        /// <summary>
        /// The ID of the property this purchase order is for
        /// </summary>
        [Required]
        public Guid PropertyId { get; set; }

        /// <summary>
        /// The ID of the supplier for this purchase order
        /// </summary>
        [Required]
        public Guid SupplierId { get; set; }

        /// <summary>
        /// The items included in this purchase order
        /// </summary>
        [Required]
        public List<PurchaseOrderItem> Items { get; set; }

        /// <summary>
        /// The expected delivery date for this purchase order
        /// </summary>
        [Required]
        public DateTime ExpectedDeliveryDate { get; set; }

        /// <summary>
        /// Additional notes about this purchase order
        /// </summary>
        [StringLength(500)]
        public string Notes { get; set; }

        /// <summary>
        /// The ID of the user who created this purchase order
        /// </summary>
        [Required]
        public Guid CreatedById { get; set; }
    }

    /// <summary>
    /// Model for a purchase order item
    /// </summary>
    public class PurchaseOrderItem
    {
        /// <summary>
        /// The ID of the inventory item being ordered
        /// </summary>
        [Required]
        public Guid InventoryItemId { get; set; }

        /// <summary>
        /// The quantity being ordered
        /// </summary>
        [Required]
        [Range(0.01, 9999999.99)]
        public decimal Quantity { get; set; }

        /// <summary>
        /// The unit price for this item
        /// </summary>
        [Required]
        [Range(0, 9999999.99)]
        public decimal UnitPrice { get; set; }
    }

    /// <summary>
    /// Request model for updating purchase order status
    /// </summary>
    public class StatusUpdateRequest
    {
        /// <summary>
        /// The new status (Draft, Submitted, Approved, Received, Cancelled)
        /// </summary>
        [Required]
        [StringLength(20)]
        public string Status { get; set; }

        /// <summary>
        /// Additional notes about the status update
        /// </summary>
        [StringLength(500)]
        public string Notes { get; set; }

        /// <summary>
        /// The ID of the user who updated the status
        /// </summary>
        [Required]
        public Guid UpdatedById { get; set; }
    }
}