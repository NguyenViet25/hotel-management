namespace HotelManagement.Services.Admin.Hotels.Dtos;

public record HotelSummaryDto(Guid Id, string Code, string Name, string Address, bool IsActive, DateTime CreatedAt);
public record HotelDetailsDto(Guid Id, string Code, string Name, string Address, bool IsActive, DateTime CreatedAt);

public record HotelsQueryDto(
    int Page = 1,
    int PageSize = 20,
    string? Search = null,
    bool? IsActive = null,
    string? SortBy = "createdAt",
    string? SortDir = "desc"
);

public record CreateHotelDto(string Code, string Name, string Address, object? Config = null);
public record UpdateHotelDto(string? Name, string? Address, bool? IsActive);

public record ChangeHotelStatusDto(string Action, string Reason, DateTimeOffset? Until = null);