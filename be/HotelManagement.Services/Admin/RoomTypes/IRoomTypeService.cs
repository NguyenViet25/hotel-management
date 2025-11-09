using HotelManagement.Services.Admin.RoomTypes.Dtos;
using HotelManagement.Services.Common;

namespace HotelManagement.Services.Admin.RoomTypes;

public interface IRoomTypeService
{
    Task<ApiResponse<RoomTypeDto>> CreateAsync(CreateRoomTypeDto dto);
    Task<ApiResponse<RoomTypeDto>> UpdateAsync(Guid id, UpdateRoomTypeDto dto);
    Task<ApiResponse> DeleteAsync(Guid id);
    Task<ApiResponse<RoomTypeDto>> GetByIdAsync(Guid id);
    Task<ApiResponse<RoomTypeDetailDto>> GetDetailByIdAsync(Guid id);
    Task<ApiResponse<List<RoomTypeDto>>> GetAllAsync(RoomTypeQueryDto query);
    Task<ApiResponse<List<RoomTypeDto>>> GetByHotelIdAsync(Guid hotelId);
    Task<ApiResponse> ValidateDeleteAsync(Guid id);
}