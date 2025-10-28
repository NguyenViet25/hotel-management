namespace HotelManagement.Domain;

public class Booking
{
    public Guid Id { get; set; }
    public Guid HotelId { get; set; }
    public Guid RoomId { get; set; }
    public Guid? PrimaryGuestId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public BookingStatus Status { get; set; } = BookingStatus.Pending;
    public decimal DepositAmount { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Hotel? Hotel { get; set; }
    public Room? Room { get; set; }
    public Guest? PrimaryGuest { get; set; }
    public ICollection<BookingGuest> Guests { get; set; } = new List<BookingGuest>();
    public ICollection<CallLog> CallLogs { get; set; } = new List<CallLog>();
}

public class BookingGuest
{
    public Guid BookingId { get; set; }
    public Guid GuestId { get; set; }
    public Booking? Booking { get; set; }
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