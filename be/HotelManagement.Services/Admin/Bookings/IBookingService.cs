using HotelManagement.Services.Admin.Bookings.Dtos;
using HotelManagement.Services.Common;

namespace HotelManagement.Services.Admin.Bookings;

public interface IBookingService
{
    // UC-31: Create booking with deposit
    Task<ApiResponse<BookingDto>> CreateAsync(CreateBookingDto dto, Guid staffUserId);
    Task<ApiResponse<BookingDto>> GetByIdAsync(Guid id);
    Task<ApiResponse<(List<BookingSummaryDto> Items, int Total)>> ListAsync(BookingsQueryDto query);

    // UC-32: Call confirmation
    Task<ApiResponse<CallLogDto>> CreateCallLogAsync(Guid bookingId, CreateCallLogDto dto, Guid staffUserId);
    Task<ApiResponse<List<CallLogDto>>> GetCallLogsAsync(Guid bookingId);

    // UC-33: Update/Cancel booking
    Task<ApiResponse<BookingDto>> UpdateAsync(Guid id, UpdateBookingDto dto, Guid staffUserId);
    Task<ApiResponse<BookingDto>> CancelAsync(Guid id, CancelBookingDto dto, Guid staffUserId);

    // UC-34: Room availability
    Task<ApiResponse<List<RoomAvailabilityDto>>> GetRoomAvailabilityAsync(RoomAvailabilityQueryDto query);
    Task<ApiResponse<List<BookingIntervalDto>>> GetRoomScheduleAsync(Guid roomId, DateTime from, DateTime to);

    // UC-36: Check-in & CCCD/ID image handling
    Task<ApiResponse<BookingDto>> CheckInAsync(Guid bookingId, CheckInDto dto, Guid staffUserId);

    // UC-37: Change room
    Task<ApiResponse<BookingDto>> ChangeRoomAsync(Guid bookingId, ChangeRoomDto dto, Guid staffUserId);

    // UC-38: Extend stay
    Task<ApiResponse<ExtendStayResultDto>> ExtendStayAsync(Guid bookingId, ExtendStayDto dto, Guid staffUserId);

    // UC-39: Checkout & reconciliation
    Task<ApiResponse<CheckoutResultDto>> CheckoutAsync(Guid bookingId, CheckoutRequestDto dto, Guid staffUserId);
}