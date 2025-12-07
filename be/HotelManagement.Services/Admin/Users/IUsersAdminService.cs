using HotelManagement.Services.Admin.Users.Dtos;

namespace HotelManagement.Services.Admin.Users;

public interface IUsersAdminService
{
    Task<(IEnumerable<UserSummaryDto> Items, int Total)> ListAsync(UsersQueryDto query);
    Task<IEnumerable<UserSummaryDto>> ListByRoleAsync(UserByRoleQuery query);
    Task<UserDetailsDto?> GetAsync(Guid id);
    Task<UserDetailsDto> CreateAsync(CreateUserDto dto);
    Task<UserDetailsDto?> UpdateAsync(Guid id, UpdateUserDto dto);
    Task<bool> LockAsync(Guid id, LockUserDto dto);
    Task<bool> UnLockAsync(Guid id, LockUserDto dto);
    Task<bool> ResetPasswordAsync(Guid id, ResetPasswordAdminDto dto);
    Task<UserPropertyRoleDto?> AssignPropertyRoleAsync(Guid id, AssignPropertyRoleDto dto);
    Task<bool> RemovePropertyRoleAsync(Guid id, Guid propertyRoleId);
}