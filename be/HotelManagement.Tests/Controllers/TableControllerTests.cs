using HotelManagement.Api.Controllers;
using HotelManagement.Services.Admin.Dining;
using HotelManagement.Services.Admin.Dining.Dtos;
using HotelManagement.Services.Common;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace HotelManagement.Tests.Controllers;

public class TableControllerTests
{
    private static TableController CreateController(Mock<ITableService> mock)
    {
        return new TableController(mock.Object);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task CreateTable_ReturnsOkOrBad(bool success)
    {
        var mock = new Mock<ITableService>();
        var resp = success ? ApiResponse<TableDto>.Ok(new TableDto()) : ApiResponse<TableDto>.Fail("fail");
        mock.Setup(s => s.CreateTableAsync(It.IsAny<CreateTableRequest>())).ReturnsAsync(resp);
        var controller = CreateController(mock);
        var result = await controller.CreateTable(new CreateTableRequest());
        if (success) Assert.IsType<OkObjectResult>(result); else Assert.IsType<BadRequestObjectResult>(result);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task UpdateTable_ReturnsOkOrBad(bool success)
    {
        var mock = new Mock<ITableService>();
        var resp = success ? ApiResponse<TableDto>.Ok(new TableDto()) : ApiResponse<TableDto>.Fail("fail");
        mock.Setup(s => s.UpdateTableAsync(It.IsAny<Guid>(), It.IsAny<UpdateTableRequest>())).ReturnsAsync(resp);
        var controller = CreateController(mock);
        var result = await controller.UpdateTable(Guid.NewGuid(), new UpdateTableRequest());
        if (success) Assert.IsType<OkObjectResult>(result); else Assert.IsType<BadRequestObjectResult>(result);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task GetTable_ReturnsOkOrNotFound(bool success)
    {
        var mock = new Mock<ITableService>();
        var resp = success ? ApiResponse<TableDto>.Ok(new TableDto()) : ApiResponse<TableDto>.Fail("not found");
        mock.Setup(s => s.GetTableAsync(It.IsAny<Guid>())).ReturnsAsync(resp);
        var controller = CreateController(mock);
        var result = await controller.GetTable(Guid.NewGuid());
        if (success) Assert.IsType<OkObjectResult>(result); else Assert.IsType<NotFoundObjectResult>(result);
    }

    [Fact]
    public async Task List_ReturnsOk()
    {
        var mock = new Mock<ITableService>();
        mock.Setup(s => s.GetTablesAsync(It.IsAny<Guid>(), It.IsAny<string?>(), It.IsAny<bool?>(), It.IsAny<int?>(), It.IsAny<int>(), It.IsAny<int>()))
            .ReturnsAsync(ApiResponse<TableListResponse>.Ok(new TableListResponse()));
        var controller = CreateController(mock);
        var result = await controller.List(Guid.NewGuid(), null, null, null, 1, 50);
        Assert.IsType<OkObjectResult>(result);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task Delete_ReturnsOkOrNotFound(bool success)
    {
        var mock = new Mock<ITableService>();
        var resp = success ? ApiResponse<bool>.Ok(true) : ApiResponse<bool>.Fail("fail");
        mock.Setup(s => s.DeleteTableAsync(It.IsAny<Guid>())).ReturnsAsync(resp);
        var controller = CreateController(mock);
        var result = await controller.Delete(Guid.NewGuid());
        if (success) Assert.IsType<OkObjectResult>(result); else Assert.IsType<NotFoundObjectResult>(result);
    }
}
