using HotelManagement.Api.Controllers;
using HotelManagement.Services.Admin.Minibar;
using HotelManagement.Services.Admin.Minibar.Dtos;
using HotelManagement.Services.Common;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace HotelManagement.Tests.Controllers;

public class MinibarsControllerTests
{
    private static MinibarsController CreateController(Mock<IMinibarService> mock)
    {
        return new MinibarsController(mock.Object);
    }

    [Fact]
    public async Task Create_ReturnsOk()
    {
        var mock = new Mock<IMinibarService>();
        mock.Setup(s => s.CreateAsync(It.IsAny<MinibarCreateRequest>())).ReturnsAsync(ApiResponse<MinibarDto>.Ok(new MinibarDto()));
        var controller = CreateController(mock);
        var result = await controller.Create(new MinibarCreateRequest());
        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Fact]
    public async Task Update_ReturnsOk()
    {
        var mock = new Mock<IMinibarService>();
        mock.Setup(s => s.UpdateAsync(It.IsAny<Guid>(), It.IsAny<MinibarUpdateRequest>())).ReturnsAsync(ApiResponse<MinibarDto>.Ok(new MinibarDto()));
        var controller = CreateController(mock);
        var result = await controller.Update(Guid.NewGuid(), new MinibarUpdateRequest());
        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Fact]
    public async Task Delete_ReturnsOk()
    {
        var mock = new Mock<IMinibarService>();
        mock.Setup(s => s.DeleteAsync(It.IsAny<Guid>())).ReturnsAsync(ApiResponse<bool>.Ok(true));
        var controller = CreateController(mock);
        var result = await controller.Delete(Guid.NewGuid());
        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Theory]
    [InlineData(null, null, null, 1, 50)]
    [InlineData("00000000-0000-0000-0000-000000000001", null, null, 2, 25)]
    [InlineData(null, "00000000-0000-0000-0000-000000000002", "coke", 1, 10)]
    public async Task List_ReturnsOk(string? hotelId, string? roomTypeId, string? search, int page, int pageSize)
    {
        var mock = new Mock<IMinibarService>();
        mock.Setup(s => s.GetAllAsync(It.IsAny<Guid?>(), It.IsAny<Guid?>(), It.IsAny<string?>(), It.IsAny<int>(), It.IsAny<int>()))
            .ReturnsAsync(ApiResponse<List<MinibarDto>>.Ok(new List<MinibarDto>(), meta: new { total = 0 }));
        var controller = CreateController(mock);
        Guid? hid = hotelId != null ? Guid.Parse(hotelId) : null;
        Guid? rid = roomTypeId != null ? Guid.Parse(roomTypeId) : null;
        var result = await controller.List(hid, rid, search, page, pageSize);
        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Fact]
    public async Task GetById_ReturnsOk()
    {
        var mock = new Mock<IMinibarService>();
        mock.Setup(s => s.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync(ApiResponse<MinibarDto>.Ok(new MinibarDto()));
        var controller = CreateController(mock);
        var result = await controller.GetById(Guid.NewGuid());
        Assert.IsType<OkObjectResult>(result.Result);
    }
}
