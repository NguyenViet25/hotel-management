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
    public class RoleServiceTests
    {
        private readonly Mock<IUnitOfWork> _mockUnitOfWork;
        private readonly Mock<IRepository<Role>> _mockRoleRepository;
        private readonly Mock<IRepository<UserRole>> _mockUserRoleRepository;
        private readonly Mock<IRepository<User>> _mockUserRepository;
        private readonly RoleService _roleService;

        public RoleServiceTests()
        {
            _mockUnitOfWork = new Mock<IUnitOfWork>();
            _mockRoleRepository = new Mock<IRepository<Role>>();
            _mockUserRoleRepository = new Mock<IRepository<UserRole>>();
            _mockUserRepository = new Mock<IRepository<User>>();

            _mockUnitOfWork.Setup(uow => uow.Repository<Role>())
                .Returns(_mockRoleRepository.Object);
            _mockUnitOfWork.Setup(uow => uow.Repository<UserRole>())
                .Returns(_mockUserRoleRepository.Object);
            _mockUnitOfWork.Setup(uow => uow.Repository<User>())
                .Returns(_mockUserRepository.Object);

            _roleService = new RoleService(_mockUnitOfWork.Object);
        }

        [Fact]
        public async Task GetAllRolesAsync_ShouldReturnAllRoles()
        {
            // Arrange
            var roles = new List<Role>
            {
                new Role { Id = Guid.NewGuid(), Name = "Administrator", Description = "Admin role" },
                new Role { Id = Guid.NewGuid(), Name = "Manager", Description = "Manager role" },
                new Role { Id = Guid.NewGuid(), Name = "User", Description = "Regular user role" }
            };

            _mockRoleRepository.Setup(repo => repo.GetEasyAsync(
                    It.IsAny<Expression<Func<Role, bool>>>(),
                    It.IsAny<Func<IQueryable<Role>, IOrderedQueryable<Role>>>(),
                    It.IsAny<string>(),
                    It.IsAny<bool>()))
                .ReturnsAsync(roles);

            // Act
            var result = await _roleService.GetAllRolesAsync();

            // Assert
            Assert.NotNull(result);
            Assert.Equal(3, result.Count());
            Assert.Contains(result, r => r.Name == "Administrator");
            Assert.Contains(result, r => r.Name == "Manager");
            Assert.Contains(result, r => r.Name == "User");
        }

        [Fact]
        public async Task GetRoleByIdAsync_ShouldReturnRole_WhenRoleExists()
        {
            // Arrange
            var roleId = Guid.NewGuid();
            var expectedRole = new Role
            {
                Id = roleId,
                Name = "Administrator",
                Description = "Admin role"
            };

            _mockRoleRepository.Setup(repo => repo.GetByIdAsync(roleId))
                .ReturnsAsync(expectedRole);

            // Act
            var result = await _roleService.GetRoleByIdAsync(roleId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(roleId, result.Id);
            Assert.Equal("Administrator", result.Name);
        }

        [Fact]
        public async Task CreateRoleAsync_ShouldReturnTrue_WhenRoleNameDoesNotExist()
        {
            // Arrange
            var role = new Role
            {
                Name = "NewRole",
                Description = "New role description"
            };

            _mockRoleRepository.Setup(repo => repo.GetFirstOrDefaultAsync(
                    It.IsAny<Expression<Func<Role, bool>>>(),
                    It.IsAny<Func<IQueryable<Role>, IOrderedQueryable<Role>>>(),
                    It.IsAny<string>(),
                    It.IsAny<bool>()))
                .ReturnsAsync((Role)null);

            _mockRoleRepository.Setup(repo => repo.AddAsync(It.IsAny<Role>()))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _roleService.CreateRoleAsync(role);

            // Assert
            Assert.True(result);
            Assert.NotEqual(DateTime.MinValue, role.CreatedAt);
            _mockRoleRepository.Verify(repo => repo.AddAsync(It.IsAny<Role>()), Times.Once);
        }

        [Fact]
        public async Task CreateRoleAsync_ShouldReturnFalse_WhenRoleNameExists()
        {
            // Arrange
            var existingRole = new Role
            {
                Id = Guid.NewGuid(),
                Name = "ExistingRole",
                Description = "Existing role description"
            };

            var newRole = new Role
            {
                Name = "ExistingRole",
                Description = "New role with existing name"
            };

            _mockRoleRepository.Setup(repo => repo.GetFirstOrDefaultAsync(
                    It.IsAny<Expression<Func<Role, bool>>>(),
                    It.IsAny<Func<IQueryable<Role>, IOrderedQueryable<Role>>>(),
                    It.IsAny<string>(),
                    It.IsAny<bool>()))
                .ReturnsAsync(existingRole);

            // Act
            var result = await _roleService.CreateRoleAsync(newRole);

            // Assert
            Assert.False(result);
            _mockRoleRepository.Verify(repo => repo.AddAsync(It.IsAny<Role>()), Times.Never);
        }
    }
}