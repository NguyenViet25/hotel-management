namespace HotelManagement.Services.Admin.Audit.Dtos;

public record AuditLogDto(Guid Id, DateTime Timestamp, string Action, Guid? HotelId, Guid? UserId, object? Metadata);

public record AuditQueryDto(
    int Page = 1,
    int PageSize = 20,
    DateTimeOffset? From = null,
    DateTimeOffset? To = null,
    Guid? UserId = null,
    Guid? HotelId = null,
    string? Action = null
);