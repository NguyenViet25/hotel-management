using HotelManagement.Api.Controllers;
using HotelManagement.Services.Admin.Menu;
using HotelManagement.Services.Common;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using System.Security.Claims;
using Xunit;

namespace HotelManagement.Tests.Controllers;

public class MenuControllerTests
{
    private static MenuController CreateController(Mock<IMenuService> mock, ClaimsPrincipal? user = null)
    {
        var controller = new MenuController(mock.Object);
        var ctx = new DefaultHttpContext();
        if (user != null) ctx.User = user;
        controller.ControllerContext = new ControllerContext { HttpContext = ctx };
        return controller;
    }

    [Fact]
    public async Task GetMenuItems_ReturnsBadRequest_WhenHotelIdMissing()
    {
        var mock = new Mock<IMenuService>();
        var controller = CreateController(mock);
        var result = await controller.GetMenuItems(new MenuQueryDto());
        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("Available")] 
    [InlineData("Unavailable")] 
    public async Task GetMenuItems_ReturnsOk_WhenHotelIdPresent(string? status)
    {
        var mock = new Mock<IMenuService>();
        mock.Setup(s => s.GetMenuItemsAsync(It.IsAny<MenuQueryDto>(), It.IsAny<Guid>()))
            .ReturnsAsync(ApiResponse<List<MenuItemDto>>.Ok(new List<MenuItemDto> { new MenuItemDto() }));
        var user = new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim("hotelId", Guid.NewGuid().ToString()) }, "TestAuth"));
        var controller = CreateController(mock, user);
        var query = new MenuQueryDto { Status = status is null ? null : Enum.Parse<HotelManagement.Domain.MenuItemStatus>(status) };
        var result = await controller.GetMenuItems(query);
        Assert.IsType<OkObjectResult>(result);
        mock.Verify(s => s.GetMenuItemsAsync(It.IsAny<MenuQueryDto>(), It.IsAny<Guid>()), Times.Once);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task CreateMenuItem_ReturnsOk(bool success)
    {
        var mock = new Mock<IMenuService>();
        var resp = success ? ApiResponse<MenuItemDto>.Ok(new MenuItemDto()) : ApiResponse<MenuItemDto>.Fail("fail");
        mock.Setup(s => s.CreateMenuItemAsync(It.IsAny<CreateMenuItemDto>(), It.IsAny<Guid>())).ReturnsAsync(resp);
        var user = new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()) }, "TestAuth"));
        var controller = CreateController(mock, user);
        var result = await controller.CreateMenuItem(new CreateMenuItemDto { Category = "Food", Name = "Noodle", UnitPrice = 10m });
        Assert.IsType<OkObjectResult>(result);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task UpdateMenuItem_ReturnsOk(bool success)
    {
        var mock = new Mock<IMenuService>();
        var resp = success ? ApiResponse<MenuItemDto>.Ok(new MenuItemDto()) : ApiResponse<MenuItemDto>.Fail("fail");
        mock.Setup(s => s.UpdateMenuItemAsync(It.IsAny<Guid>(), It.IsAny<UpdateMenuItemDto>(), It.IsAny<Guid>())).ReturnsAsync(resp);
        var user = new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()) }, "TestAuth"));
        var controller = CreateController(mock, user);
        var result = await controller.UpdateMenuItem(Guid.NewGuid(), new UpdateMenuItemDto { Name = "Pho" });
        Assert.IsType<OkObjectResult>(result);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task DeleteMenuItem_ReturnsOk(bool success)
    {
        var mock = new Mock<IMenuService>();
        var resp = success ? ApiResponse<bool>.Ok(true) : ApiResponse<bool>.Fail("fail");
        mock.Setup(s => s.DeleteMenuItemAsync(It.IsAny<Guid>(), It.IsAny<Guid>())).ReturnsAsync(resp);
        var user = new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()) }, "TestAuth"));
        var controller = CreateController(mock, user);
        var result = await controller.DeleteMenuItem(Guid.NewGuid());
        Assert.IsType<OkObjectResult>(result);
    }
}
