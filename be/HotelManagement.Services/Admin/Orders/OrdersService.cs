using HotelManagement.Domain;
using HotelManagement.Repository.Common;
using HotelManagement.Services.Admin.Orders.Dtos;
using HotelManagement.Services.Common;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Services.Admin.Orders;

public class OrdersService : IOrdersService
{
    private readonly IRepository<Order> _orderRepository;
    private readonly IRepository<OrderItem> _orderItemRepository;
    private readonly IRepository<Hotel> _hotelRepository;
    private readonly IRepository<Booking> _bookingRepository;
    private readonly IRepository<MenuItem> _menuItemRepository;
    private readonly IRepository<DiscountRule> _discountRuleRepository;
    private readonly IRepository<Payment> _paymentRepository;

    public OrdersService(
        IRepository<Order> orderRepository,
        IRepository<OrderItem> orderItemRepository,
        IRepository<Hotel> hotelRepository,
        IRepository<Booking> bookingRepository,
        IRepository<MenuItem> menuItemRepository,
        IRepository<DiscountRule> discountRuleRepository,
        IRepository<Payment> paymentRepository)
    {
        _orderRepository = orderRepository;
        _orderItemRepository = orderItemRepository;
        _hotelRepository = hotelRepository;
        _bookingRepository = bookingRepository;
        _menuItemRepository = menuItemRepository;
        _discountRuleRepository = discountRuleRepository;
        _paymentRepository = paymentRepository;
    }

