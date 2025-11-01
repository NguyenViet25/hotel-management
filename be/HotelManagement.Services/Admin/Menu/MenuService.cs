using HotelManagement.Domain;
using HotelManagement.Repository.Common;
using HotelManagement.Services.Common;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace HotelManagement.Services.Admin.Menu;

public class MenuService : IMenuService
{
    private readonly IRepository<MenuItem> _menuItemRepository;
    private readonly IRepository<MenuGroup> _menuGroupRepository;
    private readonly IRepository<MenuItemIngredient> _menuItemIngredientRepository;

    public MenuService(
        IRepository<MenuItem> menuItemRepository,
        IRepository<MenuGroup> menuGroupRepository,
        IRepository<MenuItemIngredient> menuItemIngredientRepository,
     )
    {
        _menuItemRepository = menuItemRepository;
        _menuGroupRepository = menuGroupRepository;
        _menuItemIngredientRepository = menuItemIngredientRepository;
    }

    public async Task<ApiResponse<List<MenuItemDto>>> GetMenuItemsAsync(MenuQueryDto query)
    {
        try
        {
            Expression<Func<MenuItem, bool>> filter = item => true;

            if (query.GroupId.HasValue)
            {
                filter = filter.And(item => item.MenuGroupId == query.GroupId.Value);
            }

            if (!string.IsNullOrEmpty(query.Shift))
            {
                filter = filter.And(item => item.Group != null && item.Group.Shift == query.Shift);
            }

            if (query.Status.HasValue)
            {
                filter = filter.And(item => item.Status == query.Status.Value);
            }

            if (query.IsActive.HasValue)
            {
                filter = filter.And(item => item.IsActive == query.IsActive.Value);
            }

            var menuItems = await _menuItemRepository.Query()
                .Where(filter)
                .Include(i => i.Group)
                .Include(i => i.Ingredients)
                .ToListAsync();

            var result = menuItems.Select(MapToMenuItemDto).ToList();
            return ApiResponse<List<MenuItemDto>>.Ok(result);
        }
        catch (Exception ex)
        {
            return ApiResponse<List<MenuItemDto>>.Fail($"Failed to get menu items: {ex.Message}");
        }
    }

    public async Task<ApiResponse<MenuItemDto>> CreateMenuItemAsync(CreateMenuItemDto dto, Guid staffUserId)
    {
        try
        {
            // Validate menu group exists
            if (await _menuGroupRepository.FindAsync(dto.MenuGroupId!) is null)
            {
                return ApiResponse<MenuItemDto>.Fail("Menu group not found");
            }

            var menuItem = new MenuItem
            {
                Id = Guid.NewGuid(),
                MenuGroupId = dto.MenuGroupId,
                Name = dto.Name,
                Description = dto.Description,
                UnitPrice = dto.UnitPrice,
                PortionSize = dto.PortionSize,
                ImageUrl = dto.ImageUrl,
                Status = dto.Status,
                IsActive = true,
                HotelId = (await _menuGroupRepository.FindAsync(dto.MenuGroupId!))!.HotelId
            };

            await _menuItemRepository.AddAsync(menuItem);

            // Add ingredients
            if (dto.Ingredients != null && dto.Ingredients.Any())
            {
                foreach (var ingredientDto in dto.Ingredients)
                {
                    var ingredient = new MenuItemIngredient
                    {
                        Id = Guid.NewGuid(),
                        MenuItemId = menuItem.Id,
                        Name = ingredientDto.Name,
                        Quantity = ingredientDto.Quantity,
                        Unit = ingredientDto.Unit
                    };
                    await _menuItemIngredientRepository.AddAsync(ingredient);
                }
            }

            await _unitOfWork.SaveChangesAsync();

            // Reload the menu item with its relationships
            var createdMenuItem = await _menuItemRepository.Query()
                .Include(i => i.Group)
                .Include(i => i.Ingredients)
                .FirstOrDefaultAsync(i => i.Id == menuItem.Id);

            return ApiResponse<MenuItemDto>.Ok(MapToMenuItemDto(createdMenuItem));
        }
        catch (Exception ex)
        {
            return ApiResponse<MenuItemDto>.Fail($"Failed to create menu item: {ex.Message}");
        }
    }

