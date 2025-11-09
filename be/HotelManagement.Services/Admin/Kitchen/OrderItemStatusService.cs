using HotelManagement.Domain;
using HotelManagement.Domain.Repositories;
using HotelManagement.Repository.Common;
using HotelManagement.Services.Admin.Kitchen.Dtos;
using HotelManagement.Services.Common;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Services.Admin.Kitchen;

public class OrderItemStatusService : IOrderItemStatusService
{
    private readonly IRepository<OrderItem> _orderItemRepository;
    private readonly IRepository<MenuItem> _menuItemRepository;
    private readonly IUnitOfWork _unitOfWork;

    public OrderItemStatusService(
        IRepository<OrderItem> orderItemRepository,
        IRepository<MenuItem> menuItemRepository,
        IUnitOfWork unitOfWork)
    {
        _orderItemRepository = orderItemRepository;
        _menuItemRepository = menuItemRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<OrderItemStatusDto>> UpdateOrderItemStatusAsync(Guid orderItemId, UpdateOrderItemStatusRequest request)
    {
        var orderItem = await _orderItemRepository.FindAsync(orderItemId);
        if (orderItem == null)
        {
            return ApiResponse<OrderItemStatusDto>.Fail("Order item not found");
        }

        if (Enum.TryParse<OrderItemStatus>(request.Status, true, out var status))
        {
            orderItem.Status = status;
            await _orderItemRepository.UpdateAsync(orderItem);
            await _unitOfWork.SaveChangesAsync();
            
            return ApiResponse<OrderItemStatusDto>.Success(await MapToDto(orderItem));
        }
        
        return ApiResponse<OrderItemStatusDto>.Fail("Invalid status value");
    }

    public async Task<ApiResponse<OrderItemStatusListResponse>> GetPendingOrderItemsAsync(Guid hotelId, int page = 1, int pageSize = 10)
    {
        var query = _orderItemRepository.Query()
            .Where(oi => oi.Status == OrderItemStatus.Pending)
            .Join(_menuItemRepository.Query().Where(mi => mi.HotelId == hotelId),
                oi => oi.MenuItemId,
                mi => mi.Id,
                (oi, mi) => new { OrderItem = oi, MenuItem = mi });

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderBy(x => x.OrderItem.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var dtos = items.Select(x => new OrderItemStatusDto
        {
            Id = x.OrderItem.Id,
            OrderId = x.OrderItem.OrderId,
            MenuItemId = x.OrderItem.MenuItemId,
            MenuItemName = x.MenuItem.Name,
            Quantity = x.OrderItem.Quantity,
            Status = x.OrderItem.Status.ToString(),
            UpdatedAt = DateTime.UtcNow
        }).ToList();

        return ApiResponse<OrderItemStatusListResponse>.Success(new OrderItemStatusListResponse
        {
            Items = dtos,
            TotalCount = totalCount
        });
    }

    public async Task<ApiResponse<OrderItemStatusListResponse>> GetOrderItemsByStatusAsync(Guid hotelId, string status, int page = 1, int pageSize = 10)
    {
        if (!Enum.TryParse<OrderItemStatus>(status, true, out var orderItemStatus))
        {
            return ApiResponse<OrderItemStatusListResponse>.Fail("Invalid status value");
        }

        var query = _orderItemRepository.Query()
            .Where(oi => oi.Status == orderItemStatus)
            .Join(_menuItemRepository.Query().Where(mi => mi.HotelId == hotelId),
                oi => oi.MenuItemId,
                mi => mi.Id,
                (oi, mi) => new { OrderItem = oi, MenuItem = mi });

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderBy(x => x.OrderItem.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var dtos = items.Select(x => new OrderItemStatusDto
        {
            Id = x.OrderItem.Id,
            OrderId = x.OrderItem.OrderId,
            MenuItemId = x.OrderItem.MenuItemId,
            MenuItemName = x.MenuItem.Name,
            Quantity = x.OrderItem.Quantity,
            Status = x.OrderItem.Status.ToString(),
            UpdatedAt = DateTime.UtcNow
        }).ToList();

        return ApiResponse<OrderItemStatusListResponse>.Success(new OrderItemStatusListResponse
        {
            Items = dtos,
            TotalCount = totalCount
        });
    }

    private async Task<OrderItemStatusDto> MapToDto(OrderItem orderItem)
    {
        var menuItem = await _menuItemRepository.FindAsync(orderItem.MenuItemId);
        
        return new OrderItemStatusDto
        {
            Id = orderItem.Id,
            OrderId = orderItem.OrderId,
            MenuItemId = orderItem.MenuItemId,
            MenuItemName = menuItem?.Name ?? "Unknown",
            Quantity = orderItem.Quantity,
            Status = orderItem.Status.ToString(),
            UpdatedAt = DateTime.UtcNow
        };
    }
}