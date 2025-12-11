using HotelManagement.Api.Controllers;
using HotelManagement.Services.Admin.Audit;
using HotelManagement.Services.Admin.Audit.Dtos;
using HotelManagement.Services.Common;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using System.Security.Claims;
using Xunit;

namespace HotelManagement.Tests.Controllers;

public class AuditControllerTests
{
    private static AuditController CreateController(Mock<IAuditService> mock, ClaimsPrincipal? user = null)
    {
        var controller = new AuditController(mock.Object);
        var ctx = new DefaultHttpContext();
        if (user != null) ctx.User = user;
        controller.ControllerContext = new ControllerContext { HttpContext = ctx };
        return controller;
    }

    [Fact]
    public async Task Query_ReturnsForbid_WhenNoUser()
    {
        var mock = new Mock<IAuditService>();
        var controller = CreateController(mock);
        var result = await controller.Query(new AuditQueryDto());
        Assert.IsType<ForbidResult>(result.Result);
    }

    [Fact]
    public async Task Query_ReturnsOk_WhenUserPresent()
    {
        var mock = new Mock<IAuditService>();
        mock.Setup(a => a.QueryAsync(It.IsAny<AuditQueryDto>(), It.IsAny<Guid>(), It.IsAny<bool>()))
            .ReturnsAsync((new List<AuditLogDto> { new AuditLogDto(Guid.NewGuid(), DateTime.Now, "Action", null, null, null) }, 1));
        var user = new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()), new Claim(ClaimTypes.Role, "Admin") }, "TestAuth"));
        var controller = CreateController(mock, user);
        var result = await controller.Query(new AuditQueryDto());
        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var payload = Assert.IsType<ApiResponse<IEnumerable<AuditLogDto>>>(ok.Value);
        Assert.True(payload.IsSuccess);
        mock.Verify(a => a.QueryAsync(It.IsAny<AuditQueryDto>(), It.IsAny<Guid>(), It.IsAny<bool>()), Times.Once);
    }

    [Fact]
    public async Task Query_ReturnsOk_ForManagerRole_WithIsAdminFalse()
    {
        var mock = new Mock<IAuditService>();
        mock.Setup(a => a.QueryAsync(It.IsAny<AuditQueryDto>(), It.IsAny<Guid>(), false))
            .ReturnsAsync((new List<AuditLogDto>(), 0));
        var user = new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()), new Claim(ClaimTypes.Role, "Manager") }, "TestAuth"));
        var controller = CreateController(mock, user);
        var result = await controller.Query(new AuditQueryDto());
        Assert.IsType<OkObjectResult>(result.Result);
        mock.Verify(a => a.QueryAsync(It.IsAny<AuditQueryDto>(), It.IsAny<Guid>(), It.Is<bool>(b => b == false)), Times.Once);
    }

    [Fact]
    public async Task Query_ReturnsForbid_WhenInvalidUserIdClaim()
    {
        var mock = new Mock<IAuditService>();
        var user = new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim(ClaimTypes.NameIdentifier, "not-a-guid"), new Claim(ClaimTypes.Role, "Admin") }, "TestAuth"));
        var controller = CreateController(mock, user);
        var result = await controller.Query(new AuditQueryDto());
        Assert.IsType<ForbidResult>(result.Result);
    }

    [Fact]
    public async Task Query_PassesPaginationMeta()
    {
        var mock = new Mock<IAuditService>();
        mock.Setup(a => a.QueryAsync(It.IsAny<AuditQueryDto>(), It.IsAny<Guid>(), It.IsAny<bool>()))
            .ReturnsAsync((new List<AuditLogDto>(), 42));
        var user = new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()), new Claim(ClaimTypes.Role, "Admin") }, "TestAuth"));
        var controller = CreateController(mock, user);
        var query = new AuditQueryDto(Page: 2, PageSize: 50);
        var result = await controller.Query(query);
        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var payload = Assert.IsType<ApiResponse<IEnumerable<AuditLogDto>>>(ok.Value);
        Assert.True(payload.IsSuccess);
        Assert.NotNull(payload.Meta);
    }
}
