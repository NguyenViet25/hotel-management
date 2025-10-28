using HotelManagement.Services.Admin.Bookings.Dtos;
using HotelManagement.Services.Common;

namespace HotelManagement.Services.Admin.GroupBookings;

public interface IGroupBookingService
{
    Task<ApiResponse<GroupBookingDto>> CreateAsync(CreateGroupBookingDto dto);
    Task<ApiResponse<GroupBookingDto>> GetByIdAsync(Guid id);
    Task<ApiResponse<List<GroupBookingDto>>> ListAsync(Guid hotelId, int page = 1, int pageSize = 10);
}