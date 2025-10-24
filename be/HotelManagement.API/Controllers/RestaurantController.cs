using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HotelManagement.Domain.Entities;
using HotelManagement.Services.Interfaces;
using HotelManagement.Domain.Enums;
using HotelManagement.API.Models;

namespace HotelManagement.API.Controllers
{
    /// <summary>
    /// Controller for managing restaurant operations
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class RestaurantController : ControllerBase
    {
        private readonly IRestaurantService _restaurantService;

        public RestaurantController(IRestaurantService restaurantService)
        {
            _restaurantService = restaurantService;
        }

        /// <summary>
        /// Gets all restaurants for a property
        /// </summary>
        /// <param name="propertyId">The property ID to filter by</param>
        /// <returns>A list of restaurants for the specified property</returns>
        [HttpGet("by-property/{propertyId}")]
        public async Task<ActionResult<IEnumerable<Restaurant>>> GetRestaurantsByProperty(Guid propertyId)
        {
            var restaurants = await _restaurantService.GetRestaurantsByPropertyAsync(propertyId);
            return Ok(restaurants);
        }

        /// <summary>
        /// Gets a restaurant by its ID
        /// </summary>
        /// <param name="id">The ID of the restaurant to retrieve</param>
        /// <returns>The restaurant if found, or NotFound if not found</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<Restaurant>> GetRestaurantById(Guid id)
        {
            var restaurant = await _restaurantService.GetRestaurantByIdAsync(id);
            if (restaurant == null)
            {
                return NotFound();
            }

            return Ok(restaurant);
        }

        /// <summary>
        /// Creates a new restaurant
        /// </summary>
        /// <param name="request">The restaurant details</param>
        /// <returns>The created restaurant</returns>
        [HttpPost]
        [Authorize(Roles = "Administrator,PropertyManager")]
        public async Task<ActionResult<Restaurant>> CreateRestaurant([FromBody] dynamic request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var restaurant = await _restaurantService.CreateRestaurantAsync(
                request.Name,
                request.Description,
                request.PropertyId,
                request.OpeningTime,
                request.ClosingTime,
                request.Capacity);

            return CreatedAtAction(nameof(GetRestaurantById), new { id = restaurant.Id }, restaurant);
        }

        /// <summary>
        /// Updates an existing restaurant
        /// </summary>
        /// <param name="id">The ID of the restaurant to update</param>
        /// <param name="request">The updated restaurant details</param>
        /// <returns>No content if successful</returns>
        [HttpPut("{id}")]
        [Authorize(Roles = "Administrator,PropertyManager")]
        public async Task<IActionResult> UpdateRestaurant(Guid id, [FromBody] dynamic request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _restaurantService.UpdateRestaurantAsync(
                id,
                request.Name,
                request.Description,
                request.OpeningTime,
                request.ClosingTime,
                request.Capacity);

            if (!result)
            {
                return NotFound();
            }

            return NoContent();
        }

        /// <summary>
        /// Gets all tables for a restaurant (UC-25)
        /// </summary>
        /// <param name="restaurantId">The restaurant ID to filter by</param>
        /// <returns>A list of tables for the specified restaurant</returns>
        [HttpGet("{restaurantId}/tables")]
        public async Task<ActionResult<IEnumerable<object>>> GetRestaurantTables(Guid restaurantId)
        {
            var tables = await _restaurantService.GetRestaurantTablesAsync(restaurantId);
            return Ok(tables);
        }

        /// <summary>
        /// Creates a new table for a restaurant (UC-25)
        /// </summary>
        /// <param name="restaurantId">The restaurant ID</param>
        /// <param name="request">The table details</param>
        /// <returns>The created table</returns>
        [HttpPost("{restaurantId}/tables")]
        [Authorize(Roles = "Administrator,PropertyManager,Waiter")]
        public async Task<ActionResult<object>> CreateRestaurantTable(Guid restaurantId, [FromBody] dynamic request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var table = await _restaurantService.CreateRestaurantTableAsync(
                restaurantId,
                request.TableNumber,
                request.Capacity,
                request.Location,
                request.Status);

            return CreatedAtAction(nameof(GetRestaurantTableById), new { restaurantId, tableId = table.Id }, table);
        }

        /// <summary>
        /// Gets a table by its ID
        /// </summary>
        /// <param name="restaurantId">The restaurant ID</param>
        /// <param name="tableId">The table ID</param>
        /// <returns>The table if found, or NotFound if not found</returns>
        [HttpGet("{restaurantId}/tables/{tableId}")]
        public async Task<ActionResult<object>> GetRestaurantTableById(Guid restaurantId, Guid tableId)
        {
            var table = await _restaurantService.GetRestaurantTableByIdAsync(restaurantId, tableId);
            if (table == null)
            {
                return NotFound();
            }

            return Ok(table);
        }

        /// <summary>
        /// Updates the status of a table
        /// </summary>
        /// <param name="restaurantId">The restaurant ID</param>
        /// <param name="tableId">The table ID</param>
        /// <param name="request">The status update details</param>
        /// <returns>The updated table</returns>
        [HttpPatch("{restaurantId}/tables/{tableId}/status")]
        [Authorize(Roles = "Administrator,PropertyManager,Waiter")]
        public async Task<ActionResult<object>> UpdateTableStatus(Guid restaurantId, Guid tableId, [FromBody] dynamic request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var table = await _restaurantService.UpdateTableStatusAsync(
                restaurantId,
                tableId,
                request.Status);

            if (table == null)
            {
                return NotFound();
            }

            return Ok(table);
        }

        /// <summary>
        /// Creates a new order for a table (UC-26)
        /// </summary>
        /// <param name="restaurantId">The restaurant ID</param>
        /// <param name="tableId">The table ID</param>
        /// <param name="request">The order details</param>
        /// <returns>The created order</returns>
        [HttpPost("{restaurantId}/tables/{tableId}/orders")]
        [Authorize(Roles = "Administrator,PropertyManager,Waiter")]
        public async Task<ActionResult<Order>> CreateOrder(Guid restaurantId, Guid tableId, [FromBody] dynamic request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var order = await _restaurantService.CreateOrderAsync(
                restaurantId,
                tableId,
                request.Items,
                request.SpecialInstructions,
                request.WaiterId);

            return CreatedAtAction(nameof(GetOrderById), new { orderId = order.Id }, order);
        }

        /// <summary>
        /// Gets an order by its ID
        /// </summary>
        /// <param name="orderId">The order ID</param>
        /// <returns>The order if found, or NotFound if not found</returns>
        [HttpGet("orders/{orderId}")]
        public async Task<ActionResult<Order>> GetOrderById(Guid orderId)
        {
            var order = await _restaurantService.GetOrderByIdAsync(orderId);
            if (order == null)
            {
                return NotFound();
            }

            return Ok(order);
        }

        /// <summary>
        /// Updates the status of an order item (UC-27)
        /// </summary>
        /// <param name="orderId">The order ID</param>
        /// <param name="itemId">The order item ID</param>
        /// <param name="request">The status update details</param>
        /// <returns>The updated order</returns>
        [HttpPatch("orders/{orderId}/items/{itemId}/status")]
        [Authorize(Roles = "Administrator,PropertyManager,Waiter,Chef")]
        public async Task<ActionResult<Order>> UpdateOrderItemStatus(Guid orderId, Guid itemId, [FromBody] dynamic request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var order = await _restaurantService.UpdateOrderItemStatusAsync(
                orderId,
                itemId,
                request.Status,
                request.Notes);

            if (order == null)
            {
                return NotFound();
            }

            return Ok(order);
        }

        /// <summary>
        /// Gets pending orders for the kitchen (UC-27)
        /// </summary>
        /// <param name="restaurantId">The restaurant ID</param>
        /// <returns>A list of pending orders for the kitchen</returns>
        [HttpGet("{restaurantId}/kitchen/pending-orders")]
        [Authorize(Roles = "Administrator,PropertyManager,Waiter,Chef")]
        public async Task<ActionResult<IEnumerable<Order>>> GetPendingKitchenOrders(Guid restaurantId)
        {
            var orders = await _restaurantService.GetPendingKitchenOrdersAsync(restaurantId);
            return Ok(orders);
        }

        /// <summary>
        /// Charges an order to a room (UC-28)
        /// </summary>
        /// <param name="orderId">The order ID</param>
        /// <param name="request">The room charge details</param>
        /// <returns>The updated order with room charge information</returns>
        [HttpPost("orders/{orderId}/charge-to-room")]
        [Authorize(Roles = "Administrator,PropertyManager,Waiter,Receptionist")]
        public async Task<ActionResult<Order>> ChargeOrderToRoom(Guid orderId, [FromBody] dynamic request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var order = await _restaurantService.ChargeOrderToRoomAsync(
                orderId,
                request.RoomId,
                request.GuestName,
                request.AuthorizedBy);

            if (order == null)
            {
                return NotFound();
            }

            return Ok(order);
        }

        /// <summary>
        /// Processes payment for an order (UC-29)
        /// </summary>
        /// <param name="orderId">The order ID</param>
        /// <param name="request">The payment details</param>
        /// <returns>The payment receipt</returns>
        [HttpPost("orders/{orderId}/payment")]
        [Authorize(Roles = "Administrator,PropertyManager,Waiter,Cashier")]
        public async Task<ActionResult<object>> ProcessOrderPayment(Guid orderId, [FromBody] RestaurantPaymentRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var payment = await _restaurantService.ProcessOrderPaymentAsync(
                orderId,
                request.PaymentMethod,
                request.Amount,
                request.Tip,
                request.ProcessedBy);

            return Ok(payment);
        }

        /// <summary>
        /// Gets restaurant sales report
        /// </summary>
        /// <param name="restaurantId">The restaurant ID</param>
        /// <param name="fromDate">From date</param>
        /// <param name="toDate">To date</param>
        /// <returns>Restaurant sales report</returns>
        [HttpGet("{restaurantId}/reports/sales")]
        [Authorize(Roles = "Administrator,PropertyManager")]
        public async Task<ActionResult<object>> GetRestaurantSalesReport(
            Guid restaurantId,
            [FromQuery] DateTime fromDate,
            [FromQuery] DateTime toDate)
        {
            var report = await _restaurantService.GetRestaurantSalesReportAsync(restaurantId, fromDate, toDate);
            return Ok(report);
        }
    }
}