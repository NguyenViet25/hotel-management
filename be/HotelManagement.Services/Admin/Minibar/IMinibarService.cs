using HotelManagement.Services.Admin.Minibar.Dtos;
using HotelManagement.Services.Common;

namespace HotelManagement.Services.Admin.Minibar;

public interface IMinibarService
{
    Task<ApiResponse<MinibarDto>> CreateAsync(MinibarCreateRequest request);
    Task<ApiResponse<MinibarDto>> UpdateAsync(Guid id, MinibarUpdateRequest request);
    Task<ApiResponse<bool>> DeleteAsync(Guid id);
    Task<ApiResponse<List<MinibarDto>>> GetAllAsync(Guid? hotelId = null, Guid? roomTypeId = null, string? search = null, int page = 1, int pageSize = 50);
    Task<ApiResponse<MinibarDto>> GetByIdAsync(Guid id);
}