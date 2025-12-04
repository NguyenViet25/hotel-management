using HotelManagement.Services.Admin.Orders;
using HotelManagement.Services.Admin.Orders.Dtos;
using HotelManagement.Services.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.Api.Controllers;

[ApiController]
[Route("api/orders")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly IOrdersService _ordersService;

    public OrdersController(IOrdersService ordersService)
    {
        _ordersService = ordersService;
    }

    // UC-30: List orders being served and paid (filter by status)
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<OrderSummaryDto>>>> List([FromQuery] OrdersQueryDto query)
    {
        var result = await _ordersService.ListAsync(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<OrderDetailsDto>>> Get(Guid id)
    {
        var result = await _ordersService.GetByIdAsync(id);
        if (!result.IsSuccess) return NotFound(result);
        return Ok(result);
    }

    // UC-28: Create walk-in order
    [HttpPost("walk-in")]
    public async Task<ActionResult<ApiResponse<OrderDetailsDto>>> CreateWalkIn([FromBody] CreateWalkInOrderDto dto)
    {
        var result = await _ordersService.CreateWalkInAsync(dto);
        if (!result.IsSuccess) return BadRequest(result);
        return Ok(result);
    }

    [HttpPut("walk-in/{id}")]
    public async Task<ActionResult<ApiResponse<OrderDetailsDto>>> UpdateWalkIn(Guid id, [FromBody] UpdateWalkInOrderDto dto)
    {
        var result = await _ordersService.UpdateWalkInAsync(id, dto);
        if (!result.IsSuccess) return BadRequest(result);
        return Ok(result);
    }

    // UC-29: Create order for existing booking
    [HttpPost("booking")]
    public async Task<ActionResult<ApiResponse<OrderDetailsDto>>> CreateForBooking([FromBody] CreateBookingOrderDto dto)
    {
        var result = await _ordersService.CreateForBookingAsync(dto);
        if (!result.IsSuccess) return BadRequest(result);
        return Ok(result);
    }

    // Update order notes/status
    [HttpPut("booking/{id}")]
    public async Task<ActionResult<ApiResponse<OrderDetailsDto>>> Update(Guid id, [FromBody] UpdateOrderForBookingDto dto)
    {
        var result = await _ordersService.UpdateForBookingAsync(id, dto);
        if (!result.IsSuccess) return BadRequest(result);
        return Ok(result);
    }

    [HttpPost("{orderId}/items")]
    public async Task<ActionResult<ApiResponse<OrderDetailsDto>>> AddItem(Guid orderId, [FromBody] AddOrderItemDto dto)
    {
        var result = await _ordersService.AddItemAsync(orderId, dto);
        if (!result.IsSuccess) return BadRequest(result);
        return Ok(result);
    }

    [HttpPut("{orderId}/items/{itemId}")]
    public async Task<ActionResult<ApiResponse<OrderDetailsDto>>> UpdateItem(Guid orderId, Guid itemId, [FromBody] UpdateOrderItemDto dto)
    {
        var result = await _ordersService.UpdateItemAsync(orderId, itemId, dto);
        if (!result.IsSuccess) return BadRequest(result);
        return Ok(result);
    }

    [HttpDelete("{orderId}/items/{itemId}")]
    public async Task<ActionResult<ApiResponse<OrderDetailsDto>>> RemoveItem(Guid orderId, Guid itemId)
    {
        var result = await _ordersService.RemoveItemAsync(orderId, itemId);
        if (!result.IsSuccess) return BadRequest(result);
        return Ok(result);
    }

    [HttpPost("{orderId}/items/{itemId}/replace")]
    public async Task<ActionResult<ApiResponse<OrderDetailsDto>>> ReplaceItem(Guid orderId, Guid itemId, [FromBody] ReplaceOrderItemDto dto)
    {
        Guid? userId = null;
        var uid = User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (Guid.TryParse(uid, out var parsed)) userId = parsed;
        var result = await _ordersService.ReplaceItemAsync(orderId, itemId, dto, userId);
        if (!result.IsSuccess) return BadRequest(result);
        return Ok(result);
    }

    [HttpPut("{id}/status")]
    public async Task<ActionResult<ApiResponse<OrderDetailsDto>>> UpdateStatus(Guid id, [FromBody] UpdateOrderStatusDto dto)
    {
        var result = await _ordersService.UpdateStatusAsync(id, dto);
        if (!result.IsSuccess) return BadRequest(result);
        return Ok(result);
    }
}
