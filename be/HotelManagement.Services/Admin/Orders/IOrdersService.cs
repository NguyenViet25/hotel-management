using HotelManagement.Services.Admin.Orders.Dtos;
using HotelManagement.Services.Common;

namespace HotelManagement.Services.Admin.Orders;

public interface IOrdersService
{
    Task<ApiResponse<List<OrderSummaryDto>>> ListAsync(OrdersQueryDto query);
    Task<ApiResponse<OrderDetailsDto>> GetByIdAsync(Guid id);
    Task<ApiResponse<OrderDetailsDto>> CreateWalkInAsync(CreateWalkInOrderDto dto);
    Task<ApiResponse<OrderDetailsDto>> UpdateWalkInAsync(Guid id, UpdateWalkInOrderDto dto);
    Task<bool> UpdateWalkPromotionAsync(Guid id, UpdateWalkInPromotionDto dto);
    Task<ApiResponse<OrderDetailsDto>> CreateForBookingAsync(CreateBookingOrderDto dto);
    Task<ApiResponse<OrderDetailsDto>> UpdateForBookingAsync(Guid id, UpdateOrderForBookingDto dto);
    Task<ApiResponse<OrderDetailsDto>> AddItemAsync(Guid orderId, AddOrderItemDto dto);
    Task<ApiResponse<OrderDetailsDto>> UpdateItemAsync(Guid orderId, Guid itemId, UpdateOrderItemDto dto);
    Task<ApiResponse<OrderDetailsDto>> RemoveItemAsync(Guid orderId, Guid itemId);
    Task<ApiResponse<OrderDetailsDto>> ReplaceItemAsync(Guid orderId, Guid itemId, ReplaceOrderItemDto dto, Guid? userId);
}