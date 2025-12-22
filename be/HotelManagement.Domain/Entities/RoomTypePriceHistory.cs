using System;
namespace HotelManagement.Domain;

public class RoomTypePriceHistory
{
    public Guid Id { get; set; }
    public Guid RoomTypeId { get; set; }
    public DateTime Date { get; set; }
    public decimal Price { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Guid? UpdatedByUserId { get; set; }
    public string? UpdatedByUserName { get; set; }
}

