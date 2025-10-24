using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using HotelManagement.API.Controllers;
using HotelManagement.Domain.Entities;
using HotelManagement.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace HotelManagement.Tests.Controllers
{
    public class RoomControllerTests
    {
        private readonly Mock<IRoomService> _mockRoomService;
        private readonly RoomController _controller;

        public RoomControllerTests()
        {
            _mockRoomService = new Mock<IRoomService>();
            _controller = new RoomController(_mockRoomService.Object);

            // Setup controller context with manager role
            var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.Name, "manager"),
                new Claim(ClaimTypes.Role, "Manager")
            }));

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };
        }

        [Fact]
        public async Task GetAllRooms_ShouldReturnOkResult_WithListOfRooms()
        {
            // Arrange
            var rooms = new List<Room>
            {
                new Room
                {
                    Id = Guid.NewGuid(),
                    RoomNumber = "101",
                    Floor = 1,
                    Status = Domain.Enums.RoomStatus.Available,
                    PropertyId = Guid.NewGuid(),
                    RoomTypeId = Guid.NewGuid()
                },
                new Room
                {
                    Id = Guid.NewGuid(),
                    RoomNumber = "102",
                    Floor = 1,
                    Status = Domain.Enums.RoomStatus.Available,
                    PropertyId = Guid.NewGuid(),
                    RoomTypeId = Guid.NewGuid()
                }
            };

            _mockRoomService.Setup(service => service.GetAllRoomsAsync())
                .ReturnsAsync(rooms);

            // Act
            var result = await _controller.GetAllRooms();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnValue = Assert.IsAssignableFrom<IEnumerable<Room>>(okResult.Value);
            Assert.Equal(2, ((List<Room>)returnValue).Count);
        }

        [Fact]
        public async Task GetRoomById_ShouldReturnOkResult_WhenRoomExists()
        {
            // Arrange
            var roomId = Guid.NewGuid();
            var room = new Room
            {
                Id = roomId,
                RoomNumber = "101",
                Floor = 1,
                Status =Domain.Enums.RoomStatus.Available,
                PropertyId = Guid.NewGuid(),
                RoomTypeId = Guid.NewGuid()
            };

            _mockRoomService.Setup(service => service.GetRoomByIdAsync(roomId))
                .ReturnsAsync(room);

            // Act
            var result = await _controller.GetRoomById(roomId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnValue = Assert.IsType<Room>(okResult.Value);
            Assert.Equal(roomId, returnValue.Id);
            Assert.Equal("101", returnValue.RoomNumber);
        }

        [Fact]
        public async Task GetRoomById_ShouldReturnNotFound_WhenRoomDoesNotExist()
        {
            // Arrange
            var roomId = Guid.NewGuid();

            _mockRoomService.Setup(service => service.GetRoomByIdAsync(roomId))
                .ReturnsAsync((Room)null);

            // Act
            var result = await _controller.GetRoomById(roomId);

            // Assert
            Assert.IsType<NotFoundResult>(result.Result);
        }

        [Fact]
        public async Task GetRoomsByPropertyId_ShouldReturnOkResult_WithListOfRooms()
        {
            // Arrange
            var propertyId = Guid.NewGuid();
            var rooms = new List<Room>
            {
                new Room
                {
                    Id = Guid.NewGuid(),
                    RoomNumber = "101",
                    Floor = 1,
                Status =Domain.Enums.RoomStatus.Available,
                    PropertyId = propertyId,
                    RoomTypeId = Guid.NewGuid()
                },
                new Room
                {
                    Id = Guid.NewGuid(),
                    RoomNumber = "102",
                    Floor = 1,
                Status =Domain.Enums.RoomStatus.Available,
                    PropertyId = propertyId,
                    RoomTypeId = Guid.NewGuid()
                }
            };

            _mockRoomService.Setup(service => service.GetRoomsByPropertyIdAsync(propertyId))
                .ReturnsAsync(rooms);

            // Act
            var result = await _controller.GetRoomsByPropertyId(propertyId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnValue = Assert.IsAssignableFrom<IEnumerable<Room>>(okResult.Value);
            Assert.Equal(2, ((List<Room>)returnValue).Count);
            Assert.All(((List<Room>)returnValue), room => Assert.Equal(propertyId, room.PropertyId));
        }

        [Fact]
        public async Task CreateRoom_ShouldReturnCreatedAtAction_WhenRoomIsCreated()
        {
            // Arrange
            var room = new Room
            {
                RoomNumber = "201",
                Floor = 2,
                Status = Domain.Enums.RoomStatus.Available,
                PropertyId = Guid.NewGuid(),
                RoomTypeId = Guid.NewGuid()
            };

            _mockRoomService.Setup(service => service.CreateRoomAsync(It.IsAny<Room>()))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.CreateRoom(room);

            // Assert
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            Assert.Equal(nameof(_controller.GetRoomById), createdAtActionResult.ActionName);
            var returnValue = Assert.IsType<Room>(createdAtActionResult.Value);
            Assert.Equal(room.RoomNumber, returnValue.RoomNumber);
        }
    }
}