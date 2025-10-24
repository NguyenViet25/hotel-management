using HotelManagement.API.Controllers;
using HotelManagement.API.Responses;
using HotelManagement.Domain.Entities;
using HotelManagement.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Xunit;

namespace HotelManagement.Tests.Controllers
{
    public class UserControllerTests
    {
        private readonly Mock<IUserService> _mockUserService;
        private readonly UserController _controller;

        public UserControllerTests()
        {
            _mockUserService = new Mock<IUserService>();
            _controller = new UserController(_mockUserService.Object);

            // Setup controller context
            var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.Name, "testuser"),
                new Claim(ClaimTypes.Role, "Administrator")
            }));

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };
        }

        [Fact]
        public async Task GetAllUsers_ShouldReturnOkResult_WithListOfUsers()
        {
            // Arrange
            var users = new List<User>
            {
                new User
                {
                    Id = Guid.NewGuid(),
                    Username = "user1",
                    Email = "user1@example.com",
                    FirstName = "John",
                    LastName = "Doe",
                    IsActive = true
                },
                new User
                {
                    Id = Guid.NewGuid(),
                    Username = "user2",
                    Email = "user2@example.com",
                    FirstName = "Jane",
                    LastName = "Smith",
                    IsActive = true
                }
            };

            _mockUserService.Setup(service => service.GetAllUsersAsync())
                .ReturnsAsync(users);

            _mockUserService.Setup(service => service.GetUserRolesAsync(It.IsAny<Guid>()))
                .ReturnsAsync(new List<Role> { new Role { Name = "User" } });

            // Act
            var result = await _controller.GetAllUsers();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnValue = Assert.IsType<List<UserResponse>>(okResult.Value);
            Assert.Equal(2, returnValue.Count);
            Assert.Equal("user1", returnValue[0].Username);
            Assert.Equal("user2", returnValue[1].Username);
        }

        [Fact]
        public async Task GetUserById_ShouldReturnOkResult_WhenUserExists()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var user = new User
            {
                Id = userId,
                Username = "testuser",
                Email = "test@example.com",
                FirstName = "Test",
                LastName = "User",
                IsActive = true
            };

            _mockUserService.Setup(service => service.GetUserByIdAsync(userId))
                .ReturnsAsync(user);

            _mockUserService.Setup(service => service.GetUserRolesAsync(userId))
                .ReturnsAsync(new List<Role> { new Role { Name = "User" } });

            // Act
            var result = await _controller.GetUserById(userId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnValue = Assert.IsType<UserResponse>(okResult.Value);
            Assert.Equal(userId, returnValue.Id);
            Assert.Equal("testuser", returnValue.Username);
            Assert.Equal("test@example.com", returnValue.Email);
        }

        [Fact]
        public async Task GetUserById_ShouldReturnNotFound_WhenUserDoesNotExist()
        {
            // Arrange
            var userId = Guid.NewGuid();

            _mockUserService.Setup(service => service.GetUserByIdAsync(userId))
                .ReturnsAsync((User)null);

            // Act
            var result = await _controller.GetUserById(userId);

            // Assert
            Assert.IsType<NotFoundResult>(result.Result);
        }

        [Fact]
        public async Task CreateUser_ShouldReturnCreatedAtAction_WhenUserIsCreated()
        {
            // Arrange
            var createRequest = new CreateUserRequest
            {
                Username = "newuser",
                Email = "newuser@example.com",
                Password = "Password123!",
                FirstName = "New",
                LastName = "User",
                RoleName = "User"
            };

            var newUser = new User
            {
                Id = Guid.NewGuid(),
                Username = createRequest.Username,
                Email = createRequest.Email,
                FirstName = createRequest.FirstName,
                LastName = createRequest.LastName,
                IsActive = true
            };

            _mockUserService.Setup(service => service.CreateUserAsync(It.IsAny<User>(), createRequest.Password, createRequest.RoleName))
                .ReturnsAsync(true);

            _mockUserService.Setup(service => service.GetUserByUsernameAsync(createRequest.Username))
                .ReturnsAsync(newUser);

            // Act
            var result = await _controller.CreateUser(createRequest);

            // Assert
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result);
            Assert.Equal(nameof(_controller.GetUserById), createdAtActionResult.ActionName);
            var returnValue = Assert.IsType<UserResponse>(createdAtActionResult.Value);
            Assert.Equal(newUser.Id, returnValue.Id);
            Assert.Equal(createRequest.Username, returnValue.Username);
        }
    }

    // Mock response classes to match the ones in the controller

}