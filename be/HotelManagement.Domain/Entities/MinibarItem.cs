using System;

namespace HotelManagement.Domain;

public class MinibarItem
{
    public Guid Id { get; set; }
    public Guid HotelId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Quantity { get; set; }
    public Hotel Hotel { get; set; } = null!;
}

public class MinibarItemBooking
{
    public Guid Id { get; set; }
    public Guid HotelId { get; set; }
    public Guid RoomId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int ComsumedQuantity { get; set; }
    public int OriginalQuantity { get; set; }
    public Hotel Hotel { get; set; } = null!;
    public HotelRoom Room { get; set; } = null!;
    public Booking? Booking { get; set; }
}