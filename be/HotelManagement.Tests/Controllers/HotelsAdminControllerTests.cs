using HotelManagement.Api.Controllers;
using HotelManagement.Services.Admin.Hotels;
using HotelManagement.Services.Admin.Hotels.Dtos;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using System.Security.Claims;
using Xunit;

namespace HotelManagement.Tests.Controllers;

public class HotelsAdminControllerTests
{
    private static HotelsAdminController CreateController(Mock<IHotelsAdminService> mock, ClaimsPrincipal? user = null)
    {
        var controller = new HotelsAdminController(mock.Object);
        var ctx = new DefaultHttpContext();
        if (user != null) ctx.User = user;
        controller.ControllerContext = new ControllerContext { HttpContext = ctx };
        return controller;
    }

    [Fact]
    public async Task List_ReturnsForbid_WhenUserMissing()
    {
        var mock = new Mock<IHotelsAdminService>();
        var controller = CreateController(mock);
        var result = await controller.List(new HotelsQueryDto());
        Assert.IsType<ForbidResult>(result.Result);
    }

    [Fact]
    public async Task List_ReturnsOk_WhenUserPresent()
    {
        var mock = new Mock<IHotelsAdminService>();
        mock.Setup(s => s.ListAsync(It.IsAny<HotelsQueryDto>(), It.IsAny<Guid>(), It.IsAny<bool>()))
            .ReturnsAsync((new List<HotelSummaryDto> { new HotelSummaryDto(Guid.NewGuid(), "H", "Hotel", "Addr", true, DateTime.Now) }, 1));
        var user = new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()), new Claim(ClaimTypes.Role, "Admin") }, "TestAuth"));
        var controller = CreateController(mock, user);
        var result = await controller.List(new HotelsQueryDto());
        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task Get_ReturnsOkOrNotFound(bool found)
    {
        var mock = new Mock<IHotelsAdminService>();
        var dto = found ? new HotelDetailsDto(Guid.NewGuid(), "H", "Hotel", "Addr", true, DateTime.Now) : null;
        mock.Setup(s => s.GetAsync(It.IsAny<Guid>(), It.IsAny<Guid>(), It.IsAny<bool>())).ReturnsAsync(dto);
        var user = new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()), new Claim(ClaimTypes.Role, "Admin") }, "TestAuth"));
        var controller = CreateController(mock, user);
        var result = await controller.Get(Guid.NewGuid());
        if (found) Assert.IsType<OkObjectResult>(result.Result); else Assert.IsType<NotFoundObjectResult>(result.Result);
    }

    [Fact]
    public async Task Create_ReturnsForbid_WhenUserMissing()
    {
        var mock = new Mock<IHotelsAdminService>();
        var controller = CreateController(mock);
        var result = await controller.Create(new CreateHotelDto("H","Hotel","Addr", "0123456789", "hotel@example.com"));
        Assert.IsType<ForbidResult>(result.Result);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task Update_ReturnsOkOrNotFound(bool found)
    {
        var mock = new Mock<IHotelsAdminService>();
        var dto = found ? new HotelDetailsDto(Guid.NewGuid(), "H", "Hotel", "Addr", true, DateTime.Now) : null;
        mock.Setup(s => s.UpdateAsync(It.IsAny<Guid>(), It.IsAny<UpdateHotelDto>(), It.IsAny<Guid>())).ReturnsAsync(dto);
        var user = new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()), new Claim(ClaimTypes.Role, "Admin") }, "TestAuth"));
        var controller = CreateController(mock, user);
        var result = await controller.Update(Guid.NewGuid(), new UpdateHotelDto("Hotel","Addr", true, "0123456789", "hotel@example.com"));
        if (found) Assert.IsType<OkObjectResult>(result.Result); else Assert.IsType<NotFoundObjectResult>(result.Result);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task ChangeStatus_ReturnsOkOrNotFound(bool found)
    {
        var mock = new Mock<IHotelsAdminService>();
        var dto = found ? new HotelDetailsDto(Guid.NewGuid(), "H", "Hotel", "Addr", true, DateTime.Now) : null;
        mock.Setup(s => s.ChangeStatusAsync(It.IsAny<Guid>(), It.IsAny<ChangeHotelStatusDto>(), It.IsAny<Guid>())).ReturnsAsync(dto);
        var user = new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()), new Claim(ClaimTypes.Role, "Admin") }, "TestAuth"));
        var controller = CreateController(mock, user);
        var result = await controller.ChangeStatus(Guid.NewGuid(), new ChangeHotelStatusDto("activate","reason", null));
        if (found) Assert.IsType<OkObjectResult>(result.Result); else Assert.IsType<NotFoundObjectResult>(result.Result);
    }
}
