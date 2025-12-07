using HotelManagement.Api.Controllers;
using HotelManagement.Services.Admin.Users;
using HotelManagement.Services.Admin.Users.Dtos;
using HotelManagement.Services.Common;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace HotelManagement.Tests.Controllers;

public class UsersAdminControllerTests
{
    private static UsersAdminController CreateController(Mock<IUsersAdminService> mock)
    {
        return new UsersAdminController(mock.Object);
    }

    [Fact]
    public async Task List_ReturnsOk()
    {
        var mock = new Mock<IUsersAdminService>();
        mock.Setup(s => s.ListAsync(It.IsAny<UsersQueryDto>()))
            .ReturnsAsync((new List<UserSummaryDto> { new UserSummaryDto(Guid.NewGuid(), "user","email","0123","Full Name", true, null, Enumerable.Empty<string>(), Enumerable.Empty<UserPropertyRoleDto>()) }, 1));
        var controller = CreateController(mock);
        var result = await controller.List(new UsersQueryDto());
        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Fact]
    public async Task ListHouseKeepers_ReturnsOk()
    {
        var mock = new Mock<IUsersAdminService>();
        mock.Setup(s => s.ListByRoleAsync(It.IsAny<UserByRoleQuery>()))
            .ReturnsAsync(new List<UserSummaryDto> { new UserSummaryDto(Guid.NewGuid(), "user","email","0123","Full Name", true, null, Enumerable.Empty<string>(), Enumerable.Empty<UserPropertyRoleDto>()) });
        var controller = CreateController(mock);
        var result = await controller.ListHouseKeppers(new UserByRoleQuery(Guid.NewGuid(), "Housekeeper"));
        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task Get_ReturnsOkOrNotFound(bool found)
    {
        var mock = new Mock<IUsersAdminService>();
        var dto = found ? new UserDetailsDto(Guid.NewGuid(), "user", "email", "0123", true, null, Enumerable.Empty<string>(), Enumerable.Empty<UserPropertyRoleDto>()) : null;
        mock.Setup(s => s.GetAsync(It.IsAny<Guid>())).ReturnsAsync(dto);
        var controller = CreateController(mock);
        var result = await controller.Get(Guid.NewGuid());
        if (found) Assert.IsType<OkObjectResult>(result.Result); else Assert.IsType<NotFoundObjectResult>(result.Result);
    }

    [Fact]
    public async Task Create_ReturnsCreated()
    {
        var mock = new Mock<IUsersAdminService>();
        mock.Setup(s => s.CreateAsync(It.IsAny<CreateUserDto>())).ReturnsAsync(new UserDetailsDto(Guid.NewGuid(), "user", "email", "0123", true, null, Enumerable.Empty<string>(), Enumerable.Empty<UserPropertyRoleDto>()));
        var controller = CreateController(mock);
        var result = await controller.Create(new CreateUserDto("user","email","Full Name", "0123", null, null));
        Assert.IsType<CreatedAtActionResult>(result.Result);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task Update_ReturnsOkOrNotFound(bool found)
    {
        var mock = new Mock<IUsersAdminService>();
        var dto = found ? new UserDetailsDto(Guid.NewGuid(), "user", "email", "0123", true, null, Enumerable.Empty<string>(), Enumerable.Empty<UserPropertyRoleDto>()) : null;
        mock.Setup(s => s.UpdateAsync(It.IsAny<Guid>(), It.IsAny<UpdateUserDto>())).ReturnsAsync(dto);
        var controller = CreateController(mock);
        var result = await controller.Update(Guid.NewGuid(), new UpdateUserDto("Full Name","email","0123", null, null));
        if (found) Assert.IsType<OkObjectResult>(result.Result); else Assert.IsType<NotFoundObjectResult>(result.Result);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task Lock_ReturnsOkOrNotFound(bool ok)
    {
        var mock = new Mock<IUsersAdminService>();
        mock.Setup(s => s.LockAsync(It.IsAny<Guid>(), It.IsAny<LockUserDto>())).ReturnsAsync(ok);
        var controller = CreateController(mock);
        var result = await controller.Lock(Guid.NewGuid(), new LockUserDto(DateTimeOffset.UtcNow));
        if (ok) Assert.IsType<OkObjectResult>(result.Result); else Assert.IsType<NotFoundObjectResult>(result.Result);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task Unlock_ReturnsOkOrNotFound(bool ok)
    {
        var mock = new Mock<IUsersAdminService>();
        mock.Setup(s => s.UnLockAsync(It.IsAny<Guid>(), It.IsAny<LockUserDto>())).ReturnsAsync(ok);
        var controller = CreateController(mock);
        var result = await controller.UnLock(Guid.NewGuid(), new LockUserDto(DateTimeOffset.UtcNow));
        if (ok) Assert.IsType<OkObjectResult>(result.Result); else Assert.IsType<NotFoundObjectResult>(result.Result);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task ResetPassword_ReturnsOkOrNotFound(bool ok)
    {
        var mock = new Mock<IUsersAdminService>();
        mock.Setup(s => s.ResetPasswordAsync(It.IsAny<Guid>(), It.IsAny<ResetPasswordAdminDto>())).ReturnsAsync(ok);
        var controller = CreateController(mock);
        var result = await controller.ResetPassword(Guid.NewGuid(), new ResetPasswordAdminDto("new"));
        if (ok) Assert.IsType<OkObjectResult>(result.Result); else Assert.IsType<NotFoundObjectResult>(result.Result);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task AssignPropertyRole_ReturnsOkOrBad(bool ok)
    {
        var mock = new Mock<IUsersAdminService>();
        var dto = ok ? new UserPropertyRoleDto(Guid.NewGuid(), Guid.NewGuid(), HotelManagement.Domain.UserRole.Manager, "Name") : null;
        mock.Setup(s => s.AssignPropertyRoleAsync(It.IsAny<Guid>(), It.IsAny<AssignPropertyRoleDto>())).ReturnsAsync(dto);
        var controller = CreateController(mock);
        var result = await controller.AssignPropertyRole(Guid.NewGuid(), new AssignPropertyRoleDto(Guid.NewGuid(), HotelManagement.Domain.UserRole.Manager));
        if (ok) Assert.IsType<OkObjectResult>(result.Result); else Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task RemovePropertyRole_ReturnsOkOrNotFound(bool ok)
    {
        var mock = new Mock<IUsersAdminService>();
        mock.Setup(s => s.RemovePropertyRoleAsync(It.IsAny<Guid>(), It.IsAny<Guid>())).ReturnsAsync(ok);
        var controller = CreateController(mock);
        var result = await controller.RemovePropertyRole(Guid.NewGuid(), Guid.NewGuid());
        if (ok) Assert.IsType<OkObjectResult>(result.Result); else Assert.IsType<NotFoundObjectResult>(result.Result);
    }
}
