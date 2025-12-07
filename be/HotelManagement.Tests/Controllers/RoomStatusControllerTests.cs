using HotelManagement.Api.Controllers;
using HotelManagement.Domain;
using HotelManagement.Services.Admin.Housekeeping;
using HotelManagement.Services.Admin.Housekeeping.Dtos;
using HotelManagement.Services.Common;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace HotelManagement.Tests.Controllers;

public class RoomStatusControllerTests
{
    private static RoomStatusController CreateController(Mock<IRoomStatusService> mock)
    {
        return new RoomStatusController(mock.Object);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task UpdateRoomStatus_ReturnsOkOrBad(bool ok)
    {
        var mock = new Mock<IRoomStatusService>();
        var resp = ok ? ApiResponse<RoomStatusDto>.Ok(new RoomStatusDto()) : ApiResponse<RoomStatusDto>.Fail("fail");
        mock.Setup(s => s.UpdateRoomStatusAsync(It.IsAny<UpdateRoomStatusRequest>())).ReturnsAsync(resp);
        var controller = CreateController(mock);
        var result = await controller.UpdateRoomStatus(new UpdateRoomStatusRequest { RoomId = Guid.NewGuid(), Status = RoomStatus.Clean });
        if (ok) Assert.IsType<OkObjectResult>(result); else Assert.IsType<BadRequestObjectResult>(result);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task History_ReturnsOkOrNotFound(bool ok)
    {
        var mock = new Mock<IRoomStatusService>();
        var resp = ok ? ApiResponse<RoomStatusListResponse>.Ok(new RoomStatusListResponse()) : ApiResponse<RoomStatusListResponse>.Fail("fail");
        mock.Setup(s => s.GetRoomStatusHistoryAsync(It.IsAny<Guid>(), It.IsAny<int>(), It.IsAny<int>())).ReturnsAsync(resp);
        var controller = CreateController(mock);
        var result = await controller.GetRoomStatusHistory(Guid.NewGuid());
        if (ok) Assert.IsType<OkObjectResult>(result); else Assert.IsType<NotFoundObjectResult>(result);
    }

    [Fact]
    public async Task GetRoomsByStatus_ReturnsOk()
    {
        var mock = new Mock<IRoomStatusService>();
        mock.Setup(s => s.GetRoomsByStatusAsync(It.IsAny<Guid>(), It.IsAny<RoomStatus?>())).ReturnsAsync(ApiResponse<List<RoomWithStatusDto>>.Ok(new List<RoomWithStatusDto>()));
        var controller = CreateController(mock);
        var result = await controller.GetRoomsByStatus(Guid.NewGuid());
        Assert.IsType<OkObjectResult>(result);
    }

    [Fact]
    public async Task Summary_ReturnsOk()
    {
        var mock = new Mock<IRoomStatusService>();
        mock.Setup(s => s.GetRoomStatusSummaryAsync(It.IsAny<Guid>())).ReturnsAsync(ApiResponse<RoomStatusSummaryDto>.Ok(new RoomStatusSummaryDto()));
        var controller = CreateController(mock);
        var result = await controller.GetRoomStatusSummary(Guid.NewGuid());
        Assert.IsType<OkObjectResult>(result);
    }
}
