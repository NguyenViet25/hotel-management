using HotelManagement.Services.Admin.Bookings;
using HotelManagement.Services.Admin.Bookings.Dtos;
using HotelManagement.Services.Admin.Medias;
using HotelManagement.Services.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;

namespace HotelManagement.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/bookings")]
[Authorize]
public class BookingsController : ControllerBase
{
    private readonly IBookingsService _bookingsService;
    private readonly IWebHostEnvironment _env;
    private readonly IMediaService _service;

    public BookingsController(IBookingsService bookingsService, IWebHostEnvironment env, IMediaService service)
    {
        _bookingsService = bookingsService;
        _env = env;
        _service = service;
    }

    // UC-31: Create a booking with deposit
    [HttpPost]
    public async Task<ActionResult<ApiResponse<BookingDetailsDto>>> Create([FromBody] CreateBookingDto dto)
    {
        var result = await _bookingsService.CreateAsync(dto);
        return Ok(result);
    }

    [HttpPost("check-in")]
    public async Task<IActionResult> CheckIn([FromBody] CheckInRequest request)
    {
        var persons = new List<PersonDto>();

        foreach (var person in request.Persons)
        {
            var idCardFrontImgUrl = await UploadFileAsync(person.IdCardFront);
            var idCardBackImgUrl = await UploadFileAsync(person.IdCardBack);

            persons.Add(new PersonDto()
            {
                IdCardBackImageUrl = idCardBackImgUrl,
                IdCardFrontImageUrl = idCardFrontImgUrl,
                Name = person.Name,
                Phone = person.Phone,
            });
        }

        var dto = new CheckInDto()
        {
            RoomBookingId = request.RoomBookingId,
            Persons = persons,
        };

        var result = await _bookingsService.CheckInAsync(dto);
        return Ok(result);
    }

    private async Task<string> UploadFileAsync(IFormFile file)
    {
        var baseUrl = $"{Request.Scheme}://{Request.Host}";

        var result = await _service.UploadAsync(
            file.OpenReadStream(),
            file.FileName,
            file.ContentType,
            file.Length,
            baseUrl,
            _env.WebRootPath);
        return result.Data?.FileUrl ?? string.Empty;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<BookingDetailsDto>>>> List([FromQuery] BookingsQueryDto query)
    {
        var result = await _bookingsService.ListAsync(query);
        return Ok(result);
    }

    [HttpGet("active")]
    public async Task<ActionResult<ApiResponse<List<BookingDetailsDto>>>> ListActiveBooking([FromQuery] BookingsQueryDto query)
    {
        var result = await _bookingsService.ListAsync(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<BookingDetailsDto>>> Get(Guid id)
    {
        var result = await _bookingsService.GetByIdAsync(id);
        return Ok(result);
    }

    // UC-32: Log call to confirm booking
    [HttpPost("{id}/call-log")]
    public async Task<ActionResult<ApiResponse<CallLogDto>>> AddCallLog(Guid id, [FromBody] AddCallLogDto dto)
    {
        var result = await _bookingsService.AddCallLogAsync(id, dto);
        return Ok(result);
    }

    // FE expects pluralized call logs endpoints
    [HttpPost("{id}/call-logs")]
    public async Task<ActionResult<ApiResponse<CallLogDto>>> AddCallLogPlural(Guid id, [FromBody] AddCallLogDto dto)
    {
        var result = await _bookingsService.AddCallLogAsync(id, dto);
        return Ok(result);
    }

    [HttpGet("{id}/call-logs")]
    public async Task<ActionResult<ApiResponse<List<CallLogDto>>>> GetCallLogs(Guid id)
    {
        var result = await _bookingsService.GetCallLogsAsync(id);
        return Ok(result);
    }

    // UC-33: Update or cancel booking
    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<BookingDetailsDto>>> Update(Guid id, [FromBody] UpdateBookingDto dto)
    {
        var result = await _bookingsService.UpdateAsync(id, dto);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse>> Cancel(Guid id)
    {
        var result = await _bookingsService.CancelAsync(id);
        return Ok(result);
    }

    // UC-34: Room timeline map
    [HttpGet("room-map")]
    public async Task<ActionResult<ApiResponse<List<RoomMapItemDto>>>> RoomMap([FromQuery] RoomMapQueryDto query)
    {
        var result = await _bookingsService.GetRoomMapAsync(query);
        return Ok(result);
    }

    // Room availability for a date range
    [HttpGet("room-availability")]
    public async Task<ActionResult<ApiResponse<object>>> RoomAvailability([FromQuery] RoomAvailabilityQueryDto query)
    {
        var result = await _bookingsService.GetRoomAvailabilityAsync(query);
        return Ok(result);
    }

    // Room schedule timeline for specific room and date range
    [HttpGet("rooms/{roomId}/schedule")]
    public async Task<ActionResult<ApiResponse<List<BookingIntervalDto>>>> RoomSchedule(Guid roomId, [FromQuery] DateTime from, [FromQuery] DateTime to)
    {
        var result = await _bookingsService.GetRoomScheduleAsync(roomId, from, to);
        return Ok(result);
    }


    [HttpPost("add-room")]
    public async Task<IActionResult> AddRoomToBooking([FromBody] AddRoomToBooking request)
    {
        var result = await _bookingsService.AddRoomToBookingAsync(request.BookingRoomTypeId, request.RoomId);
        return Ok(result);
    }
}

public class AddRoomToBooking
{
    public Guid BookingRoomTypeId { get; set; }
    public Guid RoomId { get; set; }

}

public class CheckInRequest
{
    public Guid RoomBookingId { get; set; }
    public List<PersonRequest> Persons { get; set; } = [];
}

public class PersonRequest
{
    public required string Name { get; set; }
    public required string Phone { get; set; }
    public required IFormFile IdCardFront { get; set; }
    public required IFormFile IdCardBack { get; set; }
}