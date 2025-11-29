using HotelManagement.Services.Admin.Kitchen;
using HotelManagement.Services.Admin.Kitchen.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.Api.Controllers.Admin;

[ApiController]
[Route("api/order-items")]
[Authorize(Roles = "Admin,Manager,Kitchen,Waiter")]
public class OrderItemStatusController : ControllerBase
{
    private readonly IOrderItemStatusService _orderItemStatusService;

    public OrderItemStatusController(IOrderItemStatusService orderItemStatusService)
    {
        _orderItemStatusService = orderItemStatusService;
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateOrderItemStatus(Guid id, [FromBody] UpdateOrderItemStatusRequest request)
    {
        var response = await _orderItemStatusService.UpdateOrderItemStatusAsync(id, request);
        if (!response.IsSuccess)
        {
            return BadRequest(response);
        }
        return Ok(response);
    }

    [HttpGet("pending")]
    public async Task<IActionResult> GetPendingOrderItems(
        [FromQuery] Guid hotelId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var response = await _orderItemStatusService.GetPendingOrderItemsAsync(hotelId, page, pageSize);
        return Ok(response);
    }

    [HttpGet("by-status")]
    public async Task<IActionResult> GetOrderItemsByStatus(
        [FromQuery] Guid hotelId,
        [FromQuery] string status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var response = await _orderItemStatusService.GetOrderItemsByStatusAsync(hotelId, status, page, pageSize);
        if (!response.IsSuccess)
        {
            return BadRequest(response);
        }
        return Ok(response);
    }
}