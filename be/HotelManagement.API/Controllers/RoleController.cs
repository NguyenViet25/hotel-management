using HotelManagement.API.Responses;
using HotelManagement.Domain.Entities;
using HotelManagement.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HotelManagement.API.Models;

namespace HotelManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Administrator")]
    public class RoleController : ControllerBase
    {
        private readonly IRoleService _roleService;

        public RoleController(IRoleService roleService)
        {
            _roleService = roleService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<RoleResponse>>> GetAllRoles()
        {
            var roles = await _roleService.GetAllRolesAsync();
            var response = new List<RoleResponse>();

            foreach (var role in roles)
            {
                response.Add(new RoleResponse
                {
                    Id = role.Id,
                    Name = role.Name,
                    Description = role.Description,
                    CreatedAt = role.CreatedAt,
                    UpdatedAt = role.UpdatedAt
                });
            }

            return Ok(response);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<RoleResponse>> GetRoleById(Guid id)
        {
            var role = await _roleService.GetRoleByIdAsync(id);

            if (role == null)
            {
                return NotFound(new { message = "Role not found" });
            }

            var response = new RoleResponse
            {
                Id = role.Id,
                Name = role.Name,
                Description = role.Description,
                CreatedAt = role.CreatedAt,
                UpdatedAt = role.UpdatedAt
            };

            return Ok(response);
        }

        [HttpGet("name/{name}")]
        public async Task<ActionResult<RoleResponse>> GetRoleByName(string name)
        {
            var role = await _roleService.GetRoleByNameAsync(name);

            if (role == null)
            {
                return NotFound(new { message = "Role not found" });
            }

            var response = new RoleResponse
            {
                Id = role.Id,
                Name = role.Name,
                Description = role.Description,
                CreatedAt = role.CreatedAt,
                UpdatedAt = role.UpdatedAt
            };

            return Ok(response);
        }

        [HttpPost]
        public async Task<IActionResult> CreateRole([FromBody] CreateRoleRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var role = new Role
            {
                Name = request.Name,
                Description = request.Description
            };

            var result = await _roleService.CreateRoleAsync(role);

            if (!result)
            {
                return BadRequest(new { message = "Failed to create role. Role name may already exist." });
            }

            return CreatedAtAction(nameof(GetRoleById), new { id = role.Id }, new { id = role.Id });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRole(Guid id, [FromBody] UpdateRoleRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var role = await _roleService.GetRoleByIdAsync(id);

            if (role == null)
            {
                return NotFound(new { message = "Role not found" });
            }

            role.Description = request.Description ?? role.Description;

            var result = await _roleService.UpdateRoleAsync(role);

            if (!result)
            {
                return BadRequest(new { message = "Failed to update role" });
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRole(Guid id)
        {
            var result = await _roleService.DeleteRoleAsync(id);

            if (!result)
            {
                return BadRequest(new { message = "Failed to delete role. The role may be assigned to users." });
            }

            return NoContent();
        }

        [HttpGet("{name}/users")]
        public async Task<ActionResult<IEnumerable<UserResponse>>> GetUsersInRole(string name)
        {
            var users = await _roleService.GetUsersInRoleAsync(name);
            var response = new List<UserResponse>();

            foreach (var user in users)
            {
                response.Add(new UserResponse
                {
                    Id = user.Id,
                    Username = user.Username,
                    Email = user.Email,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    IsActive = user.IsActive,
                    LastLoginDate = user.LastLoginDate,
                    CreatedAt = user.CreatedAt,
                    UpdatedAt = user.UpdatedAt
                });
            }

            return Ok(response);
        }
    }

    public class RoleResponse
    {
        public Guid Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

}