using HotelManagement.Api.Controllers;
using HotelManagement.Services.Admin.Dining;
using HotelManagement.Services.Admin.Dining.Dtos;
using HotelManagement.Services.Common;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace HotelManagement.Tests.Controllers;

public class DiningSessionControllerTests
{
    private static DiningSessionController CreateController(Mock<IDiningSessionService> mock)
    {
        return new DiningSessionController(mock.Object);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task CreateSession_ReturnsOkOrBad(bool success)
    {
        var mock = new Mock<IDiningSessionService>();
        var resp = success ? ApiResponse<DiningSessionDto>.Ok(new DiningSessionDto()) : ApiResponse<DiningSessionDto>.Fail("fail");
        mock.Setup(s => s.CreateSessionAsync(It.IsAny<CreateDiningSessionRequest>())).ReturnsAsync(resp);
        var controller = CreateController(mock);
        var result = await controller.CreateSession(new CreateDiningSessionRequest());
        if (success) Assert.IsType<OkObjectResult>(result); else Assert.IsType<BadRequestObjectResult>(result);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task GetSession_ReturnsOkOrNotFound(bool success)
    {
        var mock = new Mock<IDiningSessionService>();
        var resp = success ? ApiResponse<DiningSessionDto>.Ok(new DiningSessionDto()) : ApiResponse<DiningSessionDto>.Fail("fail");
        mock.Setup(s => s.GetSessionAsync(It.IsAny<Guid>())).ReturnsAsync(resp);
        var controller = CreateController(mock);
        var result = await controller.GetSession(Guid.NewGuid());
        if (success) Assert.IsType<OkObjectResult>(result); else Assert.IsType<NotFoundObjectResult>(result);
    }

    [Fact]
    public async Task GetSessions_ReturnsOk()
    {
        var mock = new Mock<IDiningSessionService>();
        mock.Setup(s => s.GetSessionsAsync(It.IsAny<Guid>(), It.IsAny<int>(), It.IsAny<int>(), It.IsAny<string?>()))
            .ReturnsAsync(ApiResponse<DiningSessionListResponse>.Ok(new DiningSessionListResponse()));
        var controller = CreateController(mock);
        var result = await controller.GetSessions(Guid.NewGuid());
        Assert.IsType<OkObjectResult>(result);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task UpdateSession_ReturnsOkOrNotFound(bool success)
    {
        var mock = new Mock<IDiningSessionService>();
        var resp = success ? ApiResponse<DiningSessionDto>.Ok(new DiningSessionDto()) : ApiResponse<DiningSessionDto>.Fail("fail");
        mock.Setup(s => s.UpdateSessionAsync(It.IsAny<Guid>(), It.IsAny<UpdateDiningSessionRequest>())).ReturnsAsync(resp);
        var controller = CreateController(mock);
        var result = await controller.UpdateSession(Guid.NewGuid(), new UpdateDiningSessionRequest());
        if (success) Assert.IsType<OkObjectResult>(result); else Assert.IsType<NotFoundObjectResult>(result);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task EndSession_ReturnsOkOrNotFound(bool success)
    {
        var mock = new Mock<IDiningSessionService>();
        var resp = success ? ApiResponse<bool>.Ok(true) : ApiResponse<bool>.Fail("fail");
        mock.Setup(s => s.EndSessionAsync(It.IsAny<Guid>())).ReturnsAsync(resp);
        var controller = CreateController(mock);
        var result = await controller.EndSession(Guid.NewGuid());
        if (success) Assert.IsType<OkObjectResult>(result); else Assert.IsType<NotFoundObjectResult>(result);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task AttachTable_ReturnsOkOrBad(bool success)
    {
        var mock = new Mock<IDiningSessionService>();
        var resp = success ? ApiResponse<bool>.Ok(true) : ApiResponse<bool>.Fail("fail");
        mock.Setup(s => s.AttachTableAsync(It.IsAny<Guid>(), It.IsAny<Guid>())).ReturnsAsync(resp);
        var controller = CreateController(mock);
        var result = await controller.AttachTable(Guid.NewGuid(), Guid.NewGuid());
        if (success) Assert.IsType<OkObjectResult>(result); else Assert.IsType<BadRequestObjectResult>(result);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task DetachTable_ReturnsOkOrNotFound(bool success)
    {
        var mock = new Mock<IDiningSessionService>();
        var resp = success ? ApiResponse<bool>.Ok(true) : ApiResponse<bool>.Fail("fail");
        mock.Setup(s => s.DetachTableAsync(It.IsAny<Guid>(), It.IsAny<Guid>())).ReturnsAsync(resp);
        var controller = CreateController(mock);
        var result = await controller.DetachTable(Guid.NewGuid(), Guid.NewGuid());
        if (success) Assert.IsType<OkObjectResult>(result); else Assert.IsType<NotFoundObjectResult>(result);
    }
}
