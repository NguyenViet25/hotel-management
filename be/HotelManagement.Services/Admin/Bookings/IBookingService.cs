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
}