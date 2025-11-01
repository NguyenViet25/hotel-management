using System;

namespace HotelManagement.Domain;

public class MinibarItem
{
    public Guid Id { get; set; }
    public Guid HotelId { get; set; }
    public Guid RoomId { get; set; }
    public Guid? BookingId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Quantity { get; set; }
    public int Consumed { get; set; }
    public DateTime LastRestockedAt { get; set; }
    public DateTime? LastConsumedAt { get; set; }
    
    // Navigation properties
    public Hotel Hotel { get; set; } = null!;
    public HotelRoom Room { get; set; } = null!;
    public Booking? Booking { get; set; }
}