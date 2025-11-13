using HotelManagement.Domain;
using HotelManagement.Services.Common;

namespace HotelManagement.Services.Admin.Menu;

public interface IMenuService
{
    // UC-45: Display menu by group, session, and status
    Task<ApiResponse<List<MenuItemDto>>> GetMenuItemsAsync(MenuQueryDto query);
    
    // UC-46: Add new menu item with quantity, price, and image
    Task<ApiResponse<MenuItemDto>> CreateMenuItemAsync(CreateMenuItemDto dto, Guid staffUserId);
    
    // UC-47: Update menu item information, quantity, and price
    Task<ApiResponse<MenuItemDto>> UpdateMenuItemAsync(Guid id, UpdateMenuItemDto dto, Guid staffUserId);
    
    // UC-48: Delete menu item without existing orders
    Task<ApiResponse<bool>> DeleteMenuItemAsync(Guid id, Guid staffUserId);

}