using HotelManagement.Services.Admin.Bookings;
using HotelManagement.Services.Admin.Bookings.Dtos;
using HotelManagement.Services.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/bookings")]
[Authorize]
public class BookingsController : ControllerBase
{
    private readonly BookingsService _bookingsService;

    public BookingsController(BookingsService bookingsService)
    {
        _bookingsService = bookingsService;
    }

    // UC-31: Create a booking with deposit
    [HttpPost]
    public async Task<ActionResult<ApiResponse<BookingDetailsDto>>> Create([FromBody] CreateBookingDto dto)
    {
        var result = await _bookingsService.CreateAsync(dto);
        if (!result.IsSuccess) return BadRequest(result);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<BookingDetailsDto>>> Get(Guid id)
    {
        var result = await _bookingsService.GetByIdAsync(id);
        if (!result.IsSuccess) return NotFound(result);
        return Ok(result);
    }

    // UC-32: Log call to confirm booking
    [HttpPost("{id}/call-log")]
    public async Task<ActionResult<ApiResponse<CallLogDto>>> AddCallLog(Guid id, [FromBody] AddCallLogDto dto)
    {
        var result = await _bookingsService.AddCallLogAsync(id, dto);
        if (!result.IsSuccess) return BadRequest(result);
        return Ok(result);
    }

    // UC-33: Update or cancel booking
    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<BookingDetailsDto>>> Update(Guid id, [FromBody] UpdateBookingDto dto)
    {
        var result = await _bookingsService.UpdateAsync(id, dto);
        if (!result.IsSuccess) return BadRequest(result);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse>> Cancel(Guid id)
    {
        var result = await _bookingsService.CancelAsync(id);
        if (!result.IsSuccess) return BadRequest(result);
        return Ok(result);
    }

    // UC-34: Room timeline map
    [HttpGet("room-map")]
    public async Task<ActionResult<ApiResponse<List<RoomMapItemDto>>>> RoomMap([FromQuery] RoomMapQueryDto query)
    {
        var result = await _bookingsService.GetRoomMapAsync(query);
        if (!result.IsSuccess) return BadRequest(result);
        return Ok(result);
    }
}