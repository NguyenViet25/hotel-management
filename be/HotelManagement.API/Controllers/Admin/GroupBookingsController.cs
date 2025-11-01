using HotelManagement.Services.Admin.Bookings.Dtos;
using HotelManagement.Services.Admin.GroupBookings;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/group-bookings")]
[Authorize(Roles = "FrontDesk")]
public class GroupBookingsController : ControllerBase
{
    private readonly IGroupBookingService _groupBookingService;

    public GroupBookingsController(IGroupBookingService groupBookingService)
    {
        _groupBookingService = groupBookingService;
    }

    /// <summary>
    /// Create a new group booking with multiple rooms
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateGroupBooking([FromBody] CreateGroupBookingDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var result = await _groupBookingService.CreateAsync(dto);
        
        if (result.IsSuccess)
        {
            return CreatedAtAction(nameof(GetGroupBooking), new { id = result.Data?.Bookings?.FirstOrDefault()?.Id }, result);
        }

        return BadRequest(result);
    }

    /// <summary>
    /// Get group booking details by booking ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetGroupBooking(Guid id)
    {
        var result = await _groupBookingService.GetByIdAsync(id);
        
        if (result.IsSuccess)
        {
            return Ok(result);
        }

        return NotFound(result);
    }

    /// <summary>
    /// List all group bookings for a hotel
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> ListGroupBookings(
        [FromQuery] Guid hotelId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        if (hotelId == Guid.Empty)
        {
            return BadRequest("Hotel ID is required");
        }

        if (page <= 0 || pageSize <= 0 || pageSize > 100)
        {
            return BadRequest("Invalid pagination parameters");
        }

        var result = await _groupBookingService.ListAsync(hotelId, page, pageSize);
        
        return Ok(result);
    }
}