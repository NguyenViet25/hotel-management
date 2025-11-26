using HotelManagement.Services.Admin.Dining;
using HotelManagement.Services.Admin.Dining.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.Api.Controllers.Admin;

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
}