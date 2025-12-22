namespace HotelManagement.Services.Admin.RoomTypes.Dtos;

// Request DTOs
public class CreateRoomTypeDto
{
    public Guid HotelId { get; set; }
    public int Capacity { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal PriceFrom { get; set; }
    public decimal PriceTo { get; set; }
    public List<PriceByDate>? PriceByDates { get; set; } = [];
    public string? ImageUrl { get; set; }
}

public class PriceByDate
{
    public DateTime Date { get; set; }
    public decimal Price { get; set; }
}

public class UpdateRoomTypeDto : CreateRoomTypeDto
{
}

public class UpdatePriceByDateDto
{
    public DateTime Date { get; set; }
    public decimal Price { get; set; }
}

public class RoomTypeQueryDto
{
    public Guid? HotelId { get; set; }
    public string? SearchTerm { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}

// Response DTOs
public class RoomTypeDto
{
    public Guid Id { get; set; }
    public Guid HotelId { get; set; }
    public string HotelName { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public int RoomCount { get; set; }
    public bool CanDelete { get; set; }
    public decimal PriceFrom { get; set; }
    public decimal PriceTo { get; set; }
    public List<PriceByDate>? PriceByDates { get; set; } = [];
}

public class RoomTypeDetailDto : RoomTypeDto
{
    public List<RoomDto> Rooms { get; set; } = new();
    public PricingInfoDto? PricingInfo { get; set; }
}

public class RoomDto
{
    public Guid Id { get; set; }
    public string Number { get; set; } = string.Empty;
    public int Floor { get; set; }
    public string Status { get; set; } = string.Empty;
}

public class PricingInfoDto
{
    public decimal? BasePrice { get; set; }
    public List<DayOfWeekPriceDto> DayOfWeekPrices { get; set; } = new();
    public List<DateRangePriceDto> DateRangePrices { get; set; } = new();
}

public class DayOfWeekPriceDto
{
    public int DayOfWeek { get; set; } // 0 = Sunday, 1 = Monday, etc.
    public string DayName { get; set; } = string.Empty;
    public decimal Price { get; set; }
}

public class DateRangePriceDto
{
    public Guid Id { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal Price { get; set; }
    public string Description { get; set; } = string.Empty;
}

public class RoomTypePriceHistoryDto
{
    public Guid Id { get; set; }
    public Guid RoomTypeId { get; set; }
    public DateTime Date { get; set; }
    public decimal Price { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Guid? UpdatedByUserId { get; set; }
    public string? UpdatedByUserName { get; set; }
}
