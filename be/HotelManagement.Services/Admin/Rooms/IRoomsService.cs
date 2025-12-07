using HotelManagement.Services.Admin.Rooms.Dtos;
using HotelManagement.Services.Common;

namespace HotelManagement.Services.Admin.Rooms;

public interface IRoomsService
{
    Task<ApiResponse<List<RoomSummaryDto>>> ListAsync(RoomsQueryDto query);
    Task<ApiResponse<List<RoomSummaryDto>>> ListByTypeAsync(Guid type);
    Task<ApiResponse<RoomSummaryDto>> CreateAsync(CreateRoomDto dto);
    Task<ApiResponse<RoomSummaryDto>> UpdateAsync(Guid id, UpdateRoomDto dto);
    Task<ApiResponse> DeleteAsync(Guid id);
    Task<ApiResponse<RoomSummaryDto>> GetByIdAsync(Guid id);
    Task<ApiResponse<RoomSummaryDto>> SetOutOfServiceAsync(Guid id, SetOutOfServiceDto dto);
}