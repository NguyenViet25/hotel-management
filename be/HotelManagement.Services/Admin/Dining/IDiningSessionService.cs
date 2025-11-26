using HotelManagement.Services.Admin.Dining.Dtos;
using HotelManagement.Services.Common;

namespace HotelManagement.Services.Admin.Dining;

public interface IDiningSessionService
{
    Task<ApiResponse<DiningSessionDto>> CreateSessionAsync(CreateDiningSessionRequest request);
    Task<ApiResponse<DiningSessionDto>> GetSessionAsync(Guid id);
    Task<ApiResponse<DiningSessionListResponse>> GetSessionsAsync(Guid hotelId, int page = 1, int pageSize = 10, string? status = null);
    Task<ApiResponse<DiningSessionDto>> UpdateSessionAsync(Guid id, UpdateDiningSessionRequest request);
    Task<ApiResponse<bool>> EndSessionAsync(Guid id);
}