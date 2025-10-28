namespace HotelManagement.Services.Admin.Pricing.Dtos;

// Base Price DTOs
public class SetBasePriceDto
{
    public Guid HotelId { get; set; }
    public Guid RoomTypeId { get; set; }
    public decimal Price { get; set; }
}

public class BasePriceDto
{
    public Guid Id { get; set; }
    public Guid HotelId { get; set; }
    public Guid RoomTypeId { get; set; }
    public string RoomTypeName { get; set; } = string.Empty;
    public decimal Price { get; set; }
}

// Day of Week Price DTOs
public class SetDayOfWeekPriceDto
{
    public Guid HotelId { get; set; }
    public Guid RoomTypeId { get; set; }
    public int DayOfWeek { get; set; } // 0 = Sunday, 1 = Monday, etc.
    public decimal Price { get; set; }
}

public class DayOfWeekPriceDto
{
    public Guid Id { get; set; }
    public Guid HotelId { get; set; }
    public Guid RoomTypeId { get; set; }
    public string RoomTypeName { get; set; } = string.Empty;
    public int DayOfWeek { get; set; }
    public string DayName { get; set; } = string.Empty;
    public decimal Price { get; set; }
}

public class BulkDayOfWeekPriceDto
{
    public Guid HotelId { get; set; }
    public Guid RoomTypeId { get; set; }
    public List<DayPriceDto> DayPrices { get; set; } = new();
}

public class DayPriceDto
{
    public int DayOfWeek { get; set; }
    public decimal Price { get; set; }
}

// Date Range Price DTOs
public class CreateDateRangePriceDto
{
    public Guid HotelId { get; set; }
    public Guid RoomTypeId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal Price { get; set; }
    public string Description { get; set; } = string.Empty;
}

public class UpdateDateRangePriceDto
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal Price { get; set; }
    public string Description { get; set; } = string.Empty;
}

public class DateRangePriceDto
{
    public Guid Id { get; set; }
    public Guid HotelId { get; set; }
    public Guid RoomTypeId { get; set; }
    public string RoomTypeName { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal Price { get; set; }
    public string Description { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}

public class DateRangePriceQueryDto
{
    public Guid? HotelId { get; set; }
    public Guid? RoomTypeId { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}

// Surcharge Rule DTOs
public class CreateSurchargeRuleDto
{
    public Guid HotelId { get; set; }
    public int SurchargeType { get; set; } // 0 = EarlyCheckIn, 1 = LateCheckOut, 2 = ExtraGuest
    public decimal Amount { get; set; }
    public bool IsPercentage { get; set; }
}

public class UpdateSurchargeRuleDto
{
    public decimal Amount { get; set; }
    public bool IsPercentage { get; set; }
}

public class SurchargeRuleDto
{
    public Guid Id { get; set; }
    public Guid HotelId { get; set; }
    public int SurchargeType { get; set; }
    public string SurchargeTypeName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public bool IsPercentage { get; set; }
    public string DisplayAmount { get; set; } = string.Empty; // "50,000 VND" or "10%"
}

// Discount Rule DTOs
public class CreateDiscountRuleDto
{
    public Guid HotelId { get; set; }
    public string Code { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public bool IsPercentage { get; set; }
    public DateTime? ValidFrom { get; set; }
    public DateTime? ValidTo { get; set; }
    public string Description { get; set; } = string.Empty;
}

public class UpdateDiscountRuleDto
{
    public string Code { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public bool IsPercentage { get; set; }
    public DateTime? ValidFrom { get; set; }
    public DateTime? ValidTo { get; set; }
    public bool IsActive { get; set; }
    public string Description { get; set; } = string.Empty;
}

public class DiscountRuleDto
{
    public Guid Id { get; set; }
    public Guid HotelId { get; set; }
    public string Code { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public bool IsPercentage { get; set; }
    public DateTime? ValidFrom { get; set; }
    public DateTime? ValidTo { get; set; }
    public bool IsActive { get; set; }
    public string Description { get; set; } = string.Empty;
    public string DisplayAmount { get; set; } = string.Empty;
    public bool IsCurrentlyValid { get; set; }
}

public class DiscountRuleQueryDto
{
    public Guid? HotelId { get; set; }
    public string? Code { get; set; }
    public bool? IsActive { get; set; }
    public bool? OnlyValid { get; set; } // Only return currently valid discounts
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}

// Comprehensive Pricing DTOs
public class PricingOverviewDto
{
    public Guid RoomTypeId { get; set; }
    public string RoomTypeName { get; set; } = string.Empty;
    public decimal? BasePrice { get; set; }
    public List<DayOfWeekPriceDto> DayOfWeekPrices { get; set; } = new();
    public List<DateRangePriceDto> ActiveDateRangePrices { get; set; } = new();
    public List<SurchargeRuleDto> SurchargeRules { get; set; } = new();
}

public class PriceCalculationRequestDto
{
    public Guid HotelId { get; set; }
    public Guid RoomTypeId { get; set; }
    public DateTime CheckInDate { get; set; }
    public DateTime CheckOutDate { get; set; }
    public int GuestCount { get; set; } = 1;
    public string? DiscountCode { get; set; }
    public bool EarlyCheckIn { get; set; } = false;
    public bool LateCheckOut { get; set; } = false;
}

public class PriceCalculationResultDto
{
    public decimal BaseAmount { get; set; }
    public List<PriceBreakdownDto> Breakdown { get; set; } = new();
    public decimal SurchargeAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public string? DiscountCode { get; set; }
    public List<string> AppliedSurcharges { get; set; } = new();
}

public class PriceBreakdownDto
{
    public DateTime Date { get; set; }
    public string DayName { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string PriceSource { get; set; } = string.Empty; // "Base", "DayOfWeek", "DateRange"
}