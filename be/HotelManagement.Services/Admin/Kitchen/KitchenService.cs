using HotelManagement.Domain;
using HotelManagement.Repository.Common;
using HotelManagement.Services.Admin.Users;
using HotelManagement.Services.Common;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Services.Admin.Kitchen;

public class KitchenService : IKitchenService
{
    private readonly IRepository<MenuItem> _menuItemRepository;
    private readonly IRepository<MenuItemIngredient> _menuItemIngredientRepository;
    private readonly IUsersAdminService _userService;

    public KitchenService(
        IRepository<MenuItem> menuItemRepository,
        IRepository<MenuItemIngredient> menuItemIngredientRepository,
        IUsersAdminService userService)
    {
        _menuItemRepository = menuItemRepository;
        _menuItemIngredientRepository = menuItemIngredientRepository;
        _userService = userService;
    }

    public async Task<ApiResponse<ShoppingListDto>> GenerateShoppingListAsync(ShoppingListRequestDto request)
    {
        try
        {
            var query = _menuItemRepository.Query()
                .Include(m => m.Ingredients)
                .Where(m => m.IsActive && m.Status == MenuItemStatus.Available);

            // Filter by menu item IDs if provided
            if (request.MenuItemIds != null && request.MenuItemIds.Any())
            {
                query = query.Where(m => request.MenuItemIds.Contains(m.Id));
            }

            var menuItems = await query.ToListAsync();

            // Group ingredients across all menu items
            var ingredientGroups = menuItems
                .SelectMany(m => m.Ingredients.Select(i => new
                {
                    Ingredient = i,
                    MenuItem = m
                }))
                .GroupBy(x => new { x.Ingredient.Name, x.Ingredient.Unit })
                .Select(g => new ShoppingListItemDto
                {
                    IngredientName = g.Key.Name,
                    Unit = g.Key.Unit,
                    // Sum quantities - assuming they can be parsed as decimal
                    TotalQuantity = g.Sum(x => decimal.TryParse(x.Ingredient.Quantity, out var qty) ? qty : 0),
                    RelatedMenuItems = g.Select(x => x.MenuItem.Name).Distinct().ToList()
                })
                .ToList();

            var shoppingList = new ShoppingListDto
            {
                Id = Guid.NewGuid(),
                GeneratedDate = DateTime.UtcNow,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                Items = ingredientGroups
            };

            return ApiResponse<ShoppingListDto>.Ok(shoppingList);
        }
        catch (Exception ex)
        {
            return ApiResponse<ShoppingListDto>.Fail($"Failed to generate shopping list: {ex.Message}");
        }
    }

    public async Task<ApiResponse<IngredientQualityCheckResultDto>> CheckIngredientQualityAsync(
        IngredientQualityCheckDto request, Guid staffUserId)
    {
        try
        {
            // In a real implementation, we would store this in a database
            // For now, we'll just return a result based on the input
            
            var user = await _userService.GetAsync(staffUserId);
            if (user == null)
            {
                return ApiResponse<IngredientQualityCheckResultDto>.Fail("User not found");
            }

            var result = new IngredientQualityCheckResultDto
            {
                Id = Guid.NewGuid(),
                IngredientName = request.IngredientName,
                Status = request.Status,
                Notes = request.Notes,
                NeedsReplacement = request.NeedsReplacement,
                ReplacementQuantity = request.ReplacementQuantity,
                ReplacementUnit = request.ReplacementUnit,
                CheckedDate = DateTime.UtcNow,
                CheckedByUserName = user.UserName ?? "Unknown"
            };

            // If the quality is poor or expired and needs replacement, we would
            // trigger a notification or add to a shopping list in a real implementation

            return ApiResponse<IngredientQualityCheckResultDto>.Ok(result);
        }
        catch (Exception ex)
        {
            return ApiResponse<IngredientQualityCheckResultDto>.Fail($"Failed to check ingredient quality: {ex.Message}");
        }
    }
}


public class UserDto
{
    public Guid Id { get; set; }
    public string? UserName { get; set; }
}