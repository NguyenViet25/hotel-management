using System;
using System.Collections.Generic;

namespace HotelManagement.Services.Admin.Room.Dtos;

public class MinibarItemDto
{
    public Guid Id { get; set; }
    public Guid RoomId { get; set; }
    public string RoomNumber { get; set; } = string.Empty;
    public Guid? BookingId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Quantity { get; set; }
    public int Consumed { get; set; }
    public int Available => Quantity - Consumed;
    public DateTime LastRestockedAt { get; set; }
    public DateTime? LastConsumedAt { get; set; }
}

public class CreateMinibarItemRequest
{
    public Guid HotelId { get; set; }
    public Guid RoomId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Quantity { get; set; }
}

public class UpdateMinibarItemRequest
{
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Quantity { get; set; }
}

public class RecordConsumptionRequest
{
    public Guid MinibarItemId { get; set; }
    public int ConsumedQuantity { get; set; }
    public Guid? BookingId { get; set; }
}

public class RestockMinibarRequest
{
    public Guid RoomId { get; set; }
    public List<MinibarItemRestock> Items { get; set; } = new List<MinibarItemRestock>();
}

public class MinibarItemRestock
{
    public Guid MinibarItemId { get; set; }
    public int NewQuantity { get; set; }
}

public class MinibarListResponse
{
    public List<MinibarItemDto> Items { get; set; } = new List<MinibarItemDto>();
    public int TotalCount { get; set; }
}