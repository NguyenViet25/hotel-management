using System.ComponentModel.DataAnnotations;

namespace HotelManagement.Domain;

public class Booking
{
    public Guid Id { get; set; }
    public Guid HotelIdKey { get; set; }
    public Guid? PrimaryGuestId { get; set; }
    public BookingStatus Status { get; set; } = BookingStatus.Pending;
    public decimal DepositAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal LeftAmount { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public Hotel? Hotel { get; set; }
    public Guest? PrimaryGuest { get; set; }
    public string? Notes { get; set; }
    public ICollection<BookingRoomType> BookingRoomTypes { get; set; } = new List<BookingRoomType>();
    public ICollection<CallLog>? CallLogs { get; set; } = new List<CallLog>();
}

public class BookingRoomType
{
    [Key]
    public Guid BookingRoomTypeId { get; set; }
    public Guid BookingIdKey { get; set; }
    public Guid RoomTypeId { get; set; }
    public string? RoomTypeName { get; set; }
    public int Capacity { get; set; }
    public decimal Price { get; set; }
    public int TotalRoom { get; set; }
    public ICollection<BookingRoom> BookingRooms { get; set; } = [];
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }

    public Booking? Booking{ get; set; }
    public RoomType? RoomType { get; set; }
}

public class BookingRoom
{
    [Key]
    public Guid BookingRoomId { get; set; }
    public Guid RoomId { get; set; }
    public Guid BookingRoomTypeIdKey { get; set; }
    public string? RoomName { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public BookingRoomStatus BookingStatus { get; set; } = BookingRoomStatus.Pending;
    public ICollection<BookingGuest>? Guests { get; set; } = new List<BookingGuest>();
    public HotelRoom? HotelRoom { get; set; }
    public BookingRoomType? BookingRoomType { get; set; }
}


public class BookingGuest
{
    public Guid BookingRoomId { get; set; }
    public Guid GuestId { get; set; }
    public BookingRoom? BookingRoom { get; set; }
    public Guest? Guest { get; set; }
}

public class CallLog
{
    public Guid Id { get; set; }
    public Guid BookingId { get; set; }
    public DateTime CallTime { get; set; }
    public CallResult Result { get; set; }
    public string? Notes { get; set; }
    public Guid? StaffUserId { get; set; }
}