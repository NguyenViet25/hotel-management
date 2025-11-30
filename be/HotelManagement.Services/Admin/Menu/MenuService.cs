using HotelManagement.Domain;
using HotelManagement.Domain.Entities;
using HotelManagement.Domain.Repositories;
using HotelManagement.Repository.Common;
using HotelManagement.Services.Common;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace HotelManagement.Services.Admin.Menu;

public class MenuService : IMenuService
{
    private readonly IRepository<MenuItem> _menuItemRepository;
    private readonly IRepository<ShoppingItem> _menuItemIngredientRepository;
    private readonly IUnitOfWork _unitOfWork;

    public MenuService(
        IRepository<MenuItem> menuItemRepository,
        IRepository<ShoppingItem> menuItemIngredientRepository,
        IUnitOfWork unitOfWork)
    {
        _menuItemRepository = menuItemRepository;
        _menuItemIngredientRepository = menuItemIngredientRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<List<MenuItemDto>>> GetMenuItemsAsync(MenuQueryDto query, Guid hotelId)
    {
        try
        {
            Expression<Func<MenuItem, bool>> filter = item => true;


            if (query.Category != null)
            {
                filter = filter.And(item => item.Category == query.Category);
            }

            if (query.SearchTerm != null)
            {
                filter = filter.And(item => item.Name.ToLower().Contains(query.SearchTerm.ToLower()));
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
                .Where(x => x.HotelId == hotelId)
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
     

            var menuItem = new MenuItem
            {
                Id = Guid.NewGuid(),
                Category = dto.Category,
                Name = dto.Name,
                Description = dto.Description,
                UnitPrice = dto.UnitPrice,
                ImageUrl = dto.ImageUrl,
                Status = dto.Status ?? MenuItemStatus.Available,
                IsActive = true,
                HotelId = dto.HotelId
            };

            await _menuItemRepository.AddAsync(menuItem);
            await _menuItemRepository.SaveChangesAsync();

            await _unitOfWork.SaveChangesAsync();

            // Reload the menu item with its relationships
            var createdMenuItem = await _menuItemRepository.Query()
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
                .FirstOrDefaultAsync(i => i.Id == id);

            if (menuItem == null)
            {
                return ApiResponse<MenuItemDto>.Fail("Menu item not found");
            }

            // Update properties if provided
            if (dto.Category != null) menuItem.Category = dto.Category;
            if (!string.IsNullOrEmpty(dto.Name)) menuItem.Name = dto.Name;
            if (!string.IsNullOrEmpty(dto.Description)) menuItem.Description = dto.Description;
            if (dto.UnitPrice.HasValue) menuItem.UnitPrice = dto.UnitPrice.Value;
            if (!string.IsNullOrEmpty(dto.ImageUrl)) menuItem.ImageUrl = dto.ImageUrl;
            if (dto.Status.HasValue) menuItem.Status = dto.Status.Value;
            if (dto.IsActive.HasValue) menuItem.IsActive = dto.IsActive.Value;

            await _menuItemRepository.UpdateAsync(menuItem);
            await _menuItemRepository.SaveChangesAsync();

           
            await _unitOfWork.SaveChangesAsync();

            // Reload the menu item with its relationships
            var updatedMenuItem = await _menuItemRepository.Query()
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

            await _menuItemRepository.RemoveAsync(menuItem);
            await _menuItemRepository.SaveChangesAsync();

            await _unitOfWork.SaveChangesAsync();

            return ApiResponse<bool>.Ok(true);
        }
        catch (Exception ex)
        {
            return ApiResponse<bool>.Fail($"Failed to delete menu item: {ex.Message}");
        }
    }


    private MenuItemDto MapToMenuItemDto(MenuItem menuItem)
    {
        return new MenuItemDto
        {
            Id = menuItem.Id,
            HotelId = menuItem.HotelId,
            Category = menuItem.Category,
            Name = menuItem.Name,
            Description = menuItem.Description,
            UnitPrice = menuItem.UnitPrice,
            ImageUrl = menuItem.ImageUrl,
            IsActive = menuItem.IsActive,
            Status = menuItem.Status,
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