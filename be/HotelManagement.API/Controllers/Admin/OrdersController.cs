using HotelManagement.Services.Admin.Orders;
using HotelManagement.Services.Admin.Orders.Dtos;
using HotelManagement.Services.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/orders")]
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

}