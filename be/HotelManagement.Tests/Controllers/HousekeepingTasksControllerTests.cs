using HotelManagement.Api.Controllers;
using HotelManagement.Services.Admin.Housekeeping;
using HotelManagement.Services.Admin.Housekeeping.Dtos;
using HotelManagement.Services.Common;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace HotelManagement.Tests.Controllers;

public class HousekeepingTasksControllerTests
{
    private static HousekeepingTasksController CreateController(Mock<IHousekeepingTaskService> mock)
    {
        return new HousekeepingTasksController(mock.Object);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task Create_ReturnsOkOrBad(bool ok)
    {
        var mock = new Mock<IHousekeepingTaskService>();
        var resp = ok ? ApiResponse<HousekeepingTaskDto>.Ok(new HousekeepingTaskDto()) : ApiResponse<HousekeepingTaskDto>.Fail("fail");
        mock.Setup(s => s.CreateAsync(It.IsAny<CreateHousekeepingTaskRequest>())).ReturnsAsync(resp);
        var controller = CreateController(mock);
        var result = await controller.Create(new CreateHousekeepingTaskRequest { HotelId = Guid.NewGuid(), RoomId = Guid.NewGuid() });
        if (ok) Assert.IsType<OkObjectResult>(result); else Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task List_ReturnsOk()
    {
        var mock = new Mock<IHousekeepingTaskService>();
        mock.Setup(s => s.ListAsync(It.IsAny<ListHousekeepingTasksQuery>())).ReturnsAsync(ApiResponse<List<HousekeepingTaskDto>>.Ok(new List<HousekeepingTaskDto>()));
        var controller = CreateController(mock);
        var result = await controller.List(new ListHousekeepingTasksQuery { HotelId = Guid.NewGuid() });
        Assert.IsType<OkObjectResult>(result);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task Assign_ReturnsOkOrBad(bool ok)
    {
        var mock = new Mock<IHousekeepingTaskService>();
        var resp = ok ? ApiResponse<HousekeepingTaskDto>.Ok(new HousekeepingTaskDto()) : ApiResponse<HousekeepingTaskDto>.Fail("fail");
        mock.Setup(s => s.AssignAsync(It.IsAny<AssignHousekeeperRequest>())).ReturnsAsync(resp);
        var controller = CreateController(mock);
        var result = await controller.Assign(new AssignHousekeeperRequest { TaskId = Guid.NewGuid(), AssignedToUserId = Guid.NewGuid() });
        if (ok) Assert.IsType<OkObjectResult>(result); else Assert.IsType<BadRequestObjectResult>(result);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task UpdateNotes_ReturnsOkOrBad(bool ok)
    {
        var mock = new Mock<IHousekeepingTaskService>();
        var resp = ok ? ApiResponse<HousekeepingTaskDto>.Ok(new HousekeepingTaskDto()) : ApiResponse<HousekeepingTaskDto>.Fail("fail");
        mock.Setup(s => s.UpdateNotesAsync(It.IsAny<UpdateHousekeepingTaskNotesRequest>())).ReturnsAsync(resp);
        var controller = CreateController(mock);
        var result = await controller.UpdateNotes(new UpdateHousekeepingTaskNotesRequest { TaskId = Guid.NewGuid(), Notes = "n" });
        if (ok) Assert.IsType<OkObjectResult>(result); else Assert.IsType<BadRequestObjectResult>(result);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task Start_ReturnsOkOrBad(bool ok)
    {
        var mock = new Mock<IHousekeepingTaskService>();
        var resp = ok ? ApiResponse<HousekeepingTaskDto>.Ok(new HousekeepingTaskDto()) : ApiResponse<HousekeepingTaskDto>.Fail("fail");
        mock.Setup(s => s.StartAsync(It.IsAny<StartTaskRequest>())).ReturnsAsync(resp);
        var controller = CreateController(mock);
        var result = await controller.Start(new StartTaskRequest { TaskId = Guid.NewGuid(), Notes = "n" });
        if (ok) Assert.IsType<OkObjectResult>(result); else Assert.IsType<BadRequestObjectResult>(result);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task Complete_ReturnsOkOrBad(bool ok)
    {
        var mock = new Mock<IHousekeepingTaskService>();
        var resp = ok ? ApiResponse<HousekeepingTaskDto>.Ok(new HousekeepingTaskDto()) : ApiResponse<HousekeepingTaskDto>.Fail("fail");
        mock.Setup(s => s.CompleteAsync(It.IsAny<CompleteTaskRequest>())).ReturnsAsync(resp);
        var controller = CreateController(mock);
        var result = await controller.Complete(new CompleteTaskRequest { TaskId = Guid.NewGuid(), Notes = "n", EvidenceUrls = new List<string> { "a" } });
        if (ok) Assert.IsType<OkObjectResult>(result); else Assert.IsType<BadRequestObjectResult>(result);
    }
}
