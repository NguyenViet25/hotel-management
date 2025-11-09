using HotelManagement.Domain.Entities;

namespace HotelManagement.Services.Profile.Dtos;

public record ProfileDto(
    Guid Id,
    string? UserName,
    string? Email,
    string? Fullname,
    string? PhoneNumber,
    IEnumerable<string> Roles,
    bool TwoFactorEnabled
);

public record UpdateProfileDto(
    string? Email,
    string? Fullname,
    string? PhoneNumber
);

public record ChangePasswordDto(
    string CurrentPassword,
    string NewPassword
);