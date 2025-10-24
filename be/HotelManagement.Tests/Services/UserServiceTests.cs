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
    public class UserServiceTests
    {
        private readonly Mock<IUnitOfWork> _mockUnitOfWork;
        private readonly Mock<IRepository<User>> _mockUserRepository;
        private readonly Mock<IRepository<Role>> _mockRoleRepository;
        private readonly Mock<IRepository<UserRole>> _mockUserRoleRepository;
        private readonly UserService _userService;

        public UserServiceTests()
        {
            _mockUnitOfWork = new Mock<IUnitOfWork>();
            _mockUserRepository = new Mock<IRepository<User>>();
            _mockRoleRepository = new Mock<IRepository<Role>>();
            _mockUserRoleRepository = new Mock<IRepository<UserRole>>();

            _mockUnitOfWork.Setup(uow => uow.Repository<User>())
                .Returns(_mockUserRepository.Object);
            _mockUnitOfWork.Setup(uow => uow.Repository<Role>())
                .Returns(_mockRoleRepository.Object);
            _mockUnitOfWork.Setup(uow => uow.Repository<UserRole>())
                .Returns(_mockUserRoleRepository.Object);

            _userService = new UserService(_mockUnitOfWork.Object);
        }

        [Fact]
        public async Task GetUserByIdAsync_ShouldReturnUser_WhenUserExists()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var expectedUser = new User
            {
                Id = userId,
                Username = "testuser",
                Email = "test@example.com",
                FirstName = "Test",
                LastName = "User",
                IsActive = true
            };

            _mockUserRepository.Setup(repo => repo.GetByIdAsync(userId))
                .ReturnsAsync(expectedUser);

            // Act
            var result = await _userService.GetUserByIdAsync(userId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(userId, result.Id);
            Assert.Equal("testuser", result.Username);
            Assert.Equal("test@example.com", result.Email);
        }

        [Fact]
        public async Task GetUserByIdAsync_ShouldReturnNull_WhenUserDoesNotExist()
        {
            // Arrange
            var userId = Guid.NewGuid();

            _mockUserRepository.Setup(repo => repo.GetByIdAsync(userId))
                .ReturnsAsync((User)null);

            // Act
            var result = await _userService.GetUserByIdAsync(userId);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task GetUserByEmailAsync_ShouldReturnUser_WhenUserExists()
        {
            // Arrange
            var email = "test@example.com";
            var expectedUser = new User
            {
                Id = Guid.NewGuid(),
                Username = "testuser",
                Email = email,
                FirstName = "Test",
                LastName = "User",
                IsActive = true
            };

            _mockUserRepository.Setup(repo => repo.GetFirstOrDefaultAsync(
                    It.IsAny<Expression<Func<User, bool>>>(),
                    It.IsAny<Func<IQueryable<User>, IOrderedQueryable<User>>>(),
                    It.IsAny<string>(),
                    It.IsAny<bool>()))
                .ReturnsAsync(expectedUser);

            // Act
            var result = await _userService.GetUserByEmailAsync(email);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(email, result.Email);
        }
    }
}