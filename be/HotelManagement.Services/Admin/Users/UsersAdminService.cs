using HotelManagement.Domain;
using HotelManagement.Domain.Entities;
using HotelManagement.Repository;
using HotelManagement.Services.Admin.Users.Dtos;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Services.Admin.Users;

public class UsersAdminService : IUsersAdminService
{
    private readonly ApplicationDbContext _db;
    private readonly UserManager<AppUser> _users;
    private readonly RoleManager<IdentityRole<Guid>> _roles;

    public UsersAdminService(ApplicationDbContext db, UserManager<AppUser> users, RoleManager<IdentityRole<Guid>> roles)
    {
        _db = db;
        _users = users;
        _roles = roles;
    }

    public async Task<(IEnumerable<UserSummaryDto> Items, int Total)> ListAsync(UsersQueryDto query)
    {
        var q = _users.Users.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var s = query.Search.Trim();
            q = q.Where(u => (u.UserName != null && u.UserName.Contains(s)) ||
                             (u.Email != null && u.Email.Contains(s)) ||
                             (u.PhoneNumber != null && u.PhoneNumber.Contains(s)));
        }
        if (query.EmailConfirmed.HasValue)
        {
            q = q.Where(u => u.EmailConfirmed == query.EmailConfirmed.Value);
        }
        if (query.LockedOnly == true)
        {
            var now = DateTimeOffset.UtcNow;
            q = q.Where(u => u.LockoutEnd != null && u.LockoutEnd > now);
        }

        // Optional filter by Identity role name
        if (!string.IsNullOrWhiteSpace(query.Role))
        {
            var role = await _roles.FindByNameAsync(query.Role.Trim());
            if (role != null)
            {
                var userIdsInRole = await _db.UserRoles
                    .Where(ur => ur.RoleId == role.Id)
                    .Select(ur => ur.UserId)
                    .Distinct()
                    .ToListAsync();
                q = q.Where(u => userIdsInRole.Contains(u.Id));
            }
        }

        var total = await q.CountAsync();
        var page = Math.Max(1, query.Page);
        var pageSize = Math.Clamp(query.PageSize, 1, 200);
        var users = await q.OrderBy(u => u.UserName).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

        // Load roles in batch
        var userIds = users.Select(u => u.Id).ToList();
        var userRolePairs = await _db.UserRoles
            .Where(ur => userIds.Contains(ur.UserId))
            .Join(_db.Roles, ur => ur.RoleId, r => r.Id, (ur, r) => new { ur.UserId, r.Name })
            .ToListAsync();
        var rolesByUser = userRolePairs.GroupBy(x => x.UserId).ToDictionary(g => g.Key, g => g.Select(x => x.Name ?? string.Empty).ToList());

        var items = users.Select(u => new UserSummaryDto(
            u.Id,
            u.UserName,
            u.Email,
            u.PhoneNumber,
            u.EmailConfirmed,
            u.LockoutEnd,
            rolesByUser.TryGetValue(u.Id, out var r) ? r : Array.Empty<string>()
        ));

