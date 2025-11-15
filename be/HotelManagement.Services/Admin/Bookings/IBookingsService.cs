using HotelManagement.Services.Admin.Bookings.Dtos;
using HotelManagement.Services.Common;

namespace HotelManagement.Services.Admin.Bookings;

public interface IBookingsService
{
    Task<ApiResponse<BookingDetailsDto>> CreateAsync(CreateBookingDto dto);
    Task<ApiResponse<BookingDetailsDto>> GetByIdAsync(Guid id);
    Task<ApiResponse<BookingDetailsDto>> UpdateAsync(Guid id, UpdateBookingDto dto);
    Task<ApiResponse> CancelAsync(Guid id);
    Task<ApiResponse<CallLogDto>> AddCallLogAsync(Guid bookingId, AddCallLogDto dto);
    Task<ApiResponse<List<RoomMapItemDto>>> GetRoomMapAsync(RoomMapQueryDto query);
    Task<ApiResponse<List<BookingDetailsDto>>> ListAsync(BookingsQueryDto query);
    Task<ApiResponse<List<BookingDetailsDto>>> ListActiveAsync(BookingsByHotelQueryDto query);
    Task<ApiResponse<List<CallLogDto>>> GetCallLogsAsync(Guid bookingId);
    Task<ApiResponse<object>> GetRoomAvailabilityAsync(RoomAvailabilityQueryDto query);
    Task<ApiResponse<List<BookingIntervalDto>>> GetRoomScheduleAsync(Guid roomId, DateTime from, DateTime to);
}