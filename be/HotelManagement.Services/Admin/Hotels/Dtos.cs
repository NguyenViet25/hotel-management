namespace HotelManagement.Services.Admin.Hotels.Dtos;

public class HotelSummaryDto
{
    public Guid Id { get; set; }
    public string? Code { get; set; }
    public string? Name { get; set; }
    public string? Address { get; set; }
    public string? Reason { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }

    public HotelSummaryDto() { }

    public HotelSummaryDto(Guid id, string code, string name, string address, bool isActive, DateTime createdAt, string? reason, string? phone, string? email)
    {
        Id = id;
        Code = code;
        Name = name;
        Address = address;
        IsActive = isActive;
        CreatedAt = createdAt;
        Reason = reason;
        Phone = phone;
        Email = email;
    }

    public HotelSummaryDto(Guid id, string code, string name, string address, bool isActive, DateTime createdAt)
    {
        Id = id;
        Code = code;
        Name = name;
        Address = address;
        IsActive = isActive;
        CreatedAt = createdAt;
    }

    public HotelSummaryDto(Guid id, string code, string name, string address, bool isActive, DateTime createdAt, string? reason)
    {
        Id = id;
        Code = code;
        Name = name;
        Address = address;
        IsActive = isActive;
        CreatedAt = createdAt;
        Reason = reason;
    }
}
public class HotelDetailsDto
{
    public Guid Id { get; set; }
    public string? Code { get; set; }
    public string? Name { get; set; }
    public string? Address { get; set; }
    public string? Reason { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }

    public HotelDetailsDto() { }

    public HotelDetailsDto(Guid id, string code, string name, string address, bool isActive, DateTime createdAt, string? reason, string? phone, string? email)
    {
        Id = id;
        Code = code;
        Name = name;
        Address = address;
        IsActive = isActive;
        CreatedAt = createdAt;
        Reason = reason;
        Phone = phone;
        Email = email;
    }

    public HotelDetailsDto(Guid id, string code, string name, string address, bool isActive, DateTime createdAt)
    {
        Id = id;
        Code = code;
        Name = name;
        Address = address;
        IsActive = isActive;
        CreatedAt = createdAt;
    }

    public HotelDetailsDto(Guid id, string code, string name, string address, bool isActive, DateTime createdAt, string? reason)
    {
        Id = id;
        Code = code;
        Name = name;
        Address = address;
        IsActive = isActive;
        CreatedAt = createdAt;
        Reason = reason;
    }
}

public record HotelsQueryDto(
    int Page = 1,
    int PageSize = 20,
    string? Search = null,
    bool? IsActive = null,
    string? SortBy = "createdAt",
    string? SortDir = "desc"
);

public class CreateHotelDto
{
    public string? Code { get; set; }
    public string? Name { get; set; }
    public string? Address { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public object? Config { get; set; }

    public CreateHotelDto() { }

    public CreateHotelDto(string code, string name, string address, string? phone, string? email, object? config = null)
    {
        Code = code;
        Name = name;
        Address = address;
        Phone = phone;
        Email = email;
        Config = config;
    }
}
public class UpdateHotelDto
{
    public string? Name { get; set; }
    public string? Address { get; set; }
    public bool? IsActive { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }

    public UpdateHotelDto() { }

    public UpdateHotelDto(string? name, string? address, bool? isActive, string? phone, string? email)
    {
        Name = name;
        Address = address;
        IsActive = isActive;
        Phone = phone;
        Email = email;
    }
}

public record ChangeHotelStatusDto(string Action, string Reason, DateTimeOffset? Until = null);

public class HotelDefaultTimesDto
{
    public DateTime? DefaultCheckInTime { get; set; }
    public DateTime? DefaultCheckOutTime { get; set; }
}

public class UpdateHotelDefaultTimesDto
{
    public DateTime? DefaultCheckInTime { get; set; }
    public DateTime? DefaultCheckOutTime { get; set; }
}
