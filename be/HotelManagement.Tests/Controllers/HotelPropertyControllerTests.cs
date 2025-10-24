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
    public class HotelPropertyControllerTests
    {
        private readonly Mock<IHotelPropertyService> _mockPropertyService;
        private readonly HotelPropertyController _controller;

        public HotelPropertyControllerTests()
        {
            _mockPropertyService = new Mock<IHotelPropertyService>();
            _controller = new HotelPropertyController(_mockPropertyService.Object);

            // Setup controller context with admin role
            var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.Name, "admin"),
                new Claim(ClaimTypes.Role, "Administrator")
            }));

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };
        }

        [Fact]
        public async Task GetAllProperties_ShouldReturnOkResult_WithListOfProperties()
        {
            // Arrange
            var properties = new List<HotelProperty>
            {
                new HotelProperty
                {
                    Id = Guid.NewGuid(),
                    Name = "Grand Hotel",
                    City = "New York",
                    Country = "USA",
                    Amenities = new List<PropertyAmenity>()
                },
                new HotelProperty
                {
                    Id = Guid.NewGuid(),
                    Name = "Seaside Resort",
                    City = "Miami",
                    Country = "USA",
                    Amenities = new List<PropertyAmenity>()
                }
            };

            _mockPropertyService.Setup(service => service.GetAllPropertiesAsync())
                .ReturnsAsync(properties);

            // Act
            var result = await _controller.GetAllProperties();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnValue = Assert.IsAssignableFrom<IEnumerable<HotelProperty>>(okResult.Value);
            Assert.Equal(2, ((List<HotelProperty>)returnValue).Count);
        }

        [Fact]
        public async Task GetPropertyById_ShouldReturnOkResult_WhenPropertyExists()
        {
            // Arrange
            var propertyId = Guid.NewGuid();
            var property = new HotelProperty
            {
                Id = propertyId,
                Name = "Grand Hotel",
                City = "New York",
                Country = "USA",
                Amenities = new List<PropertyAmenity>()
            };

            _mockPropertyService.Setup(service => service.GetPropertyByIdAsync(propertyId))
                .ReturnsAsync(property);

            // Act
            var result = await _controller.GetPropertyById(propertyId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnValue = Assert.IsType<HotelProperty>(okResult.Value);
            Assert.Equal(propertyId, returnValue.Id);
            Assert.Equal("Grand Hotel", returnValue.Name);
        }

        [Fact]
        public async Task GetPropertyById_ShouldReturnNotFound_WhenPropertyDoesNotExist()
        {
            // Arrange
            var propertyId = Guid.NewGuid();

            _mockPropertyService.Setup(service => service.GetPropertyByIdAsync(propertyId))
                .ReturnsAsync((HotelProperty)null);

            // Act
            var result = await _controller.GetPropertyById(propertyId);

            // Assert
            Assert.IsType<NotFoundResult>(result.Result);
        }

        [Fact]
        public async Task CreateProperty_ShouldReturnCreatedAtAction_WhenPropertyIsCreated()
        {
            // Arrange
            var property = new HotelProperty
            {
                Name = "New Hotel",
                Address = "123 Main St",
                City = "Chicago",
                State = "IL",
                Country = "USA",
            };

            _mockPropertyService.Setup(service => service.CreatePropertyAsync(It.IsAny<HotelProperty>()))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.CreateProperty(property);

            // Assert
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            Assert.Equal(nameof(_controller.GetPropertyById), createdAtActionResult.ActionName);
            var returnValue = Assert.IsType<HotelProperty>(createdAtActionResult.Value);
            Assert.Equal(property.Name, returnValue.Name);
        }

        [Fact]
        public async Task UpdateProperty_ShouldReturnOkResult_WhenPropertyIsUpdated()
        {
            // Arrange
            var propertyId = Guid.NewGuid();
            var property = new HotelProperty
            {
                Id = propertyId,
                Name = "Updated Hotel",
                City = "New York",
                Country = "USA",
            };

            _mockPropertyService.Setup(service => service.GetPropertyByIdAsync(propertyId))
                .ReturnsAsync(property);

            _mockPropertyService.Setup(service => service.UpdatePropertyAsync(It.IsAny<HotelProperty>()))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.UpdateProperty(propertyId, property);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsType<HotelProperty>(okResult.Value);
            Assert.Equal(propertyId, returnValue.Id);
            Assert.Equal("Updated Hotel", returnValue.Name);
        }

        [Fact]
        public async Task DeleteProperty_ShouldReturnNoContent_WhenPropertyIsDeleted()
        {
            // Arrange
            var propertyId = Guid.NewGuid();

            _mockPropertyService.Setup(service => service.DeletePropertyAsync(propertyId))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.DeleteProperty(propertyId);

            // Assert
            Assert.IsType<NoContentResult>(result);
        }
    }
}