        return (items, total);
    }

    public async Task<UserDetailsDto?> GetAsync(Guid id)
    {
        var u = await _users.Users.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
        if (u == null) return null;
        var roles = await _db.UserRoles.Where(ur => ur.UserId == id).Join(_db.Roles, ur => ur.RoleId, r => r.Id, (ur, r) => r.Name ?? string.Empty).ToListAsync();
        var propertyRoles = await _db.UserPropertyRoles.Where(pr => pr.UserId == id).AsNoTracking().Select(pr => new UserPropertyRoleDto(pr.Id, pr.HotelId, pr.Role)).ToListAsync();
        return new UserDetailsDto(u.Id, u.UserName, u.Email, u.PhoneNumber, u.EmailConfirmed, u.LockoutEnd, roles, propertyRoles);
    }

    public async Task<UserDetailsDto> CreateAsync(CreateUserDto dto)
    {
        var user = new AppUser
        {
            UserName = dto.UserName,
            Email = dto.Email,
            PhoneNumber = dto.PhoneNumber,
            EmailConfirmed = false
        };
        var result = await _users.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
        {
            var msg = string.Join("; ", result.Errors.Select(e => e.Description));
            throw new InvalidOperationException($"Create user failed: {msg}");
        }

        // Assign Identity roles if provided
        if (dto.Roles != null)
        {
            foreach (var roleName in dto.Roles.Where(r => !string.IsNullOrWhiteSpace(r)))
            {
                var role = await _roles.FindByNameAsync(roleName);
                if (role == null)
                {
                    await _roles.CreateAsync(new IdentityRole<Guid> { Name = roleName });
                }
            }
            await _users.AddToRolesAsync(user, dto.Roles.Where(r => !string.IsNullOrWhiteSpace(r)));
        }

        // Assign property roles
        if (dto.PropertyRoles != null)
        {
            foreach (var pr in dto.PropertyRoles)
            {
                _db.UserPropertyRoles.Add(new UserPropertyRole
                {
                    Id = Guid.NewGuid(),
                    HotelId = pr.HotelId,
                    UserId = user.Id,
                    Role = pr.Role
                });
            }
            await _db.SaveChangesAsync();
        }

        return (await GetAsync(user.Id))!;
    }

    public async Task<UserDetailsDto?> UpdateAsync(Guid id, UpdateUserDto dto)
    {
        var user = await _users.FindByIdAsync(id.ToString());
        if (user == null) return null;

        if (dto.Email != null) user.Email = dto.Email;
        if (dto.PhoneNumber != null) user.PhoneNumber = dto.PhoneNumber;
        var updateRes = await _users.UpdateAsync(user);
        if (!updateRes.Succeeded)
        {
            var msg = string.Join("; ", updateRes.Errors.Select(e => e.Description));
            throw new InvalidOperationException($"Update user failed: {msg}");
        }

        if (dto.Roles != null)
        {
            var currentRoles = await _users.GetRolesAsync(user);
            var desired = dto.Roles.Where(r => !string.IsNullOrWhiteSpace(r)).Distinct().ToArray();
            // Ensure roles exist
            foreach (var roleName in desired)
            {
                if (await _roles.FindByNameAsync(roleName) == null)
                    await _roles.CreateAsync(new IdentityRole<Guid> { Name = roleName });
            }
            var toAdd = desired.Except(currentRoles).ToArray();
            var toRemove = currentRoles.Except(desired).ToArray();
            if (toRemove.Length > 0) await _users.RemoveFromRolesAsync(user, toRemove);
            if (toAdd.Length > 0) await _users.AddToRolesAsync(user, toAdd);
        }

        if (dto.PropertyRoles != null)
        {
            // Replace property roles with provided set
            var existing = await _db.UserPropertyRoles.Where(pr => pr.UserId == user.Id).ToListAsync();
            _db.UserPropertyRoles.RemoveRange(existing);
            foreach (var pr in dto.PropertyRoles)
            {
                _db.UserPropertyRoles.Add(new UserPropertyRole
                {
                    Id = Guid.NewGuid(),
                    HotelId = pr.HotelId,
                    UserId = user.Id,
                    Role = pr.Role
                });
            }
            await _db.SaveChangesAsync();
        }

        return await GetAsync(user.Id);
    }

    public async Task<bool> LockAsync(Guid id, LockUserDto dto)
    {
        var user = await _users.FindByIdAsync(id.ToString());
        if (user == null) return false;
        var res = await _users.SetLockoutEndDateAsync(user, dto.LockedUntil);
        return res.Succeeded;
    }

    public async Task<bool> ResetPasswordAsync(Guid id, ResetPasswordAdminDto dto)
    {
        var user = await _users.FindByIdAsync(id.ToString());
        if (user == null) return false;
        var token = await _users.GeneratePasswordResetTokenAsync(user);
        var res = await _users.ResetPasswordAsync(user, token, dto.NewPassword);
        return res.Succeeded;
    }

    public async Task<UserPropertyRoleDto?> AssignPropertyRoleAsync(Guid id, AssignPropertyRoleDto dto)
    {
        var userExists = await _users.FindByIdAsync(id.ToString());
        if (userExists == null) return null;

        var duplicate = await _db.UserPropertyRoles.AnyAsync(pr => pr.UserId == id && pr.HotelId == dto.HotelId && pr.Role == dto.Role);
        if (duplicate) return null;

        var upr = new UserPropertyRole
        {
            Id = Guid.NewGuid(),
            HotelId = dto.HotelId,
            UserId = id,
            Role = dto.Role
        };
        _db.UserPropertyRoles.Add(upr);
        await _db.SaveChangesAsync();
        return new UserPropertyRoleDto(upr.Id, upr.HotelId, upr.Role);
    }

    public async Task<bool> RemovePropertyRoleAsync(Guid id, Guid propertyRoleId)
    {
        var upr = await _db.UserPropertyRoles.FirstOrDefaultAsync(pr => pr.Id == propertyRoleId && pr.UserId == id);
        if (upr == null) return false;
        _db.UserPropertyRoles.Remove(upr);
        await _db.SaveChangesAsync();
        return true;
    }
}