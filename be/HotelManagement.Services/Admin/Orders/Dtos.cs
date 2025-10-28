using HotelManagement.Domain;
using System.ComponentModel.DataAnnotations;

namespace HotelManagement.Services.Admin.Orders.Dtos;

public class OrdersQueryDto
{
    public Guid? HotelId { get; set; }
    public OrderStatus? Status { get; set; }
    public Guid? BookingId { get; set; }
    public bool? IsWalkIn { get; set; }
    public string? Search { get; set; } // name/phone
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

public class OrderItemInputDto
{
    [Required]
    public Guid MenuItemId { get; set; }
    [Range(1, 1000)]
    public int Quantity { get; set; }
}

public class CreateWalkInOrderDto
{
    [Required]
    public Guid HotelId { get; set; }
    [Required]
    [StringLength(100)]
    public string CustomerName { get; set; } = string.Empty;
    [StringLength(20)]
    public string? CustomerPhone { get; set; }
    public List<OrderItemInputDto>? Items { get; set; }
}

public class CreateBookingOrderDto
{
    [Required]
    public Guid HotelId { get; set; }
    [Required]
    public Guid BookingId { get; set; }
    public string? Notes { get; set; }
    public List<OrderItemInputDto>? Items { get; set; }
}

public class UpdateOrderDto
{
    public string? Notes { get; set; }
    public OrderStatus? Status { get; set; }
}

public class AddOrderItemDto
{
    [Required]
    public Guid MenuItemId { get; set; }
    [Range(1, 1000)]
    public int Quantity { get; set; }
}

public class UpdateOrderItemDto
{
    public int? Quantity { get; set; }
    public OrderItemStatus? Status { get; set; }
    public Guid? ProposedReplacementMenuItemId { get; set; }
    public bool? ReplacementConfirmedByGuest { get; set; }
}

public class ApplyDiscountDto
{
    [Required]
    public Guid HotelId { get; set; }
    [Required]
    public string Code { get; set; } = string.Empty;
}

public class OrderItemDto
{
    public Guid Id { get; set; }
    public Guid MenuItemId { get; set; }
    public string MenuItemName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public OrderItemStatus Status { get; set; }
}

public class OrderSummaryDto
{
    public Guid Id { get; set; }
    public Guid HotelId { get; set; }
    public Guid? BookingId { get; set; }
    public bool IsWalkIn { get; set; }
    public string? CustomerName { get; set; }
    public string? CustomerPhone { get; set; }
    public OrderStatus Status { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public int ItemsCount { get; set; }
    public decimal ItemsTotal { get; set; }
}

public class OrderDetailsDto : OrderSummaryDto
{
    public List<OrderItemDto> Items { get; set; } = new();
}