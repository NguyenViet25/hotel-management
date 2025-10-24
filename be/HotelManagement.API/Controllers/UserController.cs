using HotelManagement.API.Responses;
using HotelManagement.Domain.Entities;
using HotelManagement.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HotelManagement.API.Models;

namespace HotelManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Administrator")]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserResponse>>> GetAllUsers()
        {
            var users = await _userService.GetAllUsersAsync();
            var response = new List<UserResponse>();

            foreach (var user in users)
            {
                var roles = await _userService.GetUserRolesAsync(user.Id);
                var roleNames = new List<string>();

                foreach (var role in roles)
                {
                    roleNames.Add(role.Name);
                }

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
                    UpdatedAt = user.UpdatedAt,
                    Roles = roleNames
                });
            }

            return Ok(response);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<UserResponse>> GetUserById(Guid id)
        {
            var user = await _userService.GetUserByIdAsync(id);

            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            var roles = await _userService.GetUserRolesAsync(user.Id);
            var roleNames = new List<string>();

            foreach (var role in roles)
            {
                roleNames.Add(role.Name);
            }

            var response = new UserResponse
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                IsActive = user.IsActive,
                LastLoginDate = user.LastLoginDate,
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt,
                Roles = roleNames
            };

            return Ok(response);
        }

        [HttpPost]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = new User
            {
                Username = request.Username,
                Email = request.Email,
                FirstName = request.FirstName,
                LastName = request.LastName
            };

            var result = await _userService.CreateUserAsync(user, request.Password, request.Role);

            if (!result)
            {
                return BadRequest(new { message = "Failed to create user. Username or email may already exist." });
            }

            return CreatedAtAction(nameof(GetUserById), new { id = user.Id }, new { id = user.Id });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UpdateUserRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await _userService.GetUserByIdAsync(id);

            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            user.FirstName = request.FirstName ?? user.FirstName;
            user.LastName = request.LastName ?? user.LastName;
            user.Email = request.Email ?? user.Email;

            var result = await _userService.UpdateUserAsync(user);

            if (!result)
            {
                return BadRequest(new { message = "Failed to update user" });
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            var result = await _userService.DeleteUserAsync(id);

            if (!result)
            {
                return NotFound(new { message = "User not found" });
            }

            return NoContent();
        }

        [HttpPost("{id}/roles")]
        public async Task<IActionResult> AssignRoleToUser(Guid id, [FromBody] AssignRoleRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _userService.AssignRoleToUserAsync(id, request.Role);

            if (!result)
            {
                return BadRequest(new { message = "Failed to assign role to user" });
            }

            return NoContent();
        }

        [HttpDelete("{id}/roles/{role}")]
        public async Task<IActionResult> RemoveRoleFromUser(Guid id, string role)
        {
            var result = await _userService.RemoveRoleFromUserAsync(id, role);

            if (!result)
            {
                return BadRequest(new { message = "Failed to remove role from user" });
            }

            return NoContent();
        }

        [HttpGet("{id}/roles")]
        public async Task<ActionResult<IEnumerable<string>>> GetUserRoles(Guid id)
        {
            var roles = await _userService.GetUserRolesAsync(id);
            var roleNames = new List<string>();

            foreach (var role in roles)
            {
                roleNames.Add(role.Name);
            }

            return Ok(roleNames);
        }

        [HttpPatch("{id}/activate")]
        public async Task<IActionResult> ActivateUser(Guid id)
        {
            var result = await _userService.ActivateUserAsync(id);

            if (!result)
            {
                return NotFound(new { message = "User not found" });
            }

            return NoContent();
        }

        [HttpPatch("{id}/deactivate")]
        public async Task<IActionResult> DeactivateUser(Guid id)
        {
            var result = await _userService.DeactivateUserAsync(id);

            if (!result)
            {
                return NotFound(new { message = "User not found" });
            }

            return NoContent();
        }
    }

 


}