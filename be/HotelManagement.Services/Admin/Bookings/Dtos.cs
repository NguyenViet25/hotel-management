using HotelManagement.Domain;
using System.ComponentModel.DataAnnotations;

namespace HotelManagement.Services.Admin.Bookings.Dtos;

public class PrimaryGuestInfoDto
{
    [Required]
    [StringLength(128)]
    public string Fullname { get; set; } = string.Empty;
    [Phone]
    [StringLength(32)]
    public string? Phone { get; set; }
    [EmailAddress]
    public string? Email { get; set; }
}

public class CreateBookingRoomGuestDto
{
    public Guid? GuestId { get; set; }
    public string? Fullname { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
}

public class CreateBookingRoomDto
{
    [Required]
    public Guid RoomId { get; set; }
    [Required]
    public DateTime StartDate { get; set; }
    [Required]
    public DateTime EndDate { get; set; }
    public List<CreateBookingRoomGuestDto>? Guests { get; set; }
}

public class CreateBookingRoomTypeDto
{
    [Required]
    public Guid RoomTypeId { get; set; }
    public decimal? Price { get; set; }
    public int? Capacity { get; set; }
    [Required]
    public DateTime StartDate { get; set; }
    [Required]
    public DateTime EndDate { get; set; }
    public List<CreateBookingRoomDto> Rooms { get; set; } = new();
}

public class CreateBookingDto
{
    [Required]
    public Guid HotelId { get; set; }
    [Required]
    [Range(0, 100000000)]
    public decimal Deposit { get; set; }
    [Range(0, 100000000)]
    public decimal Discount { get; set; }

    [Range(0, 100000000)]
    public decimal Total { get; set; }
    [Range(0, 100000000)]
    public decimal Left { get; set; }

    [Required]
    public PrimaryGuestInfoDto PrimaryGuest { get; set; } = new();
    [Required]
    public List<CreateBookingRoomTypeDto> RoomTypes { get; set; } = new();
    public string? Notes { get; set; }
}

public class UpdateBookingDto
{
    public decimal? Deposit { get; set; }
    public decimal? Discount { get; set; }
    public BookingStatus? Status { get; set; }
    public string? Notes { get; set; }
    public List<CreateBookingRoomTypeDto>? RoomTypes { get; set; }
}

public class AddCallLogDto
{
    [Required]
    public DateTime CallTime { get; set; }
    [Required]
    public CallResult Result { get; set; }
    public string? Notes { get; set; }
    public Guid? StaffUserId { get; set; }
}

public class BookingGuestDto
{
    public Guid GuestId { get; set; }
    public string? Fullname { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
}

public class BookingRoomDto
{
    public Guid BookingRoomId { get; set; }
    public Guid RoomId { get; set; }
    public string? RoomName { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public BookingRoomStatus BookingStatus { get; set; }
    public List<BookingGuestDto> Guests { get; set; } = new();
}

public class BookingRoomTypeDto
{
    public Guid BookingRoomTypeId { get; set; }
    public Guid RoomTypeId { get; set; }
    public string? RoomTypeName { get; set; }
    public int Capacity { get; set; }
    public decimal Price { get; set; }
    public int TotalRoom { get; set; }
    public List<BookingRoomDto> BookingRooms { get; set; } = new();
}

public class CallLogDto
{
    public Guid Id { get; set; }
    public DateTime CallTime { get; set; }
    public CallResult Result { get; set; }
    public string? Notes { get; set; }
    public Guid? StaffUserId { get; set; }
}

public class BookingDetailsDto
{
    public Guid Id { get; set; }
    public Guid HotelId { get; set; }
    public Guid? PrimaryGuestId { get; set; }
    public BookingStatus Status { get; set; }
    public decimal DepositAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal LeftAmount { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? Notes { get; set; }
    public List<BookingRoomTypeDto> BookingRoomTypes { get; set; } = new();
    public List<CallLogDto> CallLogs { get; set; } = new();
}

public class RoomMapItemDto
{
    public Guid RoomId { get; set; }
    public string RoomNumber { get; set; } = string.Empty;
    public Guid RoomTypeId { get; set; }
    public string RoomTypeName { get; set; } = string.Empty;
    public List<RoomTimelineSegmentDto> Timeline { get; set; } = new();
}

public class RoomTimelineSegmentDto
{
    public DateTime Start { get; set; }
    public DateTime End { get; set; }
    public string Status { get; set; } = string.Empty; // Available/Booked
    public Guid? BookingId { get; set; }
}

public class RoomMapQueryDto
{
    [Required]
    public DateTime Date { get; set; }
    public Guid? HotelId { get; set; }
}