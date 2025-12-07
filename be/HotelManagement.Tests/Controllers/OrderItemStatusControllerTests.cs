using HotelManagement.Api.Controllers;
using HotelManagement.Services.Admin.Kitchen;
using HotelManagement.Services.Admin.Kitchen.Dtos;
using HotelManagement.Services.Common;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace HotelManagement.Tests.Controllers;

public class OrderItemStatusControllerTests
{
    private static OrderItemStatusController CreateController(Mock<IOrderItemStatusService> mock)
    {
        return new OrderItemStatusController(mock.Object);
    }

    [Fact]
    public async Task GetPendingOrderItems_ReturnsOk()
    {
        var mock = new Mock<IOrderItemStatusService>();
        mock.Setup(s => s.GetPendingOrderItemsAsync(It.IsAny<Guid>(), It.IsAny<int>(), It.IsAny<int>()))
            .ReturnsAsync(ApiResponse<OrderItemStatusListResponse>.Ok(new OrderItemStatusListResponse()));
        var controller = CreateController(mock);
        var result = await controller.GetPendingOrderItems(Guid.NewGuid());
        Assert.IsType<OkObjectResult>(result);
    }

    [Theory]
    [InlineData(1, 10)]
    [InlineData(2, 5)]
    [InlineData(3, 20)]
    public async Task GetPendingOrderItems_WithPagination_ReturnsOk(int page, int pageSize)
    {
        var mock = new Mock<IOrderItemStatusService>();
        mock.Setup(s => s.GetPendingOrderItemsAsync(It.IsAny<Guid>(), page, pageSize))
            .ReturnsAsync(ApiResponse<OrderItemStatusListResponse>.Ok(new OrderItemStatusListResponse()));
        var controller = CreateController(mock);
        var result = await controller.GetPendingOrderItems(Guid.NewGuid(), page, pageSize);
        Assert.IsType<OkObjectResult>(result);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task GetOrderItemsByStatus_ReturnsOkOrBad(bool ok)
    {
        var mock = new Mock<IOrderItemStatusService>();
        var resp = ok ? ApiResponse<OrderItemStatusListResponse>.Ok(new OrderItemStatusListResponse()) : ApiResponse<OrderItemStatusListResponse>.Fail("fail");
        mock.Setup(s => s.GetOrderItemsByStatusAsync(It.IsAny<Guid>(), It.IsAny<string>(), It.IsAny<int>(), It.IsAny<int>()))
            .ReturnsAsync(resp);
        var controller = CreateController(mock);
        var result = await controller.GetOrderItemsByStatus(Guid.NewGuid(), "Pending");
        if (ok) Assert.IsType<OkObjectResult>(result); else Assert.IsType<BadRequestObjectResult>(result);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task UpdateStatus_ReturnsOkOrBad(bool ok)
    {
        var mock = new Mock<IOrderItemStatusService>();
        var resp = ok ? ApiResponse<OrderItemStatusDto>.Ok(new OrderItemStatusDto()) : ApiResponse<OrderItemStatusDto>.Fail("fail");
        mock.Setup(s => s.UpdateOrderItemStatusAsync(It.IsAny<Guid>(), It.IsAny<UpdateOrderItemStatusRequest>())).ReturnsAsync(resp);
        var controller = CreateController(mock);
        var result = await controller.UpdateOrderItemStatus(Guid.NewGuid(), new UpdateOrderItemStatusRequest { Status = "InProgress" });
        if (ok) Assert.IsType<OkObjectResult>(result); else Assert.IsType<BadRequestObjectResult>(result);
    }
}
