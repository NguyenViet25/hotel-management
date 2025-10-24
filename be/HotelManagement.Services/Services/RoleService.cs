using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HotelManagement.Domain.Entities;
using HotelManagement.Repositories.Interfaces;
using HotelManagement.Services.Interfaces;

namespace HotelManagement.Services.Services
{
    public class RoleService : IRoleService
    {
        private readonly IUnitOfWork _unitOfWork;

        public RoleService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<Role>> GetAllRolesAsync()
        {
            return await _unitOfWork.Repository<Role>().GetComplexAsync(
                disableTracking: true);
        }

        public async Task<Role> GetRoleByIdAsync(Guid id)
        {
            return await _unitOfWork.Repository<Role>().GetByIdAsync(id);
        }

        public async Task<Role> GetRoleByNameAsync(string name)
        {
            return await _unitOfWork.Repository<Role>().GetFirstOrDefaultAsync(
                predicate: r => r.Name == name);
        }

        public async Task<bool> CreateRoleAsync(Role role)
        {
            // Check if role with the same name already exists
            var existingRole = await _unitOfWork.Repository<Role>().GetFirstOrDefaultAsync(
                predicate: r => r.Name == role.Name);

            if (existingRole != null)
            {
                return false;
            }

            role.CreatedAt = DateTime.UtcNow;
            await _unitOfWork.Repository<Role>().AddAsync(role);
            return true;
        }

        public async Task<bool> UpdateRoleAsync(Role role)
        {
            role.UpdatedAt = DateTime.UtcNow;
            await _unitOfWork.Repository<Role>().UpdateAsync(role);
            return true;
        }

        public async Task<bool> DeleteRoleAsync(Guid id)
        {
            var role = await _unitOfWork.Repository<Role>().GetByIdAsync(id);
            if (role == null)
            {
                return false;
            }

            // Check if there are any users with this role
            var userRoles = await _unitOfWork.Repository<UserRole>().GetAsync(
                predicate: ur => ur.RoleId == id);

            if (userRoles.Any())
            {
                // Cannot delete a role that is assigned to users
                return false;
            }

            await _unitOfWork.Repository<Role>().SoftDeleteAsync(role);
            return true;
        }

        public async Task<IEnumerable<User>> GetUsersInRoleAsync(string roleName)
        {
            var role = await _unitOfWork.Repository<Role>().GetFirstOrDefaultAsync(
                predicate: r => r.Name == roleName);

            if (role == null)
            {
                return new List<User>();
            }

            var userRoles = await _unitOfWork.Repository<UserRole>().GetComplexAsync(
                predicate: ur => ur.RoleId == role.Id,
                includes: new List<System.Linq.Expressions.Expression<Func<UserRole, object>>> { ur => ur.User });

            return userRoles.Select(ur => ur.User).ToList();
        }
    }
}