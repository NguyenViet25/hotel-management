using HotelManagement.Services.Common;

namespace HotelManagement.Services.Admin.Kitchen;

public interface IKitchenService
{
    // UC-49: Generate shopping list based on menu items and their ingredients
    Task<ApiResponse<ShoppingListDto>> GenerateShoppingListAsync(ShoppingListRequestDto request);
    
    // UC-50: Check ingredient quality and replace if needed
    Task<ApiResponse<IngredientQualityCheckResultDto>> CheckIngredientQualityAsync(IngredientQualityCheckDto request, Guid staffUserId);
}