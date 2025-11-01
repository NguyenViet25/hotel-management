using System;

namespace HotelManagement.Services.Admin.Kitchen.Dtos;

public class OrderItemStatusDto
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public Guid MenuItemId { get; set; }
    public string MenuItemName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime UpdatedAt { get; set; }
}

public class UpdateOrderItemStatusRequest
{
    public string Status { get; set; } = string.Empty;
}

public class OrderItemStatusListResponse
{
    public List<OrderItemStatusDto> Items { get; set; } = new List<OrderItemStatusDto>();
    public int TotalCount { get; set; }
}