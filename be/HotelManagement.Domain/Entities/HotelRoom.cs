namespace HotelManagement.Domain;

public class HotelRoom
{
    public Guid Id { get; set; }
    public Guid HotelId { get; set; }
    public Guid RoomTypeId { get; set; }
    public string Number { get; set; } = string.Empty;
    public int Floor { get; set; }
    public RoomStatus Status { get; set; } = RoomStatus.Available;

    public Hotel? Hotel { get; set; }
    public RoomType? RoomType { get; set; }
    public ICollection<RoomStatusLog> StatusLogs { get; set; } = new List<RoomStatusLog>();
    public ICollection<BookingRoom> BookingRooms { get; set; } = new List<BookingRoom>();
}