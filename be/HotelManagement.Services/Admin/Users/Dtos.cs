using HotelManagement.Domain;

namespace HotelManagement.Services.Admin.Users.Dtos;

public record UserPropertyRoleDto(Guid Id, Guid HotelId, UserRole Role);

public record AssignPropertyRoleDto(Guid HotelId, UserRole Role);

public record UserSummaryDto(
    Guid Id,
    string? UserName,
    string? Email,
    string? PhoneNumber,
    string? Fullname,
    bool EmailConfirmed,
    DateTimeOffset? LockedUntil,
    IEnumerable<string> Roles
);

public record UserDetailsDto(
    Guid Id,
    string? UserName,
    string? Email,
    string? PhoneNumber,
    bool EmailConfirmed,
    DateTimeOffset? LockedUntil,
    IEnumerable<string> Roles,
    IEnumerable<UserPropertyRoleDto> PropertyRoles
);

public record CreateUserDto(
    string UserName,
    string Email,
    string Fullname,
    string? PhoneNumber,
    IEnumerable<string>? Roles,
    IEnumerable<AssignPropertyRoleDto>? PropertyRoles
);

public record UpdateUserDto(
    string? FullName,
    string? Email,
    string? PhoneNumber,
    IEnumerable<string>? Roles,
    IEnumerable<AssignPropertyRoleDto>? PropertyRoles
);

public record LockUserDto(DateTimeOffset? LockedUntil);

public record ResetPasswordAdminDto(string NewPassword);

public record UsersQueryDto(
    int Page = 1,
    int PageSize = 20,
    string? Search = null,
    string? Role = null,
    bool? LockedOnly = null,
    bool? EmailConfirmed = null
);