using HotelManagement.Services.Admin.Rooms;
using HotelManagement.Services.Admin.Rooms.Dtos;
using HotelManagement.Services.Admin.Bookings;
using HotelManagement.Services.Admin.Bookings.Dtos;
using HotelManagement.Services.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/rooms")]
[Authorize]
public class RoomsController : ControllerBase
{
    private readonly RoomsService _roomsService;
    private readonly IBookingService _bookingService;

    public RoomsController(RoomsService roomsService, IBookingService bookingService)
    {
        _roomsService = roomsService;
        _bookingService = bookingService;
    }

    // UC-23: List rooms by status, floor, type
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<RoomSummaryDto>>>> List([FromQuery] RoomsQueryDto query)
    {
        var result = await _roomsService.ListAsync(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<RoomSummaryDto>>> Get(Guid id)
    {
        var result = await _roomsService.GetByIdAsync(id);
        if (!result.IsSuccess) return NotFound(result);
        return Ok(result);
    }

    // UC-24: Create room with assigned type, floor, number
    [HttpPost]
    public async Task<ActionResult<ApiResponse<RoomSummaryDto>>> Create([FromBody] CreateRoomDto dto)
    {
        var result = await _roomsService.CreateAsync(dto);
        if (!result.IsSuccess) return BadRequest(result);
        return Ok(result);
    }

    // UC-25: Edit room information and operational status
    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<RoomSummaryDto>>> Update(Guid id, [FromBody] UpdateRoomDto dto)
    {
        var result = await _roomsService.UpdateAsync(id, dto);
        if (!result.IsSuccess) return BadRequest(result);
        return Ok(result);
    }

    // UC-26: Delete room without booking history
    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse>> Delete(Guid id)
    {
        var result = await _roomsService.DeleteAsync(id);
        if (!result.IsSuccess) return BadRequest(result);
        return Ok(result);
    }

    // UC-27: Mark room temporarily out of service
    [HttpPost("{id}/out-of-service")]
    public async Task<ActionResult<ApiResponse<RoomSummaryDto>>> SetOutOfService(Guid id, [FromBody] SetOutOfServiceDto dto)
    {
        var result = await _roomsService.SetOutOfServiceAsync(id, dto);
        if (!result.IsSuccess) return BadRequest(result);
        return Ok(result);
    }

    // UC-34: Get room availability timeline for all rooms in a hotel
    [HttpGet("availability")]
    [Authorize(Roles = "FrontDesk")]
    public async Task<IActionResult> GetRoomAvailability([FromQuery] RoomAvailabilityQueryDto query)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // Validate date range
        if (query.From >= query.To)
        {
            return BadRequest("From date must be before To date");
        }

        // Limit date range to prevent excessive data
        var maxDays = 365;
        if ((query.To - query.From).TotalDays > maxDays)
        {
            return BadRequest($"Date range cannot exceed {maxDays} days");
        }

        var result = await _bookingService.GetRoomAvailabilityAsync(query);
        
        if (result.IsSuccess)
        {
            return Ok(result);
        }

        return BadRequest(result);
    }

    // UC-34: Get booking schedule for a specific room
    [HttpGet("{roomId}/schedule")]
    [Authorize(Roles = "FrontDesk")]
    public async Task<IActionResult> GetRoomSchedule(
        Guid roomId, 
        [FromQuery] DateTime from, 
        [FromQuery] DateTime to)
    {
        // Validate date range
        if (from >= to)
        {
            return BadRequest("From date must be before To date");
        }

        // Limit date range to prevent excessive data
        var maxDays = 365;
        if ((to - from).TotalDays > maxDays)
        {
            return BadRequest($"Date range cannot exceed {maxDays} days");
        }

        var result = await _bookingService.GetRoomScheduleAsync(roomId, from, to);
        
        if (result.IsSuccess)
        {
            return Ok(result);
        }

        return BadRequest(result);
    }
}