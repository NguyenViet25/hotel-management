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
}