using HotelManagement.Services.Admin.Bookings;
using HotelManagement.Services.Admin.Bookings.Dtos;
using HotelManagement.Services.Admin.Medias;
using HotelManagement.Services.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;

namespace HotelManagement.Api.Controllers;

[ApiController]
[Route("api/bookings")]
//[Authorize]
public class BookingsController(IBookingsService bookingsService, IWebHostEnvironment env, IMediaService service) : ControllerBase
{
    private readonly IBookingsService _bookingsService = bookingsService;
    private readonly IWebHostEnvironment _env = env;
    private readonly IMediaService _service = service;

    // UC-31: Create a booking with deposit
    [HttpPost]
    public async Task<ActionResult<ApiResponse<BookingDetailsDto>>> Create([FromBody] CreateBookingDto dto)
    {
        var result = await _bookingsService.CreateAsync(dto);
        return Ok(result);
    }

    [HttpPost("{id}/check-in")]
    public async Task<ActionResult<ApiResponse>> CheckInJson(Guid id, [FromBody] CheckInDto dto)
    {
        var result = await _bookingsService.CheckInAsync(dto);
        return Ok(result);
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
        var result = await _bookingsService.ListActiveAsync(new BookingsByHotelQueryDto { HotelId = query.HotelId });
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

    [HttpPut("confirm/{id}")]
    public async Task<ActionResult<ApiResponse>> Confirm(Guid id)
    {
        var result = await _bookingsService.ConfirmAsync(id);
        return Ok(result);
    }


    [HttpPut("complete/{id}")]
    public async Task<ActionResult<ApiResponse>> Complete(Guid id)
    {
        var result = await _bookingsService.CompleteAsync(id);
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

    [HttpGet("rooms/{roomId}/current-booking")]
    public async Task<ActionResult<ApiResponse<string>>> GetCurrentBookingId(Guid roomId)
    {
        var result = await _bookingsService.GetCurrentBookingIdAsync(roomId);
        return Ok(result);
    }


    [HttpPost("add-room")]
    public async Task<IActionResult> AddRoomToBooking([FromBody] AddRoomToBooking request)
    {
        var result = await _bookingsService.AddRoomToBookingAsync(request.BookingRoomTypeId, request.RoomId);
        return Ok(result);
    }

    [HttpPost("{id}/change-room")]
    public async Task<ActionResult<ApiResponse<BookingDetailsDto>>> ChangeRoom(Guid id, [FromBody] ChangeRoomDto dto)
    {
        var result = await _bookingsService.ChangeRoomAsync(id, dto.NewRoomId);
        return Ok(result);
    }

    [HttpPost("{id}/extend-stay")]
    public async Task<ActionResult<ApiResponse<ExtendStayResultDto>>> ExtendStay(Guid id, [FromBody] ExtendStayDto dto)
    {
        var result = await _bookingsService.ExtendStayAsync(id, dto.NewEndDate, dto.DiscountCode);
        return Ok(result);
    }

    [HttpPost("{id}/check-out")]
    public async Task<ActionResult<ApiResponse<CheckoutResultDto>>> CheckOut(Guid id, [FromBody] CheckoutRequestDto dto)
    {
        var result = await _bookingsService.CheckOutAsync(id, dto);
        return Ok(result);
    }

    [HttpGet("{id}/additional-charges/preview")]
    public async Task<ActionResult<ApiResponse<AdditionalChargesDto>>> AdditionalChargesPreview(Guid id)
    {
        var result = await _bookingsService.GetAdditionalChargesPreviewAsync(id);
        return Ok(result);
    }

    [HttpPost("{id}/minibar-consumption")]
    public async Task<ActionResult<ApiResponse>> RecordMinibar(Guid id, [FromBody] MinibarConsumptionDto dto)
    {
        var result = await _bookingsService.RecordMinibarConsumptionAsync(id, dto);
        return Ok(result);
    }

    [HttpGet("peak-days")]
    public async Task<ActionResult<ApiResponse<List<PeakDayDto>>>> GetPeakDays([FromQuery] PeakDaysQueryDto query)
    {
        var result = await _bookingsService.GetPeakDaysAsync(query);
        return Ok(result);
    }

    [HttpPost("no-shows/cancel")]
    public async Task<ActionResult<ApiResponse<NoShowCancelResultDto>>> CancelNoShows([FromBody] NoShowCancelRequestDto request)
    {
        var result = await _bookingsService.CancelNoShowsAsync(request);
        return Ok(result);
    }

    [HttpGet("{id}/early-checkout/quote")]
    public async Task<ActionResult<ApiResponse<EarlyCheckoutFeeResponseDto>>> GetEarlyCheckoutQuote(Guid id, [FromQuery] DateTime checkoutDate)
    {
        var result = await _bookingsService.CalculateEarlyCheckoutFeeAsync(id, new EarlyCheckoutFeeRequestDto { CheckoutDate = checkoutDate });
        return Ok(result);
    }

    [HttpPut("rooms/{bookingRoomId}/guests/{guestId}")]
    public async Task<ActionResult<ApiResponse<BookingDetailsDto>>> UpdateGuestInRoom(Guid bookingRoomId, Guid guestId, [FromBody] UpdateGuestDto dto)
    {
        var result = await _bookingsService.UpdateGuestInRoomAsync(bookingRoomId, guestId, dto);
        return Ok(result);
    }

    [HttpDelete("rooms/{bookingRoomId}/guests/{guestId}")]
    public async Task<ActionResult<ApiResponse<BookingDetailsDto>>> RemoveGuestFromRoom(Guid bookingRoomId, Guid guestId)
    {
        var result = await _bookingsService.RemoveGuestFromRoomAsync(bookingRoomId, guestId);
        return Ok(result);
    }

    [HttpPut("rooms/{bookingRoomId}/dates")]
    public async Task<ActionResult<ApiResponse<BookingDetailsDto>>> UpdateRoomDates(Guid bookingRoomId, [FromBody] UpdateBookingRoomDatesDto dto)
    {
        var result = await _bookingsService.UpdateRoomDatesAsync(bookingRoomId, dto.StartDate, dto.EndDate);
        return Ok(result);
    }

    [HttpPut("rooms/{bookingRoomId}/actual-times")]
    public async Task<ActionResult<ApiResponse<BookingDetailsDto>>> UpdateRoomActualTimes(Guid bookingRoomId, [FromBody] UpdateBookingRoomActualTimesDto dto)
    {
        var result = await _bookingsService.UpdateRoomActualTimesAsync(bookingRoomId, dto.ActualCheckInAt, dto.ActualCheckOutAt);
        return Ok(result);
    }

    [HttpPost("rooms/{bookingRoomId}/guests/{guestId}/move")]
    public async Task<ActionResult<ApiResponse<BookingDetailsDto>>> MoveGuest(Guid bookingRoomId, Guid guestId, [FromBody] MoveGuestDto dto)
    {
        var result = await _bookingsService.MoveGuestAsync(bookingRoomId, guestId, dto.TargetBookingRoomId);
        return Ok(result);
    }

    [HttpPost("rooms/{bookingRoomId}/guests/{guestId}/swap")]
    public async Task<ActionResult<ApiResponse<BookingDetailsDto>>> SwapGuests(Guid bookingRoomId, Guid guestId, [FromBody] SwapGuestsDto dto)
    {
        var result = await _bookingsService.SwapGuestsAsync(bookingRoomId, guestId, dto.TargetBookingRoomId, dto.TargetGuestId);
        return Ok(result);
    }

    [HttpGet("rooms/{roomId}/history")]
    public async Task<ActionResult<ApiResponse<List<RoomStayHistoryDto>>>> RoomHistory(Guid roomId, [FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        var result = await _bookingsService.GetRoomHistoryAsync(roomId, from, to);
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
