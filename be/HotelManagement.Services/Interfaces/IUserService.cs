using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HotelManagement.Domain.Entities;

namespace HotelManagement.Services.Interfaces
{
    public interface IUserService
    {
        Task<IEnumerable<User>> GetAllUsersAsync();
        Task<User> GetUserByIdAsync(Guid id);
        Task<User> GetUserByUsernameAsync(string username);
        Task<User> GetUserByEmailAsync(string email);
        Task<bool> CreateUserAsync(User user, string password, string roleName);
        Task<bool> UpdateUserAsync(User user);
        Task<bool> DeleteUserAsync(Guid id);
        Task<bool> AssignRoleToUserAsync(Guid userId, string roleName);
        Task<bool> RemoveRoleFromUserAsync(Guid userId, string roleName);
        Task<IEnumerable<Role>> GetUserRolesAsync(Guid userId);
        Task<bool> ActivateUserAsync(Guid id);
        Task<bool> DeactivateUserAsync(Guid id);
    }
}