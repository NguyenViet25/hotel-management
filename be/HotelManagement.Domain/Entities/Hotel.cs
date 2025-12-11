namespace HotelManagement.Domain;

public class Hotel
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public DateTime? DefaultCheckInTime { get; set; }
    public DateTime? DefaultCheckOutTime { get; set; }
    public decimal? VAT { get; set; }
    public ICollection<RoomType> RoomTypes { get; set; } = new List<RoomType>();
    public ICollection<HotelRoom> Rooms { get; set; } = new List<HotelRoom>();
}