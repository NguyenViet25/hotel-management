using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HotelManagement.API.Models;
using HotelManagement.Services.Interfaces;

namespace HotelManagement.API.Controllers
{
    /// <summary>
    /// Controller for managing hotel inventory
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class InventoryController : ControllerBase
    {
        private readonly IInventoryService _inventoryService;

        public InventoryController(IInventoryService inventoryService)
        {
            _inventoryService = inventoryService;
        }

        /// <summary>
        /// Gets all inventory items for a property
        /// </summary>
        /// <param name="propertyId">The property ID</param>
        /// <returns>A list of inventory items</returns>
        [HttpGet("by-property/{propertyId}")]
        public async Task<ActionResult<object>> GetInventoryByProperty(Guid propertyId)
        {
            var inventory = await _inventoryService.GetInventoryByPropertyAsync(propertyId);
            return Ok(inventory);
        }

        /// <summary>
        /// Gets an inventory item by ID
        /// </summary>
        /// <param name="id">The inventory item ID</param>
        /// <returns>The inventory item if found, or NotFound if not found</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetInventoryItemById(Guid id)
        {
            var item = await _inventoryService.GetInventoryItemByIdAsync(id);
            if (item == null)
            {
                return NotFound();
            }

            return Ok(item);
        }

        /// <summary>
        /// Creates a new inventory item
        /// </summary>
        /// <param name="request">The inventory item details</param>
        /// <returns>The created inventory item</returns>
        [HttpPost]
        [Authorize(Roles = "Administrator,PropertyManager,InventoryManager")]
        public async Task<ActionResult<object>> CreateInventoryItem([FromBody] dynamic request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var item = await _inventoryService.CreateInventoryItemAsync(
                request.PropertyId,
                request.Name,
                request.Description,
                request.Category,
                request.Quantity,
                request.UnitOfMeasure,
                request.ReorderLevel,
                request.UnitCost,
                request.Location,
                request.Supplier,
                request.Notes);

            return CreatedAtAction(nameof(GetInventoryItemById), new { id = item.Id }, item);
        }

        /// <summary>
        /// Updates an existing inventory item
        /// </summary>
        /// <param name="id">The inventory item ID</param>
        /// <param name="request">The updated inventory item details</param>
        /// <returns>The updated inventory item</returns>
        [HttpPut("{id}")]
        [Authorize(Roles = "Administrator,PropertyManager,InventoryManager")]
        public async Task<ActionResult<object>> UpdateInventoryItem(Guid id, [FromBody] InventoryItemRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var item = await _inventoryService.UpdateInventoryItemAsync(
                id,
                request.PropertyId,
                request.Name,
                request.Description,
                request.Category,
                request.Quantity,
                request.UnitOfMeasure,
                request.ReorderLevel,
                request.UnitCost,
                request.Location,
                request.Supplier,
                request.Notes);

            if (item == null)
            {
                return NotFound();
            }

            return Ok(item);
        }

        /// <summary>
        /// Updates inventory quantity
        /// </summary>
        /// <param name="id">The inventory item ID</param>
        /// <param name="request">The quantity update details</param>
        /// <returns>The updated inventory item</returns>
        [HttpPatch("{id}/quantity")]
        [Authorize(Roles = "Administrator,PropertyManager,InventoryManager,Housekeeper")]
        public async Task<ActionResult<object>> UpdateInventoryQuantity(Guid id, [FromBody] QuantityUpdateRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var item = await _inventoryService.UpdateInventoryQuantityAsync(
                id,
                request.QuantityChange,
                request.Reason,
                request.TransactionType,
                request.UserId);

            if (item == null)
            {
                return NotFound();
            }

            return Ok(item);
        }

        /// <summary>
        /// Gets inventory items that need to be reordered
        /// </summary>
        /// <param name="propertyId">The property ID</param>
        /// <returns>A list of inventory items that need to be reordered</returns>
        [HttpGet("reorder-needed/{propertyId}")]
        [Authorize(Roles = "Administrator,PropertyManager,InventoryManager")]
        public async Task<ActionResult<object>> GetItemsNeedingReorder(Guid propertyId)
        {
            var items = await _inventoryService.GetItemsNeedingReorderAsync(propertyId);
            return Ok(items);
        }

        /// <summary>
        /// Gets inventory transaction history for an item
        /// </summary>
        /// <param name="itemId">The inventory item ID</param>
        /// <param name="fromDate">Optional start date for filtering</param>
        /// <param name="toDate">Optional end date for filtering</param>
        /// <returns>A list of inventory transactions</returns>
        [HttpGet("{itemId}/transactions")]
        [Authorize(Roles = "Administrator,PropertyManager,InventoryManager")]
        public async Task<ActionResult<object>> GetInventoryTransactions(
            Guid itemId,
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null)
        {
            var transactions = await _inventoryService.GetInventoryTransactionsAsync(itemId, fromDate, toDate);
            return Ok(transactions);
        }

        /// <summary>
        /// Creates a purchase order for inventory items
        /// </summary>
        /// <param name="request">The purchase order details</param>
        /// <returns>The created purchase order</returns>
        [HttpPost("purchase-orders")]
        [Authorize(Roles = "Administrator,PropertyManager,InventoryManager")]
        public async Task<ActionResult<object>> CreatePurchaseOrder([FromBody] dynamic request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var purchaseOrder = await _inventoryService.CreatePurchaseOrderAsync(
                request.PropertyId,
                request.SupplierId,
                request.Items,
                request.ExpectedDeliveryDate,
                request.Notes,
                request.CreatedById);

            return Ok(purchaseOrder);
        }

        /// <summary>
        /// Updates the status of a purchase order
        /// </summary>
        /// <param name="id">The purchase order ID</param>
        /// <param name="request">The status update details</param>
        /// <returns>The updated purchase order</returns>
        [HttpPatch("purchase-orders/{id}/status")]
        [Authorize(Roles = "Administrator,PropertyManager,InventoryManager")]
        public async Task<ActionResult<object>> UpdatePurchaseOrderStatus(Guid id, [FromBody] StatusUpdateRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var purchaseOrder = await _inventoryService.UpdatePurchaseOrderStatusAsync(
                id,
                request.Status,
                request.Notes,
                request.UpdatedById);

            if (purchaseOrder == null)
            {
                return NotFound();
            }

            return Ok(purchaseOrder);
        }

        /// <summary>
        /// Gets inventory usage report
        /// </summary>
        /// <param name="propertyId">The property ID</param>
        /// <param name="fromDate">Start date for the report</param>
        /// <param name="toDate">End date for the report</param>
        /// <param name="category">Optional category filter</param>
        /// <returns>Inventory usage report data</returns>
        [HttpGet("reports/usage")]
        [Authorize(Roles = "Administrator,PropertyManager,InventoryManager")]
        public async Task<ActionResult<object>> GetInventoryUsageReport(
            [FromQuery] Guid propertyId,
            [FromQuery] DateTime fromDate,
            [FromQuery] DateTime toDate,
            [FromQuery] string category = null)
        {
            var report = await _inventoryService.GetInventoryUsageReportAsync(
                propertyId,
                fromDate,
                toDate,
                category);

            return Ok(report);
        }
    }


}