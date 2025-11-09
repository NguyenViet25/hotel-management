using HotelManagement.Services.Admin.Kitchen.Dtos;
using HotelManagement.Services.Common;

namespace HotelManagement.Services.Admin.Kitchen;

public interface IOrderItemStatusService
{
    Task<ApiResponse<OrderItemStatusDto>> UpdateOrderItemStatusAsync(Guid orderItemId, UpdateOrderItemStatusRequest request);
    Task<ApiResponse<OrderItemStatusListResponse>> GetPendingOrderItemsAsync(Guid hotelId, int page = 1, int pageSize = 10);
    Task<ApiResponse<OrderItemStatusListResponse>> GetOrderItemsByStatusAsync(Guid hotelId, string status, int page = 1, int pageSize = 10);
}