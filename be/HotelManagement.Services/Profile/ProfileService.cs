using HotelManagement.Domain.Entities;
using HotelManagement.Services.Profile.Dtos;
using Microsoft.AspNetCore.Identity;

namespace HotelManagement.Services.Profile;

public class ProfileService : IProfileService
{
    private readonly UserManager<AppUser> _users;

    public ProfileService(UserManager<AppUser> users)
    {
        _users = users;
    }

    public async Task<ProfileDto?> GetAsync(Guid userId)
    {
        var user = await _users.FindByIdAsync(userId.ToString());
        if (user == null) return null;
        var roles = await _users.GetRolesAsync(user);
        var twoFactor = await _users.GetTwoFactorEnabledAsync(user);
        return new ProfileDto(user.Id, user.UserName, user.Email, user.Fullname, user.PhoneNumber, roles, twoFactor);
    }

    public async Task<ProfileDto?> UpdateAsync(Guid userId, UpdateProfileDto dto)
    {
        var user = await _users.FindByIdAsync(userId.ToString());
        if (user == null) return null;
        if (dto.Email != null) user.Email = dto.Email;
        if (dto.Fullname != null) user.Fullname = dto.Fullname;
        if (dto.PhoneNumber != null) user.PhoneNumber = dto.PhoneNumber;
        var result = await _users.UpdateAsync(user);
        if (!result.Succeeded) return null;
        var roles = await _users.GetRolesAsync(user);
        var twoFactor = await _users.GetTwoFactorEnabledAsync(user);
        return new ProfileDto(user.Id, user.UserName, user.Email, user.Fullname, user.PhoneNumber, roles, twoFactor);
    }

    public async Task<bool> ChangePasswordAsync(Guid userId, ChangePasswordDto dto)
    {
        var user = await _users.FindByIdAsync(userId.ToString());
        if (user == null) return false;
        var result = await _users.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);
        return result.Succeeded;
    }
}