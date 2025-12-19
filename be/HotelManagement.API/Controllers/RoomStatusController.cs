using HotelManagement.Domain;
using HotelManagement.Services.Admin.Housekeeping;
using HotelManagement.Services.Admin.Housekeeping.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.Api.Controllers;

[ApiController]
[Route("api/room-status")]
//[Authorize]

public class RoomStatusController : ControllerBase
{
    private readonly IRoomStatusService _roomStatusService;

    public RoomStatusController(IRoomStatusService roomStatusService)
    {
        _roomStatusService = roomStatusService;
    }

    [HttpPut("update")]
    public async Task<IActionResult> UpdateRoomStatus([FromBody] UpdateRoomStatusRequest request)
    {
        var response = await _roomStatusService.UpdateRoomStatusAsync(request);
        return response.IsSuccess ? Ok(response) : BadRequest(response);
    }

    [HttpGet("history/{roomId}")]
    public async Task<IActionResult> GetRoomStatusHistory(Guid roomId, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var response = await _roomStatusService.GetRoomStatusHistoryAsync(roomId, page, pageSize);
        return response.IsSuccess ? Ok(response) : NotFound(response);
    }

    [HttpGet("hotel/{hotelId}")]
    public async Task<IActionResult> GetRoomsByStatus(Guid hotelId, [FromQuery] RoomStatus? status = null)
    {
        var response = await _roomStatusService.GetRoomsByStatusAsync(hotelId, status);
        return Ok(response);
    }

    [HttpGet("summary/{hotelId}")]
    public async Task<IActionResult> GetRoomStatusSummary(Guid hotelId)
    {
        var response = await _roomStatusService.GetRoomStatusSummaryAsync(hotelId);
        return Ok(response);
    }
}