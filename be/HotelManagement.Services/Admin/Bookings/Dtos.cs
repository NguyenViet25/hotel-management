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
    public int? TotalRoom { get; set; }
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
    [Range(0, Double.MaxValue)]
    public decimal Deposit { get; set; }
    [Range(0, Double.MaxValue)]
    public decimal Discount { get; set; }

    [Range(0, Double.MaxValue)]
    public decimal Total { get; set; }
    [Range(0, Double.MaxValue)]
    public decimal Left { get; set; }

    [Required]
    public PrimaryGuestInfoDto PrimaryGuest { get; set; } = new();
    [Required]
    public List<CreateBookingRoomTypeDto> RoomTypes { get; set; } = new();
    public string? Notes { get; set; }
}

public class UpdateBookingDto : CreateBookingDto
{

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
    public string? IdCard { get; set; }
    public string? IdCardFrontImageUrl { get; set; }
    public string? IdCardBackImageUrl { get; set; }
}

public class BookingRoomDto
{
    public Guid BookingRoomId { get; set; }
    public Guid RoomId { get; set; }
    public string? RoomName { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public DateTime? ExtendedDate { get; set; }
    public DateTime? ActualCheckInAt { get; set; }
    public DateTime? ActualCheckOutAt { get; set; }
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
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
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
    public string? PrimaryGuestName { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Email { get; set; }
    public BookingStatus Status { get; set; }
    public decimal DepositAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal LeftAmount { get; set; }
    public decimal AdditionalAmount { get; set; }
    public decimal AdditionalBookingAmount { get; set; }
    public string? AdditionalNotes { get; set; }
    public string? AdditionalBookingNotes { get; set; }
    public string? PromotionCode { get; set; } 
    public decimal PromotionValue { get; set; }
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
    public int Floor { get; set; }
    public RoomStatus Status { get; set; } 
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

public class BookingsByHotelQueryDto
{
    public Guid? HotelId { get; set; }

}

public class BookingsQueryDto
{
    public Guid? HotelId { get; set; }
    public BookingStatus? Status { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? GuestName { get; set; }
    public string? RoomNumber { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? SortBy { get; set; }
    public string? SortDir { get; set; }
}

// Compact interval used by room schedule timeline
public class BookingIntervalDto
{
    public Guid BookingId { get; set; }
    public DateTime Start { get; set; }
    public DateTime End { get; set; }
    public BookingStatus Status { get; set; }
    public string? GuestName { get; set; }
}

public class RoomStayHistoryDto
{
    public Guid BookingId { get; set; }
    public Guid BookingRoomId { get; set; }
    public DateTime Start { get; set; }
    public DateTime End { get; set; }
    public BookingStatus Status { get; set; }
    public string? PrimaryGuestName { get; set; }
    public string? PrimaryGuestPhone { get; set; }
    public List<BookingGuestDto> Guests { get; set; } = new();
}

public class RoomAvailabilityQueryDto
{
    public Guid? HotelId { get; set; }
    public DateTime? From { get; set; }
    public DateTime? To { get; set; }
    public Guid? TypeId { get; set; }
}

public class CheckInDto
{
    public Guid RoomBookingId { get; set; }

    public List<PersonDto> Persons { get; set; } = [];
    public DateTime? ActualCheckInAt { get; set; }
}

public class PersonDto
{
    public required string Name { get; set; }
    public required string Phone { get; set; }
    public required string IdCardFrontImageUrl { get; set; }
    public required string IdCardBackImageUrl { get; set; }
    public required string IdCard { get; set; }
}

public class UpdateGuestDto
{
    public string? Fullname { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? IdCardFrontImageUrl { get; set; }
    public string? IdCardBackImageUrl { get; set; }
    public string? IdCard { get; set; }
}

public class ChangeRoomDto
{
    public Guid NewRoomId { get; set; }
}

public class ExtendStayDto
{
    public DateTime NewEndDate { get; set; }
    public string? DiscountCode { get; set; }
}

public class ExtendStayResultDto
{
    public BookingDetailsDto Booking { get; set; } = new();
    public decimal Price { get; set; }
}

public class CheckoutRequestDto
{
    public string? DiscountCode { get; set; }
    public string? Notes { get; set; }
    public string? AdditionalNotes { get; set; }
    public string? AdditionalBookingNotes { get; set; }
    public decimal? AdditionalAmount { get; set; } = 0;
    public decimal? AdditionalBookingAmount { get; set; } = 0;
    public PaymentDto? FinalPayment { get; set; }
    public DateTime? CheckoutTime { get; set; }
}

public class UpdateBookingRoomDatesDto
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
}

public class UpdateBookingRoomActualTimesDto
{
    public DateTime? ActualCheckInAt { get; set; }
    public DateTime? ActualCheckOutAt { get; set; }
}

public class MoveGuestDto
{
    public Guid TargetBookingRoomId { get; set; }
}

public class SwapGuestsDto
{
    public Guid TargetBookingRoomId { get; set; }
    public Guid TargetGuestId { get; set; }
}

public class PaymentDto
{
    public decimal Amount { get; set; }
    public PaymentType Type { get; set; }
}

public class CheckoutResultDto
{
    public decimal TotalPaid { get; set; }
    public BookingDetailsDto? Booking { get; set; }
    public DateTime? CheckoutTime { get; set; }
}

public class MinibarConsumptionItemDto
{
    public Guid MinibarId { get; set; }
    public int Quantity { get; set; }
}

public class MinibarConsumptionDto
{
    public List<MinibarConsumptionItemDto> Items { get; set; } = new();
}

public class AdditionalChargesDto
{
    public List<AdditionalChargeLineDto> Lines { get; set; } = new();
    public decimal Total { get; set; }
}

public class AdditionalChargeLineDto
{
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public InvoiceLineSourceType SourceType { get; set; }
}
