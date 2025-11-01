using HotelManagement.Services.Admin.Bookings;
using HotelManagement.Services.Admin.Bookings.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HotelManagement.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/bookings")]
[Authorize(Roles = "FrontDesk")]
public class BookingsController : ControllerBase
{
    private readonly IBookingService _bookingService;

    public BookingsController(IBookingService bookingService)
    {
        _bookingService = bookingService;
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(userIdClaim, out var userId) ? userId : Guid.Empty;
    }

    /// <summary>
    /// UC-31: Create a new booking with deposit
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateBooking([FromBody] CreateBookingDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var staffUserId = GetCurrentUserId();
        if (staffUserId == Guid.Empty)
        {
            return Unauthorized("Invalid user token");
        }

        var result = await _bookingService.CreateAsync(dto, staffUserId);
        
        if (result.IsSuccess)
        {
            return CreatedAtAction(nameof(GetBooking), new { id = result.Data.Id }, result);
        }

        return BadRequest(result);
    }

    /// <summary>
    /// UC-31: Get booking details by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetBooking(Guid id)
    {
        var result = await _bookingService.GetByIdAsync(id);
        
        if (result.IsSuccess)
        {
            return Ok(result);
        }

        return NotFound(result);
    }

    /// <summary>
    /// UC-31: List bookings with filtering and pagination
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> ListBookings([FromQuery] BookingsQueryDto query)
    {
        var result = await _bookingService.ListAsync(query);
        
        if (result.IsSuccess)
        {
            var response = new
            {
                Success = result.IsSuccess,
                Message = result.Message,
                Data = result.Data.Items,
                Meta = new
                {
                    Total = result.Data.Total,
                    Page = query.Page,
                    PageSize = query.PageSize,
                    TotalPages = (int)Math.Ceiling((double)result.Data.Total / query.PageSize)
                }
            };
            return Ok(response);
        }

        return BadRequest(result);
    }

    /// <summary>
    /// UC-32: Create a call log for booking confirmation
    /// </summary>
    [HttpPost("{id}/call-logs")]
    public async Task<IActionResult> CreateCallLog(Guid id, [FromBody] CreateCallLogDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var staffUserId = GetCurrentUserId();
        if (staffUserId == Guid.Empty)
        {
            return Unauthorized("Invalid user token");
        }

        var result = await _bookingService.CreateCallLogAsync(id, dto, staffUserId);
        
        if (result.IsSuccess)
        {
            return CreatedAtAction(nameof(GetCallLogs), new { id }, result);
        }

        return BadRequest(result);
    }

    /// <summary>
    /// UC-32: Get call logs for a booking
    /// </summary>
    [HttpGet("{id}/call-logs")]
    public async Task<IActionResult> GetCallLogs(Guid id)
    {
        var result = await _bookingService.GetCallLogsAsync(id);
        
        if (result.IsSuccess)
        {
            return Ok(result);
        }

        return NotFound(result);
    }

    /// <summary>
    /// UC-33: Update booking details
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateBooking(Guid id, [FromBody] UpdateBookingDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var staffUserId = GetCurrentUserId();
        if (staffUserId == Guid.Empty)
        {
            return Unauthorized("Invalid user token");
        }

        var result = await _bookingService.UpdateAsync(id, dto, staffUserId);
        
        if (result.IsSuccess)
        {
            return Ok(result);
        }

        return BadRequest(result);
    }

    /// <summary>
    /// UC-35: Cancel a booking
    /// </summary>
    [HttpPost("{id}/cancel")]
    public async Task<IActionResult> CancelBooking(Guid id, [FromBody] CancelBookingDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var staffUserId = GetCurrentUserId();
        if (staffUserId == Guid.Empty)
        {
            return Unauthorized("Invalid user token");
        }

        var result = await _bookingService.CancelAsync(id, dto, staffUserId);
        
        if (result.IsSuccess)
        {
            return Ok(result);
        }
        
        return BadRequest(result);
    }

    /// <summary>
    /// UC-36: Check-in a booking
    /// </summary>
    [HttpPost("{id}/check-in")]
    public async Task<IActionResult> CheckIn(Guid id, [FromBody] CheckInDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var staffUserId = GetCurrentUserId();
        if (staffUserId == Guid.Empty)
        {
            return Unauthorized("Invalid user token");
        }

        var result = await _bookingService.CheckInAsync(id, dto, staffUserId);
        
        if (result.IsSuccess)
        {
            return Ok(result);
        }
        
        return BadRequest(result);
    }

    /// <summary>
    /// UC-37: Change room for a booking
    /// </summary>
    [HttpPost("{id}/change-room")]
    public async Task<IActionResult> ChangeRoom(Guid id, [FromBody] ChangeRoomDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var staffUserId = GetCurrentUserId();
        if (staffUserId == Guid.Empty)
        {
            return Unauthorized("Invalid user token");
        }

        var result = await _bookingService.ChangeRoomAsync(id, dto, staffUserId);
        
        if (result.IsSuccess)
        {
            return Ok(result);
        }
        
        return BadRequest(result);
    }

    /// <summary>
    /// UC-38: Extend stay for a booking
    /// </summary>
    [HttpPost("{id}/extend-stay")]
    public async Task<IActionResult> ExtendStay(Guid id, [FromBody] ExtendStayDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var staffUserId = GetCurrentUserId();
        if (staffUserId == Guid.Empty)
        {
            return Unauthorized("Invalid user token");
        }

        var result = await _bookingService.ExtendStayAsync(id, dto, staffUserId);
        
        if (result.IsSuccess)
        {
            return Ok(result);
        }
        
        return BadRequest(result);
    }

    /// <summary>
    /// UC-39: Check-out a booking
    /// </summary>
    [HttpPost("{id}/check-out")]
    public async Task<IActionResult> Checkout(Guid id, [FromBody] CheckoutRequestDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var staffUserId = GetCurrentUserId();
        if (staffUserId == Guid.Empty)
        {
            return Unauthorized("Invalid user token");
        }

        var result = await _bookingService.CheckoutAsync(id, dto, staffUserId);
        
        if (result.IsSuccess)
        {
            return Ok(result);
        }
        
        return BadRequest(result);
    }
}