    public async Task<ApiResponse<List<OrderSummaryDto>>> ListAsync(OrdersQueryDto query)
    {
        try
        {
            var q = _orderRepository.Query()
                .Include(o => o.Items)
                .Where(x => true);

            if (query.HotelId.HasValue)
                q = q.Where(o => o.HotelId == query.HotelId.Value);

            if (query.Status.HasValue)
                q = q.Where(o => o.Status == query.Status.Value);

            if (query.BookingId.HasValue)
                q = q.Where(o => o.BookingId == query.BookingId.Value);

            if (query.IsWalkIn.HasValue)
                q = q.Where(o => o.IsWalkIn == query.IsWalkIn.Value);

            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                q = q.Where(o => (o.CustomerName ?? "").Contains(query.Search!) ||
                                  (o.CustomerPhone ?? "").Contains(query.Search!));
            }

            var items = await q
                .OrderByDescending(o => o.CreatedAt)
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToListAsync();

            var dtos = items.Select(o => new OrderSummaryDto
            {
                Id = o.Id,
                HotelId = o.HotelId,
                BookingId = o.BookingId,
                IsWalkIn = o.IsWalkIn,
                CustomerName = o.CustomerName,
                CustomerPhone = o.CustomerPhone,
                Status = o.Status,
                Notes = o.Notes,
                CreatedAt = o.CreatedAt,
                ItemsCount = o.Items.Count,
                ItemsTotal = o.Items.Where(i => i.Status != OrderItemStatus.Voided).Sum(i => i.UnitPrice * i.Quantity)
            }).ToList();

            return ApiResponse<List<OrderSummaryDto>>.Ok(dtos);
        }
        catch (Exception ex)
        {
            return ApiResponse<List<OrderSummaryDto>>.Fail($"Error listing orders: {ex.Message}");
        }
    }

    public async Task<ApiResponse<OrderDetailsDto>> GetByIdAsync(Guid id)
    {
        try
        {
            var o = await _orderRepository.Query()
                .Include(o => o.Items)
                .FirstOrDefaultAsync(o => o.Id == id);
            if (o == null) return ApiResponse<OrderDetailsDto>.Fail("Order not found");

            var itemIds = o.Items.Select(i => i.MenuItemId).ToList();
            var menuNames = await _menuItemRepository.Query()
                .Where(mi => itemIds.Contains(mi.Id))
                .Select(mi => new { mi.Id, mi.Name })
                .ToListAsync();
            var nameMap = menuNames.ToDictionary(x => x.Id, x => x.Name);

            var dto = new OrderDetailsDto
            {
                Id = o.Id,
                HotelId = o.HotelId,
                BookingId = o.BookingId,
                IsWalkIn = o.IsWalkIn,
                CustomerName = o.CustomerName,
                CustomerPhone = o.CustomerPhone,
                Status = o.Status,
                Notes = o.Notes,
                CreatedAt = o.CreatedAt,
                ItemsCount = o.Items.Count,
                ItemsTotal = o.Items.Where(i => i.Status != OrderItemStatus.Voided).Sum(i => i.UnitPrice * i.Quantity),
                Items = o.Items.Select(i => new OrderItemDto
                {
                    Id = i.Id,
                    MenuItemId = i.MenuItemId,
                    MenuItemName = nameMap.TryGetValue(i.MenuItemId, out var n) ? n : string.Empty,
                    Quantity = i.Quantity,
                    UnitPrice = i.UnitPrice,
                    Status = i.Status
                }).ToList()
            };

            return ApiResponse<OrderDetailsDto>.Ok(dto);
        }
        catch (Exception ex)
        {
            return ApiResponse<OrderDetailsDto>.Fail($"Error retrieving order: {ex.Message}");
        }
    }

    public async Task<ApiResponse<OrderDetailsDto>> CreateWalkInAsync(CreateWalkInOrderDto dto)
    {
        try
        {
            var hotel = await _hotelRepository.FindAsync(dto.HotelId);
            if (hotel == null) return ApiResponse<OrderDetailsDto>.Fail("Hotel not found");

            var order = new Order
            {
                Id = Guid.NewGuid(),
                HotelId = dto.HotelId,
                IsWalkIn = true,
                CustomerName = dto.CustomerName,
                CustomerPhone = dto.CustomerPhone,
                Status = OrderStatus.Draft,
                CreatedAt = DateTime.UtcNow
            };
            await _orderRepository.AddAsync(order);

            if (dto.Items != null && dto.Items.Any())
            {
                foreach (var item in dto.Items)
                {
                    var menu = await _menuItemRepository.Query().FirstOrDefaultAsync(mi => mi.Id == item.MenuItemId && mi.HotelId == dto.HotelId && mi.IsActive);
                    if (menu == null) return ApiResponse<OrderDetailsDto>.Fail("Menu item not found or inactive");

                    await _orderItemRepository.AddAsync(new OrderItem
                    {
                        Id = Guid.NewGuid(),
                        OrderId = order.Id,
                        MenuItemId = item.MenuItemId,
                        Quantity = item.Quantity,
                        UnitPrice = menu.UnitPrice,
                        Status = OrderItemStatus.Pending
                    });
                }
            }

            await _orderRepository.SaveChangesAsync();

            return await GetByIdAsync(order.Id);
        }
        catch (Exception ex)
        {
            return ApiResponse<OrderDetailsDto>.Fail($"Error creating walk-in order: {ex.Message}");
        }
    }

    public async Task<ApiResponse<OrderDetailsDto>> CreateForBookingAsync(CreateBookingOrderDto dto)
    {
        try
        {
            var booking = await _bookingRepository.Query().FirstOrDefaultAsync(b => b.Id == dto.BookingId && b.HotelId == dto.HotelId);
            if (booking == null) return ApiResponse<OrderDetailsDto>.Fail("Booking not found in hotel");

            var order = new Order
            {
                Id = Guid.NewGuid(),
                HotelId = dto.HotelId,
                BookingId = dto.BookingId,
                IsWalkIn = false,
                Notes = dto.Notes,
                Status = OrderStatus.Draft,
                CreatedAt = DateTime.UtcNow
            };
            await _orderRepository.AddAsync(order);

            if (dto.Items != null && dto.Items.Any())
            {
                foreach (var item in dto.Items)
                {
                    var menu = await _menuItemRepository.Query().FirstOrDefaultAsync(mi => mi.Id == item.MenuItemId && mi.HotelId == dto.HotelId && mi.IsActive);
                    if (menu == null) return ApiResponse<OrderDetailsDto>.Fail("Menu item not found or inactive");

                    await _orderItemRepository.AddAsync(new OrderItem
                    {
                        Id = Guid.NewGuid(),
                        OrderId = order.Id,
                        MenuItemId = item.MenuItemId,
                        Quantity = item.Quantity,
                        UnitPrice = menu.UnitPrice,
                        Status = OrderItemStatus.Pending
                    });
                }
            }

            await _orderRepository.SaveChangesAsync();

            return await GetByIdAsync(order.Id);
        }
        catch (Exception ex)
        {
            return ApiResponse<OrderDetailsDto>.Fail($"Error creating booking order: {ex.Message}");
        }
    }

    public async Task<ApiResponse<OrderDetailsDto>> UpdateAsync(Guid id, UpdateOrderDto dto)
    {
        try
        {
            var order = await _orderRepository.FindAsync(id);
            if (order == null) return ApiResponse<OrderDetailsDto>.Fail("Order not found");

            if (dto.Notes != null) order.Notes = dto.Notes;

            if (dto.Status.HasValue)
            {
                order.Status = dto.Status.Value;
            }

            await _orderRepository.UpdateAsync(order);
            await _orderRepository.SaveChangesAsync();
            return await GetByIdAsync(order.Id);
        }
        catch (Exception ex)
        {
            return ApiResponse<OrderDetailsDto>.Fail($"Error updating order: {ex.Message}");
        }
    }

    public async Task<ApiResponse<OrderDetailsDto>> AddItemAsync(Guid orderId, AddOrderItemDto dto)
    {
        try
        {
            var order = await _orderRepository.FindAsync(orderId);
            if (order == null) return ApiResponse<OrderDetailsDto>.Fail("Order not found");

            var menu = await _menuItemRepository.Query().FirstOrDefaultAsync(mi => mi.Id == dto.MenuItemId && mi.HotelId == order.HotelId && mi.IsActive);
            if (menu == null) return ApiResponse<OrderDetailsDto>.Fail("Menu item not found or inactive");

            await _orderItemRepository.AddAsync(new OrderItem
            {
                Id = Guid.NewGuid(),
                OrderId = orderId,
                MenuItemId = dto.MenuItemId,
                Quantity = dto.Quantity,
                UnitPrice = menu.UnitPrice,
                Status = OrderItemStatus.Pending
            });

            await _orderRepository.SaveChangesAsync();
            return await GetByIdAsync(orderId);
        }
        catch (Exception ex)
        {
            return ApiResponse<OrderDetailsDto>.Fail($"Error adding order item: {ex.Message}");
        }
    }

    public async Task<ApiResponse<OrderDetailsDto>> UpdateItemAsync(Guid orderId, Guid itemId, UpdateOrderItemDto dto)
    {
        try
        {
            var item = await _orderItemRepository.Query().FirstOrDefaultAsync(i => i.Id == itemId && i.OrderId == orderId);
            if (item == null) return ApiResponse<OrderDetailsDto>.Fail("Order item not found");

            if (dto.Quantity.HasValue && dto.Quantity.Value > 0)
                item.Quantity = dto.Quantity.Value;

            if (dto.Status.HasValue)
                item.Status = dto.Status.Value;

            if (dto.ProposedReplacementMenuItemId.HasValue)
                item.ProposedReplacementMenuItemId = dto.ProposedReplacementMenuItemId.Value;

            if (dto.ReplacementConfirmedByGuest.HasValue)
                item.ReplacementConfirmedByGuest = dto.ReplacementConfirmedByGuest.Value;

            await _orderItemRepository.UpdateAsync(item);
            await _orderItemRepository.SaveChangesAsync();
            return await GetByIdAsync(orderId);
        }
        catch (Exception ex)
        {
            return ApiResponse<OrderDetailsDto>.Fail($"Error updating order item: {ex.Message}");
        }
    }

    public async Task<ApiResponse<OrderDetailsDto>> RemoveItemAsync(Guid orderId, Guid itemId)
    {
        try
        {
            var item = await _orderItemRepository.Query().FirstOrDefaultAsync(i => i.Id == itemId && i.OrderId == orderId);
            if (item == null) return ApiResponse<OrderDetailsDto>.Fail("Order item not found");

            if (item.Status != OrderItemStatus.Pending && item.Status != OrderItemStatus.Voided)
                return ApiResponse<OrderDetailsDto>.Fail("Only pending or voided items can be removed");

            await _orderItemRepository.RemoveAsync(item);
            await _orderItemRepository.SaveChangesAsync();
            return await GetByIdAsync(orderId);
        }
        catch (Exception ex)
        {
            return ApiResponse<OrderDetailsDto>.Fail($"Error removing order item: {ex.Message}");
        }
    }

    public async Task<ApiResponse<decimal>> ApplyDiscountAsync(Guid orderId, ApplyDiscountDto dto)
    {
        try
        {
            var order = await _orderRepository.FindAsync(orderId);
            if (order == null) return ApiResponse<decimal>.Fail("Order not found");
            if (order.HotelId != dto.HotelId) return ApiResponse<decimal>.Fail("Order does not belong to hotel");

            var itemsTotal = await _orderItemRepository.Query()
                .Where(i => i.OrderId == orderId && i.Status != OrderItemStatus.Voided)
                .SumAsync(i => i.UnitPrice * i.Quantity);

            var rule = await _discountRuleRepository.Query()
                .FirstOrDefaultAsync(dr => dr.HotelId == dto.HotelId && dr.Code == dto.Code && dr.IsActive &&
                    (dr.ValidFrom == null || dr.ValidFrom <= DateTime.UtcNow) &&
                    (dr.ValidTo == null || dr.ValidTo >= DateTime.UtcNow));

            if (rule == null) return ApiResponse<decimal>.Fail("Invalid or inactive discount code");

            var discountAmount = rule.IsPercentage ? Math.Round(itemsTotal * (rule.Amount / 100m), 2) : rule.Amount;
            if (discountAmount > itemsTotal) discountAmount = itemsTotal;

            return ApiResponse<decimal>.Ok(discountAmount, meta: new { code = dto.Code, percentage = rule.IsPercentage, amount = rule.Amount, itemsTotal, discountedTotal = itemsTotal - discountAmount });
        }
        catch (Exception ex)
        {
            return ApiResponse<decimal>.Fail($"Error applying discount: {ex.Message}");
        }
    }
}