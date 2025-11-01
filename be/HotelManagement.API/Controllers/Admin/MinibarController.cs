using HotelManagement.Services.Admin.Room;
using HotelManagement.Services.Admin.Room.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/minibar")]
[Authorize(Roles = "Admin,Manager,Staff")]
public class MinibarController : ControllerBase
{
    private readonly IMinibarService _minibarService;

    public MinibarController(IMinibarService minibarService)
    {
        _minibarService = minibarService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateMinibarItem([FromBody] CreateMinibarItemRequest request)
    {
        var response = await _minibarService.CreateMinibarItemAsync(request);
        return response.Success ? Ok(response) : BadRequest(response);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateMinibarItem(Guid id, [FromBody] UpdateMinibarItemRequest request)
    {
        var response = await _minibarService.UpdateMinibarItemAsync(id, request);
        return response.Success ? Ok(response) : BadRequest(response);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetMinibarItem(Guid id)
    {
        var response = await _minibarService.GetMinibarItemAsync(id);
        return response.Success ? Ok(response) : NotFound(response);
    }

    [HttpGet("room/{roomId}")]
    public async Task<IActionResult> GetMinibarItemsByRoom(Guid roomId)
    {
        var response = await _minibarService.GetMinibarItemsByRoomAsync(roomId);
        return response.Success ? Ok(response) : NotFound(response);
    }

    [HttpPost("consumption")]
    public async Task<IActionResult> RecordConsumption([FromBody] RecordConsumptionRequest request)
    {
        var response = await _minibarService.RecordConsumptionAsync(request);
        return response.Success ? Ok(response) : BadRequest(response);
    }

    [HttpPost("restock")]
    public async Task<IActionResult> RestockMinibar([FromBody] RestockMinibarRequest request)
    {
        var response = await _minibarService.RestockMinibarAsync(request);
        return response.Success ? Ok(response) : BadRequest(response);
    }
}