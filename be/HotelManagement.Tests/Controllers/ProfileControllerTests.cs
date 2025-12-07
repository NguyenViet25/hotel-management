using HotelManagement.Api.Controllers;
using HotelManagement.Services.Common;
using HotelManagement.Services.Profile;
using HotelManagement.Services.Profile.Dtos;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using System.Security.Claims;
using Xunit;

namespace HotelManagement.Tests.Controllers;

public class ProfileControllerTests
{
    private static ProfileController CreateController(Mock<IProfileService> mock, ClaimsPrincipal? user = null)
    {
        var controller = new ProfileController(mock.Object);
        var ctx = new DefaultHttpContext();
        if (user != null) ctx.User = user;
        controller.ControllerContext = new ControllerContext { HttpContext = ctx };
        return controller;
    }

    [Fact]
    public async Task Me_ReturnsUnauthorized_WhenNoUser()
    {
        var mock = new Mock<IProfileService>();
        var controller = CreateController(mock);
        var result = await controller.Me();
        Assert.IsType<UnauthorizedObjectResult>(result.Result);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task Me_ReturnsOkOrNotFound(bool found)
    {
        var mock = new Mock<IProfileService>();
        var dto = found ? new ProfileDto(Guid.NewGuid(), "u", "e", "f", "p", new[] { "Admin" }, false) : null;
        mock.Setup(s => s.GetAsync(It.IsAny<Guid>())).ReturnsAsync(dto);
        var user = new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()) }, "TestAuth"));
        var controller = CreateController(mock, user);
        var result = await controller.Me();
        if (found) Assert.IsType<OkObjectResult>(result.Result); else Assert.IsType<NotFoundObjectResult>(result.Result);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task Update_ReturnsOkOrFail(bool success)
    {
        var mock = new Mock<IProfileService>();
        var dto = success ? new ProfileDto(Guid.NewGuid(), "u", "e", "f", "p", new[] { "Admin" }, false) : null;
        mock.Setup(s => s.UpdateAsync(It.IsAny<Guid>(), It.IsAny<UpdateProfileDto>())).ReturnsAsync(dto);
        var user = new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()) }, "TestAuth"));
        var controller = CreateController(mock, user);
        var result = await controller.Update(new UpdateProfileDto("e", "f", "p"));
        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task ChangePassword_ReturnsOkOrFail(bool ok)
    {
        var mock = new Mock<IProfileService>();
        mock.Setup(s => s.ChangePasswordAsync(It.IsAny<Guid>(), It.IsAny<ChangePasswordDto>())).ReturnsAsync(ok);
        var user = new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()) }, "TestAuth"));
        var controller = CreateController(mock, user);
        var result = await controller.ChangePassword(new ChangePasswordDto("old", "new"));
        Assert.IsType<OkObjectResult>(result.Result);
    }
}
