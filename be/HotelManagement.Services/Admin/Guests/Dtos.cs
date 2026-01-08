using HotelManagement.Domain;
namespace HotelManagement.Services.Admin.Guests;

public class GuestsQueryDto
{
    public string? Name { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? IdCard { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? SortBy { get; set; } = "createdAt";
    public string? SortDir { get; set; } = "desc";
}

public class GuestSummaryDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string IdCard { get; set; } = string.Empty;
}

public class GuestDetailsDto : GuestSummaryDto
{
    public string? IdCardFrontImageUrl { get; set; }
    public string? IdCardBackImageUrl { get; set; }
    public List<GuestRoomStayDto> Rooms { get; set; } = new();
    public List<GuestOrderDto> Orders { get; set; } = new();
}

public class GuestRoomStayDto
{
    public Guid BookingRoomId { get; set; }
    public Guid RoomId { get; set; }
    public string? RoomNumber { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public BookingRoomStatus Status { get; set; }
    public Guid BookingId { get; set; }
}

public class GuestOrderDto
{
    public Guid OrderId { get; set; }
    public Guid? BookingId { get; set; }
    public OrderStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<GuestOrderItemDto> Items { get; set; } = new();
}

public class GuestOrderItemDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public OrderItemStatus Status { get; set; }
}
public class CreateGuestDto
{
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string IdCard { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? IdCardFrontImageUrl { get; set; }
    public string? IdCardBackImageUrl { get; set; }
}

public class UpdateGuestDto
{
    public string? FullName { get; set; }
    public string? Phone { get; set; }
    public string? IdCard { get; set; }
    public string? Email { get; set; }
    public string? IdCardFrontImageUrl { get; set; }
    public string? IdCardBackImageUrl { get; set; }
}
