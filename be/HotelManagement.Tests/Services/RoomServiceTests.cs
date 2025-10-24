using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using HotelManagement.Domain.Entities;
using HotelManagement.Repositories.Interfaces;
using HotelManagement.Services.Services;
using Moq;
using Xunit;

namespace HotelManagement.Tests.Services
{
    public class RoomServiceTests
    {
        private readonly Mock<IUnitOfWork> _mockUnitOfWork;
        private readonly Mock<IRepository<Room>> _mockRoomRepository;
        private readonly Mock<IRepository<RoomType>> _mockRoomTypeRepository;
        private readonly Mock<IRepository<Booking>> _mockBookingRepository;
        private readonly RoomService _roomService;

        public RoomServiceTests()
        {
            _mockUnitOfWork = new Mock<IUnitOfWork>();
            _mockRoomRepository = new Mock<IRepository<Room>>();
            _mockRoomTypeRepository = new Mock<IRepository<RoomType>>();
            _mockBookingRepository = new Mock<IRepository<Booking>>();

            _mockUnitOfWork.Setup(uow => uow.Repository<Room>())
                .Returns(_mockRoomRepository.Object);
            _mockUnitOfWork.Setup(uow => uow.Repository<RoomType>())
                .Returns(_mockRoomTypeRepository.Object);
            _mockUnitOfWork.Setup(uow => uow.Repository<Booking>())
                .Returns(_mockBookingRepository.Object);

            _roomService = new RoomService(_mockUnitOfWork.Object);
        }

        [Fact]
        public async Task GetRoomByIdAsync_ShouldReturnRoom_WhenRoomExists()
        {
            // Arrange
            var roomId = Guid.NewGuid();
            var roomTypeId = Guid.NewGuid();
            var propertyId = Guid.NewGuid();
            
            var expectedRoom = new Room
            {
                Id = roomId,
                RoomNumber = "101",
                Floor = 1,
                RoomTypeId = roomTypeId,
                PropertyId = propertyId,
                Status = Domain.Enums.RoomStatus.Available,
                RoomType = new RoomType
                {
                    Id = roomTypeId,
                    Name = "Deluxe King",
                    Description = "Deluxe room with king-size bed",
                    BasePrice = 199.99m
                }
            };

            _mockRoomRepository.Setup(repo => repo.GetFirstOrDefaultAsync(
                    It.IsAny<Expression<Func<Room, bool>>>(),
                    It.IsAny<Func<IQueryable<Room>, IOrderedQueryable<Room>>>(),
                    It.IsAny<List<Expression<Func<Room, object>>>>(),
                    It.IsAny<bool>()))
                .ReturnsAsync(expectedRoom);

            // Act
            var result = await _roomService.GetRoomByIdAsync(roomId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(roomId, result.Id);
            Assert.Equal("101", result.RoomNumber);
            Assert.Equal(Domain.Enums.RoomStatus.Available, result.Status);
            Assert.NotNull(result.RoomType);
            Assert.Equal("Deluxe King", result.RoomType.Name);
        }

        [Fact]
        public async Task GetRoomsByPropertyIdAsync_ShouldReturnRooms_WhenPropertyExists()
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
                    PropertyId = propertyId,
                    Status = Domain.Enums.RoomStatus.Available
                },
                new Room
                {
                    Id = Guid.NewGuid(),
                    RoomNumber = "102",
                    Floor = 1,
                    PropertyId = propertyId,
                    Status = Domain.Enums.RoomStatus.Available
                }
            };

            _mockRoomRepository.Setup(repo => repo.GetComplexAsync(
                    It.IsAny<Expression<Func<Room, bool>>>(),
                    It.IsAny<Func<IQueryable<Room>, IOrderedQueryable<Room>>>(),
                    It.IsAny<List<Expression<Func<Room, object>>>>(),
                    It.IsAny<bool>()))
                .ReturnsAsync(rooms);

            // Act
            var result = await _roomService.GetRoomsByPropertyIdAsync(propertyId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count());
            Assert.All(result, room => Assert.Equal(propertyId, room.PropertyId));
        }

        [Fact]
        public async Task CreateRoomAsync_ShouldReturnTrue_WhenRoomIsCreated()
        {
            // Arrange
            var room = new Room
            {
                RoomNumber = "201",
                Floor = 2,
                PropertyId = Guid.NewGuid(),
                RoomTypeId = Guid.NewGuid(),
                Status = Domain.Enums.RoomStatus.Available
            };

        

            // Act
            var result = await _roomService.CreateRoomAsync(room);

            // Assert
            Assert.True(result);
            Assert.NotEqual(DateTime.MinValue, room.CreatedAt);
            _mockRoomRepository.Verify(repo => repo.AddAsync(It.IsAny<Room>()), Times.Once);
        }
    }
}