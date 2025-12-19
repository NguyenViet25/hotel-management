using HotelManagement.Services.Admin.Dining;
using HotelManagement.Services.Admin.Dining.Dtos;
using HotelManagement.Services.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.Api.Controllers;

[ApiController]
[Route("api/dining-sessions")]
[Authorize]
public class DiningSessionController : ControllerBase
{
    private readonly IDiningSessionService _diningSessionService;

    public DiningSessionController(IDiningSessionService diningSessionService)
    {
        _diningSessionService = diningSessionService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateSession([FromBody] CreateDiningSessionRequest request)
    {
        var response = await _diningSessionService.CreateSessionAsync(request);
        if (!response.IsSuccess)
        {
            return BadRequest(response);
        }
        return Ok(response);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetSession(Guid id)
    {
        var response = await _diningSessionService.GetSessionAsync(id);
        if (!response.IsSuccess)
        {
            return NotFound(response);
        }
        return Ok(response);
    }

    [HttpGet]
    public async Task<IActionResult> GetSessions(
        [FromQuery] Guid hotelId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? status = null)
    {
        var response = await _diningSessionService.GetSessionsAsync(hotelId, page, pageSize, status);
        return Ok(response);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateSession(Guid id, [FromBody] UpdateDiningSessionRequest request)
    {
        var response = await _diningSessionService.UpdateSessionAsync(id, request);
        if (!response.IsSuccess)
        {
            return NotFound(response);
        }
        return Ok(response);
    }

    [HttpPost("{id}/end")]
    public async Task<IActionResult> EndSession(Guid id)
    {
        var response = await _diningSessionService.EndSessionAsync(id);
        if (!response.IsSuccess)
        {
            return NotFound(response);
        }
        return Ok(response);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSession(Guid id)
    {
        var response = await _diningSessionService.DeleteSessionAsync(id);
        if (!response.IsSuccess)
        {
            return NotFound(response);
        }
        return Ok(response);
    }

    [HttpPost("{id}/tables/{tableId}")]
    public async Task<IActionResult> AttachTable(Guid id, Guid tableId)
    {
        var response = await _diningSessionService.AttachTableAsync(id, tableId);
        if (!response.IsSuccess)
        {
            return BadRequest(response);
        }
        return Ok(response);
    }

    [HttpDelete("{id}/tables/{tableId}")]
    public async Task<IActionResult> DetachTable(Guid id, Guid tableId)
    {
        var response = await _diningSessionService.DetachTableAsync(id, tableId);
        if (!response.IsSuccess)
        {
            return NotFound(response);
        }
        return Ok(response);
    }

    [HttpPut("{id}/tables")]
    public async Task<IActionResult> UpdateSessionTables(Guid id, [FromBody] UpdateSessionTablesRequest request)
    {
        var response = await _diningSessionService.UpdateSessionTablesAsync(id, request);
        if (!response.IsSuccess)
        {
            return BadRequest(response);
        }
        return Ok(response);
    }

    [HttpPost("{id}/orders/{orderId}")]
    public async Task<IActionResult> AssignOrder(Guid id, Guid orderId)
    {
        var response = await _diningSessionService.AssignOrderAsync(id, orderId);

        return Ok(response);
    }

    [HttpGet("order/by-session/{id}")]
    public async Task<IActionResult> GetOrderBySession(Guid id)
    {
        var response = await _diningSessionService.GetOrderOfSessionAsync(id);
        return Ok(response);
    }


    [HttpGet("order/by-table/{id}")]
    public async Task<IActionResult> GetOrderByTable(Guid id)
    {
        var response = await _diningSessionService.GetOrderOfTableAsync(id);
        return Ok(response);
    }

    [HttpGet("{id}/tables")]
    public async Task<IActionResult> GetTablesBySession(Guid id)
    {
        var response = await _diningSessionService.GetTablesBySessionAsync(id);
        return Ok(response);
    }


    [HttpPost]
    public async Task<IActionResult> AssignWaiterAsync(AssignWaiterRequest request)
    {
        var response = await _diningSessionService.AssignWaiterAsync(request);
        var success = ApiResponse<string>.Ok(response.Item2);
        var failed = ApiResponse<string>.Fail(response.Item2);
        return Ok(response.Item1 ? success : failed);
    }
}