    public async Task<ApiResponse<MenuItemDto>> UpdateMenuItemAsync(Guid id, UpdateMenuItemDto dto, Guid staffUserId)
    {
        try
        {
            var menuItem = await _menuItemRepository.Query()
                .Include(i => i.Ingredients)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (menuItem == null)
            {
                return ApiResponse<MenuItemDto>.Fail("Menu item not found");
            }

            // Validate menu group if provided
            if (dto.MenuGroupId.HasValue && !await _menuGroupRepository.AnyAsync(dto.MenuGroupId))
            {
                return ApiResponse<MenuItemDto>.Fail("Menu group not found");
            }

            // Update properties if provided
            if (dto.MenuGroupId.HasValue) menuItem.MenuGroupId = dto.MenuGroupId;
            if (!string.IsNullOrEmpty(dto.Name)) menuItem.Name = dto.Name;
            if (!string.IsNullOrEmpty(dto.Description)) menuItem.Description = dto.Description;
            if (dto.UnitPrice.HasValue) menuItem.UnitPrice = dto.UnitPrice.Value;
            if (!string.IsNullOrEmpty(dto.PortionSize)) menuItem.PortionSize = dto.PortionSize;
            if (!string.IsNullOrEmpty(dto.ImageUrl)) menuItem.ImageUrl = dto.ImageUrl;
            if (dto.Status.HasValue) menuItem.Status = dto.Status.Value;
            if (dto.IsActive.HasValue) menuItem.IsActive = dto.IsActive.Value;

            await _menuItemRepository.UpdateAsync(menuItem);

            // Update ingredients if provided
            if (dto.Ingredients != null && dto.Ingredients.Any())
            {
                // Handle existing ingredients
                foreach (var ingredientDto in dto.Ingredients.Where(i => i.Id.HasValue))
                {
                    var existingIngredient = menuItem.Ingredients.FirstOrDefault(i => i.Id == ingredientDto.Id);
                    if (existingIngredient != null)
                    {
                        if (!string.IsNullOrEmpty(ingredientDto.Name)) existingIngredient.Name = ingredientDto.Name;
                        if (!string.IsNullOrEmpty(ingredientDto.Quantity)) existingIngredient.Quantity = ingredientDto.Quantity;
                        if (!string.IsNullOrEmpty(ingredientDto.Unit)) existingIngredient.Unit = ingredientDto.Unit;
                        await _menuItemIngredientRepository.UpdateAsync(existingIngredient);
                    }
                }

                // Add new ingredients
                foreach (var ingredientDto in dto.Ingredients.Where(i => !i.Id.HasValue))
                {
                    var newIngredient = new MenuItemIngredient
                    {
                        Id = Guid.NewGuid(),
                        MenuItemId = menuItem.Id,
                        Name = ingredientDto.Name ?? string.Empty,
                        Quantity = ingredientDto.Quantity ?? string.Empty,
                        Unit = ingredientDto.Unit ?? string.Empty
                    };
                    await _menuItemIngredientRepository.AddAsync(newIngredient);
                }
            }

            await _unitOfWork.SaveChangesAsync();

            // Reload the menu item with its relationships
            var updatedMenuItem = await _menuItemRepository.Query()
                .Include(i => i.Group)
                .Include(i => i.Ingredients)
                .FirstOrDefaultAsync(i => i.Id == menuItem.Id);

            return ApiResponse<MenuItemDto>.Ok(MapToMenuItemDto(updatedMenuItem));
        }
        catch (Exception ex)
        {
            return ApiResponse<MenuItemDto>.Fail($"Failed to update menu item: {ex.Message}");
        }
    }

