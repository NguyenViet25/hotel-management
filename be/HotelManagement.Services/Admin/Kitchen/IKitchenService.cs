using HotelManagement.Services.Common;
using HotelManagement.Domain.Entities;

namespace HotelManagement.Services.Admin.Kitchen;

public interface IKitchenService
{
    // UC-49: Generate shopping list based on menu items and their ingredients
    Task<ApiResponse> GenerateShoppingListAsync(ShoppingListRequestDto request);
    Task<ApiResponse> UpdateShoppingListAsync(ShoppingListRequestDto request);
    Task<ApiResponse<ShoppingDto>> GetShoppingOrderAsync(Guid id);
    Task<ApiResponse<GetFoodsByWeekResponse>> GetFoodByWeekRequestAsync(GetFoodsByWeekRequest request);
    Task<ApiResponse<ShoppingDto>> UpdateShoppingOrderStatusAsync(Guid id, ShoppingOrderStatus status);
    
}
