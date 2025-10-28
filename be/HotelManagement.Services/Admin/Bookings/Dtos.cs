using HotelManagement.Domain;

namespace HotelManagement.Services.Admin.Bookings.Dtos;

// Request DTOs for UC-31: Create booking with deposit
public class CreateBookingDto
{
    public Guid HotelId { get; set; }
    public Guid RoomId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public Guid? PrimaryGuestId { get; set; } // If existing guest
    public CreateGuestDto? PrimaryGuest { get; set; } // If new guest
    public List<CreateGuestDto> AdditionalGuests { get; set; } = new();
    public decimal DepositAmount { get; set; }
    public CreateDepositPaymentDto? DepositPayment { get; set; }
    public string? Notes { get; set; }
}

public class CreateGuestDto
{
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? IdCardImageUrl { get; set; }
}

public class CreateDepositPaymentDto
{
    public decimal Amount { get; set; }
    public PaymentType Type { get; set; }
}

// Request DTOs for UC-32: Call confirmation
public class CreateCallLogDto
{
    public DateTime? CallTime { get; set; } // Default to now if not provided
    public CallResult Result { get; set; }
    public string? Notes { get; set; }
}

// Request DTOs for UC-33: Update/Cancel booking
public class UpdateBookingDto
{
    public Guid? RoomId { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public Guid? PrimaryGuestId { get; set; }
    public CreateGuestDto? PrimaryGuest { get; set; }
    public List<CreateGuestDto>? AdditionalGuests { get; set; }
    public decimal? DepositAmount { get; set; }
    public string? Notes { get; set; }
}

public class CancelBookingDto
{
    public string Reason { get; set; } = string.Empty;
    public decimal RefundAmount { get; set; }
    public PaymentType RefundType { get; set; }
    public decimal? DeductAmount { get; set; }
}

// Query DTOs
public class BookingsQueryDto
{
    public Guid? HotelId { get; set; }
    public BookingStatus? Status { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? GuestName { get; set; }
    public string? RoomNumber { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? SortBy { get; set; } = "createdAt";
    public string? SortDir { get; set; } = "desc";
}

// Response DTOs
public class BookingDto
{
    public Guid Id { get; set; }
    public Guid HotelId { get; set; }
    public string HotelName { get; set; } = string.Empty;
    public Guid RoomId { get; set; }
    public string RoomNumber { get; set; } = string.Empty;
    public string RoomTypeName { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public BookingStatus Status { get; set; }
    public decimal DepositAmount { get; set; }
    public DateTime CreatedAt { get; set; }
    public GuestDto? PrimaryGuest { get; set; }
    public List<GuestDto> AdditionalGuests { get; set; } = new();
    public int TotalGuests => (PrimaryGuest != null ? 1 : 0) + AdditionalGuests.Count;
    public List<CallLogDto> CallLogs { get; set; } = new();
    public List<PaymentDto> Payments { get; set; } = new();
}

public class BookingSummaryDto
{
    public Guid Id { get; set; }
    public Guid RoomId { get; set; }
    public string RoomNumber { get; set; } = string.Empty;
    public string RoomTypeName { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public BookingStatus Status { get; set; }
    public decimal DepositAmount { get; set; }
    public string PrimaryGuestName { get; set; } = string.Empty;
    public int TotalGuests { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class GuestDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? IdCardImageUrl { get; set; }
}

public class CallLogDto
{
    public Guid Id { get; set; }
    public DateTime CallTime { get; set; }
    public CallResult Result { get; set; }
    public string? Notes { get; set; }
    public string? StaffName { get; set; }
}

public class PaymentDto
{
    public Guid Id { get; set; }
    public decimal Amount { get; set; }
    public PaymentType Type { get; set; }
    public DateTime Timestamp { get; set; }
}

// UC-34: Room availability DTOs
public class RoomAvailabilityQueryDto
{
    public Guid HotelId { get; set; }
    public DateTime From { get; set; }
    public DateTime To { get; set; }
    public string Granularity { get; set; } = "day"; // "day" or "hour"
}

public class RoomAvailabilityDto
{
    public Guid RoomId { get; set; }
    public string RoomNumber { get; set; } = string.Empty;
    public int Floor { get; set; }
    public RoomStatus CurrentStatus { get; set; }
    public string RoomTypeName { get; set; } = string.Empty;
    public List<BookingIntervalDto> BookingIntervals { get; set; } = new();
}

public class BookingIntervalDto
{
    public DateTime Start { get; set; }
    public DateTime End { get; set; }
    public Guid BookingId { get; set; }
    public BookingStatus Status { get; set; }
    public string PrimaryGuestName { get; set; } = string.Empty;
    public decimal DepositAmount { get; set; }
}

// UC-35: Group booking DTOs
public class CreateGroupBookingDto
{
    public Guid HotelId { get; set; }
    public string? GroupCode { get; set; } // Auto-generated if not provided
    public CreateGuestDto PrimaryContact { get; set; } = new();
    public List<CreateGroupRoomDto> Rooms { get; set; } = new();
    public string? Notes { get; set; }
}

public class CreateGroupRoomDto
{
    public Guid RoomId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public Guid? PrimaryGuestId { get; set; }
    public CreateGuestDto? PrimaryGuest { get; set; }
    public List<CreateGuestDto> AdditionalGuests { get; set; } = new();
    public decimal DepositAmount { get; set; }
    public CreateDepositPaymentDto? DepositPayment { get; set; }
}

public class GroupBookingDto
{
    public Guid Id { get; set; }
    public string GroupCode { get; set; } = string.Empty;
    public Guid HotelId { get; set; }
    public string HotelName { get; set; } = string.Empty;
    public GuestDto PrimaryContact { get; set; } = new();
    public List<BookingSummaryDto> Bookings { get; set; } = new();
    public decimal TotalDepositAmount => Bookings.Sum(b => b.DepositAmount);
    public int TotalRooms => Bookings.Count;
    public int TotalGuests => Bookings.Sum(b => b.TotalGuests);
    public DateTime CreatedAt { get; set; }
    public string? Notes { get; set; }
}