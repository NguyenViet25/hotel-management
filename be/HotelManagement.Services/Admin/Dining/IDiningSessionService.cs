using HotelManagement.Services.Admin.Dining.Dtos;
using HotelManagement.Services.Admin.Orders.Dtos;
using HotelManagement.Services.Common;

namespace HotelManagement.Services.Admin.Dining;

public interface IDiningSessionService
{
    Task<ApiResponse<DiningSessionDto>> CreateSessionAsync(CreateDiningSessionRequest request);
    Task<ApiResponse<DiningSessionDto>> GetSessionAsync(Guid id);
    Task<ApiResponse<DiningSessionListResponse>> GetSessionsAsync(Guid hotelId, int page = 1, int pageSize = 10, string? status = null);
    Task<ApiResponse<DiningSessionDto>> UpdateSessionAsync(Guid id, UpdateDiningSessionRequest request);
    Task<ApiResponse<bool>> EndSessionAsync(Guid id);
    Task<ApiResponse<bool>> AttachTableAsync(Guid sessionId, Guid tableId);
    Task<ApiResponse<bool>> DetachTableAsync(Guid sessionId, Guid tableId);
    Task<ApiResponse<bool>> DeleteSessionAsync(Guid id);
    Task<ApiResponse<bool>> UpdateSessionTablesAsync(Guid sessionId, UpdateSessionTablesRequest request);
    Task<ApiResponse<bool>> AssignOrderAsync(Guid sessionId, Guid orderId);
    Task<ApiResponse<OrderDetailsDto>> GetOrderOfSessionAsync(Guid sessionId);
    Task<ApiResponse<OrderDetailsDto>> GetOrderOfTableAsync(Guid tableId);
    Task<ApiResponse<List<SessionTableDto>>> GetTablesBySessionAsync(Guid sessionId);
    Task<(bool, string)> AssignWaiterAsync(AssignWaiterRequest request);
}
