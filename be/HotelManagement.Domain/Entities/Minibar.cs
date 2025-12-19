namespace HotelManagement.Domain;

public class Minibar
{
    public Guid Id { get; set; }
    public Guid HotelId { get; set; }
    public Guid RoomTypeId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Quantity { get; set; }
    public Hotel Hotel { get; set; } = null!;
    public RoomType? RoomType { get; set; }
}

public class MinibarBooking
{
    public Guid Id { get; set; }
    public Guid MinibarId { get; set; }
    public Guid BookingId { get; set; }
    public Guid HouseKeepingTaskId { get; set; }
    public int ComsumedQuantity { get; set; }
    public int OriginalQuantity { get; set; }
    public MinibarBookingStatus MinibarBookingStatus { get; set; }
    public Booking? Booking { get; set; }
    public Minibar? Minibar { get; set; }
}

public enum MinibarBookingStatus
{
    NeedEvaluation = 0,
    Missing = 1,
    Full = 2,
}