    public async Task<ApiResponse<bool>> DeleteMenuItemAsync(Guid id, Guid staffUserId)
    {
        try
        {
            var menuItem = await _menuItemRepository.FindAsync(id);
            if (menuItem == null)
            {
                return ApiResponse<bool>.Fail("Menu item not found");
            }

            // TODO: Check if there are any existing orders for this menu item
            // For now, we'll just delete it

            // Delete associated ingredients first
            var ingredients = await _menuItemIngredientRepository.Query()
                .Where(i => i.MenuItemId == id)
                .ToListAsync();

            foreach (var ingredient in ingredients)
            {
                await _menuItemIngredientRepository.RemoveAsync(ingredient);
            }

            await _menuItemRepository.RemoveAsync(menuItem);
            await _unitOfWork.SaveChangesAsync();

            return ApiResponse<bool>.Ok(true);
        }
        catch (Exception ex)
        {
            return ApiResponse<bool>.Fail($"Failed to delete menu item: {ex.Message}");
        }
    }

    public async Task<ApiResponse<List<MenuGroupDto>>> GetMenuGroupsAsync()
    {
        try
        {
            var menuGroups = await _menuGroupRepository.Query().ToListAsync();
            var result = menuGroups.Select(g => new MenuGroupDto
            {
                Id = g.Id,
                Name = g.Name,
                Shift = g.Shift
            }).ToList();

            return ApiResponse<List<MenuGroupDto>>.Ok(result);
        }
        catch (Exception ex)
        {
            return ApiResponse<List<MenuGroupDto>>.Fail($"Failed to get menu groups: {ex.Message}");
        }
    }

    public async Task<ApiResponse<MenuGroupDto>> CreateMenuGroupAsync(CreateMenuGroupDto dto, Guid staffUserId)
    {
        try
        {
            // Get hotel ID from staff user
            // For now, we'll use a placeholder
            var hotelId = Guid.Parse("00000000-0000-0000-0000-000000000001"); // This should be retrieved from user context

            var menuGroup = new MenuGroup
            {
                Id = Guid.NewGuid(),
                HotelId = hotelId,
                Name = dto.Name,
                Shift = dto.Shift
            };

            await _menuGroupRepository.AddAsync(menuGroup);
            await _unitOfWork.SaveChangesAsync();

            return ApiResponse<MenuGroupDto>.Ok(new MenuGroupDto
            {
                Id = menuGroup.Id,
                Name = menuGroup.Name,
                Shift = menuGroup.Shift
            });
        }
        catch (Exception ex)
        {
            return ApiResponse<MenuGroupDto>.Fail($"Failed to create menu group: {ex.Message}");
        }
    }

    private MenuItemDto MapToMenuItemDto(MenuItem menuItem)
    {
        return new MenuItemDto
        {
            Id = menuItem.Id,
            HotelId = menuItem.HotelId,
            MenuGroupId = menuItem.MenuGroupId,
            Name = menuItem.Name,
            Description = menuItem.Description,
            UnitPrice = menuItem.UnitPrice,
            PortionSize = menuItem.PortionSize,
            ImageUrl = menuItem.ImageUrl,
            IsActive = menuItem.IsActive,
            Status = menuItem.Status,
            Group = menuItem.Group != null ? new MenuGroupDto
            {
                Id = menuItem.Group.Id,
                Name = menuItem.Group.Name,
                Shift = menuItem.Group.Shift
            } : null,
            Ingredients = menuItem.Ingredients?.Select(i => new MenuItemIngredientDto
            {
                Id = i.Id,
                Name = i.Name,
                Quantity = i.Quantity,
                Unit = i.Unit
            }).ToList() ?? new List<MenuItemIngredientDto>()
        };
    }
}

// Extension method for combining expressions
public static class ExpressionExtensions
{
    public static Expression<Func<T, bool>> And<T>(this Expression<Func<T, bool>> expr1, Expression<Func<T, bool>> expr2)
    {
        var parameter = Expression.Parameter(typeof(T));
        var body = Expression.AndAlso(
            Expression.Invoke(expr1, parameter),
            Expression.Invoke(expr2, parameter)
        );
        return Expression.Lambda<Func<T, bool>>(body, parameter);
    }
}