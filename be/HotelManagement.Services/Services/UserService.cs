using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using HotelManagement.Domain.Entities;
using HotelManagement.Repositories.Interfaces;
using HotelManagement.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Services.Services
{
    public class UserService : IUserService
    {
        private readonly IUnitOfWork _unitOfWork;

        public UserService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<User>> GetAllUsersAsync()
        {
            return await _unitOfWork.Repository<User>().GetComplexAsync(
                disableTracking: true);
        }

        public async Task<User> GetUserByIdAsync(Guid id)
        {
            return await _unitOfWork.Repository<User>().GetByIdAsync(id);
        }

        public async Task<User> GetUserByUsernameAsync(string username)
        {
            return await _unitOfWork.Repository<User>().GetFirstOrDefaultAsync(
                predicate: u => u.Username == username);
        }

        public async Task<User> GetUserByEmailAsync(string email)
        {
            return await _unitOfWork.Repository<User>().GetFirstOrDefaultAsync(
                predicate: u => u.Email == email);
        }

        public async Task<bool> CreateUserAsync(User user, string password, string roleName)
        {
            // Check if username or email already exists
            var existingUser = await _unitOfWork.Repository<User>().GetFirstOrDefaultAsync(
                predicate: u => u.Username == user.Username || u.Email == user.Email);

            if (existingUser != null)
            {
                return false;
            }

            // Hash password
            user.PasswordHash = HashPassword(password);
            user.CreatedAt = DateTime.UtcNow;
            user.IsActive = true;

            await _unitOfWork.Repository<User>().AddAsync(user);

            // Assign role to user
            var role = await _unitOfWork.Repository<Role>().GetFirstOrDefaultAsync(
                predicate: r => r.Name == roleName);

            if (role == null)
            {
                // Create role if it doesn't exist
                role = new Role
                {
                    Name = roleName,
                    Description = $"Auto-created {roleName} role",
                    CreatedAt = DateTime.UtcNow
                };
                await _unitOfWork.Repository<Role>().AddAsync(role);
            }

            var userRole = new UserRole
            {
                UserId = user.Id,
                RoleId = role.Id,
                CreatedAt = DateTime.UtcNow
            };

            await _unitOfWork.Repository<UserRole>().AddAsync(userRole);

            return true;
        }

        public async Task<bool> UpdateUserAsync(User user)
        {
            user.UpdatedAt = DateTime.UtcNow;
            await _unitOfWork.Repository<User>().UpdateAsync(user);
            return true;
        }

        public async Task<bool> DeleteUserAsync(Guid id)
        {
            var user = await _unitOfWork.Repository<User>().GetByIdAsync(id);
            if (user == null)
            {
                return false;
            }

            await _unitOfWork.Repository<User>().SoftDeleteAsync(user);
            return true;
        }

        public async Task<bool> AssignRoleToUserAsync(Guid userId, string roleName)
        {
            var user = await _unitOfWork.Repository<User>().GetByIdAsync(userId);
            if (user == null)
            {
                return false;
            }

            var role = await _unitOfWork.Repository<Role>().GetFirstOrDefaultAsync(
                predicate: r => r.Name == roleName);

            if (role == null)
            {
                // Create role if it doesn't exist
                role = new Role
                {
                    Name = roleName,
                    Description = $"Auto-created {roleName} role",
                    CreatedAt = DateTime.UtcNow
                };
                await _unitOfWork.Repository<Role>().AddAsync(role);
            }

            // Check if user already has this role
            var existingUserRole = await _unitOfWork.Repository<UserRole>().GetFirstOrDefaultAsync(
                predicate: ur => ur.UserId == userId && ur.RoleId == role.Id);

            if (existingUserRole != null)
            {
                return true; // User already has this role
            }

            var userRole = new UserRole
            {
                UserId = userId,
                RoleId = role.Id,
                CreatedAt = DateTime.UtcNow
            };

            await _unitOfWork.Repository<UserRole>().AddAsync(userRole);
            return true;
        }

        public async Task<bool> RemoveRoleFromUserAsync(Guid userId, string roleName)
        {
            var role = await _unitOfWork.Repository<Role>().GetFirstOrDefaultAsync(
                predicate: r => r.Name == roleName);

            if (role == null)
            {
                return false;
            }

            var userRole = await _unitOfWork.Repository<UserRole>().GetFirstOrDefaultAsync(
                predicate: ur => ur.UserId == userId && ur.RoleId == role.Id);

            if (userRole == null)
            {
                return false;
            }

            await _unitOfWork.Repository<UserRole>().SoftDeleteAsync(userRole);
            return true;
        }

        public async Task<IEnumerable<Role>> GetUserRolesAsync(Guid userId)
        {
            var userRoles = await _unitOfWork.Repository<UserRole>().GetComplexAsync(
                predicate: ur => ur.UserId == userId,
                includes: new List<System.Linq.Expressions.Expression<Func<UserRole, object>>> { ur => ur.Role });

            return userRoles.Select(ur => ur.Role).ToList();
        }

        public async Task<bool> ActivateUserAsync(Guid id)
        {
            var user = await _unitOfWork.Repository<User>().GetByIdAsync(id);
            if (user == null)
            {
                return false;
            }

            user.IsActive = true;
            user.UpdatedAt = DateTime.UtcNow;
            await _unitOfWork.Repository<User>().UpdateAsync(user);
            return true;
        }

        public async Task<bool> DeactivateUserAsync(Guid id)
        {
            var user = await _unitOfWork.Repository<User>().GetByIdAsync(id);
            if (user == null)
            {
                return false;
            }

            user.IsActive = false;
            user.UpdatedAt = DateTime.UtcNow;
            await _unitOfWork.Repository<User>().UpdateAsync(user);
            return true;
        }

        #region Helper Methods

        private string HashPassword(string password)
        {
            using (var hmac = new HMACSHA512())
            {
                var salt = hmac.Key;
                var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));

                // Combine salt and hash
                var hashBytes = new byte[salt.Length + hash.Length];
                Array.Copy(salt, 0, hashBytes, 0, salt.Length);
                Array.Copy(hash, 0, hashBytes, salt.Length, hash.Length);

                return Convert.ToBase64String(hashBytes);
            }
        }

        #endregion
    }
}