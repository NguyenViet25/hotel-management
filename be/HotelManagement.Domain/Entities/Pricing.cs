namespace HotelManagement.Domain;

public class RoomBasePrice
{
    public Guid Id { get; set; }
    public Guid HotelId { get; set; }
    public Guid RoomTypeId { get; set; }
    public decimal Price { get; set; }
}

public class RoomDayOfWeekPrice
{
    public Guid Id { get; set; }
    public Guid HotelId { get; set; }
    public Guid RoomTypeId { get; set; }
    public int DayOfWeek { get; set; } // 0-6
    public decimal Price { get; set; }
}

public class RoomDateRangePrice
{
    public Guid Id { get; set; }
    public Guid HotelId { get; set; }
    public Guid RoomTypeId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal Price { get; set; }
}

public class SurchargeRule
{
    public Guid Id { get; set; }
    public Guid HotelId { get; set; }
    public SurchargeType Type { get; set; }
    public decimal Amount { get; set; }
    public bool IsPercentage { get; set; }
}

public class DiscountRule
{
    public Guid Id { get; set; }
    public Guid HotelId { get; set; }
    public string Code { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public bool IsPercentage { get; set; }
    public DateTime? ValidFrom { get; set; }
    public DateTime? ValidTo { get; set; }
    public bool IsActive { get; set; } = true;
}