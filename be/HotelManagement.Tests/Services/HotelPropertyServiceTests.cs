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
    public class HotelPropertyServiceTests
    {
        private readonly Mock<IUnitOfWork> _mockUnitOfWork;
        private readonly Mock<IRepository<HotelProperty>> _mockPropertyRepository;
        private readonly HotelPropertyService _hotelPropertyService;

        public HotelPropertyServiceTests()
        {
            _mockUnitOfWork = new Mock<IUnitOfWork>();
            _mockPropertyRepository = new Mock<IRepository<HotelProperty>>();

            _mockUnitOfWork.Setup(uow => uow.Repository<HotelProperty>())
                .Returns(_mockPropertyRepository.Object);

            _hotelPropertyService = new HotelPropertyService(_mockUnitOfWork.Object);
        }

        [Fact]
        public async Task GetPropertyByIdAsync_ShouldReturnProperty_WhenPropertyExists()
        {
            // Arrange
            var propertyId = Guid.NewGuid();
            var expectedProperty = new HotelProperty
            {
                Id = propertyId,
                Name = "Grand Hotel",
                Address = "123 Main St",
                City = "New York",
                State = "NY",
                Country = "USA",
                PostalCode = "10001",
                Amenities = new List<PropertyAmenity>()
            };

            _mockPropertyRepository.Setup(repo => repo.GetFirstOrDefaultAsync(
                    It.IsAny<Expression<Func<HotelProperty, bool>>>(),
                    It.IsAny<Func<IQueryable<HotelProperty>, IOrderedQueryable<HotelProperty>>>(),
                    It.IsAny<List<Expression<Func<HotelProperty, object>>>>(),
                    It.IsAny<bool>()))
                .ReturnsAsync(expectedProperty);

            // Act
            var result = await _hotelPropertyService.GetPropertyByIdAsync(propertyId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(propertyId, result.Id);
            Assert.Equal("Grand Hotel", result.Name);
            Assert.Equal("New York", result.City);
        }

        [Fact]
        public async Task GetPropertyByIdAsync_ShouldReturnNull_WhenPropertyDoesNotExist()
        {
            // Arrange
            var propertyId = Guid.NewGuid();

            _mockPropertyRepository.Setup(repo => repo.GetFirstOrDefaultAsync(
                    It.IsAny<Expression<Func<HotelProperty, bool>>>(),
                    It.IsAny<Func<IQueryable<HotelProperty>, IOrderedQueryable<HotelProperty>>>(),
                    It.IsAny<List<Expression<Func<HotelProperty, object>>>>(),
                    It.IsAny<bool>()))
                .ReturnsAsync((HotelProperty)null);

            // Act
            var result = await _hotelPropertyService.GetPropertyByIdAsync(propertyId);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task CreatePropertyAsync_ShouldReturnTrue_WhenPropertyIsCreated()
        {
            // Arrange
            var property = new HotelProperty
            {
                Name = "New Hotel",
                Address = "456 Park Ave",
                City = "Chicago",
                State = "IL",
                Country = "USA",
                PostalCode = "60601",
            };

            _mockPropertyRepository.Setup(repo => repo.AddAsync(It.IsAny<HotelProperty>()))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _hotelPropertyService.CreatePropertyAsync(property);

            // Assert
            Assert.True(result);
            Assert.NotEqual(DateTime.MinValue, property.CreatedAt);
            _mockPropertyRepository.Verify(repo => repo.AddAsync(It.IsAny<HotelProperty>()), Times.Once);
        }
    }
}