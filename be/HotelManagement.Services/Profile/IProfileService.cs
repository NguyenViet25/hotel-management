using HotelManagement.Services.Profile.Dtos;

namespace HotelManagement.Services.Profile;

public interface IProfileService
{
    Task<ProfileDto?> GetAsync(Guid userId);
    Task<ProfileDto?> UpdateAsync(Guid userId, UpdateProfileDto dto);
    Task<bool> ChangePasswordAsync(Guid userId, ChangePasswordDto dto);
}