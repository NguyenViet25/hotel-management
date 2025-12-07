using HotelManagement.Api.Controllers;
using HotelManagement.Services.Admin.Orders;
using HotelManagement.Services.Admin.Orders.Dtos;
using HotelManagement.Services.Common;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace HotelManagement.Tests.Controllers;

public class OrdersControllerTests
{
    private static OrdersController CreateController(Mock<IOrdersService> mock)
    {
        return new OrdersController(mock.Object);
    }

    [Theory]
    [InlineData(null, null, null)]
    [InlineData("InProgress", null, null)]
    [InlineData("Completed", null, null)]
    [InlineData(null, "00000000-0000-0000-0000-000000000001", null)]
    [InlineData(null, null, 2)]
    public async Task List_ReturnsOk(string? status, string? hotelId, int? page)
    {
        var mock = new Mock<IOrdersService>();
        mock.Setup(s => s.ListAsync(It.IsAny<OrdersQueryDto>()))
            .ReturnsAsync(ApiResponse<List<OrderSummaryDto>>.Ok(new List<OrderSummaryDto> { new OrderSummaryDto() }));
        var controller = CreateController(mock);
        var query = new OrdersQueryDto { Status = status is null ? null : Enum.Parse<HotelManagement.Domain.OrderStatus>(status), HotelId = hotelId is null ? null : Guid.Parse(hotelId), Page = page ?? 1 };
        var result = await controller.List(query);
        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task CreateForBooking_ReturnsOkOrBad(bool success)
    {
        var mock = new Mock<IOrdersService>();
        var response = success ? ApiResponse<OrderDetailsDto>.Ok(new OrderDetailsDto()) : ApiResponse<OrderDetailsDto>.Fail("fail");
        mock.Setup(s => s.CreateForBookingAsync(It.IsAny<CreateBookingOrderDto>())).ReturnsAsync(response);
        var controller = CreateController(mock);
        var result = await controller.CreateForBooking(new CreateBookingOrderDto());
        if (success) Assert.IsType<OkObjectResult>(result.Result); else Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task UpdateForBooking_ReturnsOkOrBad(bool success)
    {
        var mock = new Mock<IOrdersService>();
        var response = success ? ApiResponse<OrderDetailsDto>.Ok(new OrderDetailsDto()) : ApiResponse<OrderDetailsDto>.Fail("fail");
        mock.Setup(s => s.UpdateForBookingAsync(It.IsAny<Guid>(), It.IsAny<UpdateOrderForBookingDto>())).ReturnsAsync(response);
        var controller = CreateController(mock);
        var result = await controller.Update(Guid.NewGuid(), new UpdateOrderForBookingDto());
        if (success) Assert.IsType<OkObjectResult>(result.Result); else Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task AddItem_ReturnsOkOrBad(bool success)
    {
        var mock = new Mock<IOrdersService>();
        var response = success ? ApiResponse<OrderDetailsDto>.Ok(new OrderDetailsDto()) : ApiResponse<OrderDetailsDto>.Fail("fail");
        mock.Setup(s => s.AddItemAsync(It.IsAny<Guid>(), It.IsAny<AddOrderItemDto>())).ReturnsAsync(response);
        var controller = CreateController(mock);
        var result = await controller.AddItem(Guid.NewGuid(), new AddOrderItemDto());
        if (success) Assert.IsType<OkObjectResult>(result.Result); else Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task UpdateItem_ReturnsOkOrBad(bool success)
    {
        var mock = new Mock<IOrdersService>();
        var response = success ? ApiResponse<OrderDetailsDto>.Ok(new OrderDetailsDto()) : ApiResponse<OrderDetailsDto>.Fail("fail");
        mock.Setup(s => s.UpdateItemAsync(It.IsAny<Guid>(), It.IsAny<Guid>(), It.IsAny<UpdateOrderItemDto>())).ReturnsAsync(response);
        var controller = CreateController(mock);
        var result = await controller.UpdateItem(Guid.NewGuid(), Guid.NewGuid(), new UpdateOrderItemDto());
        if (success) Assert.IsType<OkObjectResult>(result.Result); else Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task RemoveItem_ReturnsOkOrBad(bool success)
    {
        var mock = new Mock<IOrdersService>();
        var response = success ? ApiResponse<OrderDetailsDto>.Ok(new OrderDetailsDto()) : ApiResponse<OrderDetailsDto>.Fail("fail");
        mock.Setup(s => s.RemoveItemAsync(It.IsAny<Guid>(), It.IsAny<Guid>())).ReturnsAsync(response);
        var controller = CreateController(mock);
        var result = await controller.RemoveItem(Guid.NewGuid(), Guid.NewGuid());
        if (success) Assert.IsType<OkObjectResult>(result.Result); else Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task ReplaceItem_ReturnsOkOrBad(bool success)
    {
        var mock = new Mock<IOrdersService>();
        var response = success ? ApiResponse<OrderDetailsDto>.Ok(new OrderDetailsDto()) : ApiResponse<OrderDetailsDto>.Fail("fail");
        mock.Setup(s => s.ReplaceItemAsync(It.IsAny<Guid>(), It.IsAny<Guid>(), It.IsAny<ReplaceOrderItemDto>(), It.IsAny<Guid?>()))
            .ReturnsAsync(response);
        var controller = CreateController(mock);
        var result = await controller.ReplaceItem(Guid.NewGuid(), Guid.NewGuid(), new ReplaceOrderItemDto());
        if (success) Assert.IsType<OkObjectResult>(result.Result); else Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task ReplaceItem_PassesUserId_WhenClaimPresent()
    {
        var mock = new Mock<IOrdersService>();
        mock.Setup(s => s.ReplaceItemAsync(It.IsAny<Guid>(), It.IsAny<Guid>(), It.IsAny<ReplaceOrderItemDto>(), It.Is<Guid?>(uid => uid.HasValue)))
            .ReturnsAsync(ApiResponse<OrderDetailsDto>.Ok(new OrderDetailsDto()));
        var controller = CreateController(mock);
        var ctx = new Microsoft.AspNetCore.Http.DefaultHttpContext();
        ctx.User = new System.Security.Claims.ClaimsPrincipal(new System.Security.Claims.ClaimsIdentity(new[] { new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()) }, "TestAuth"));
        controller.ControllerContext = new ControllerContext { HttpContext = ctx };
        var result = await controller.ReplaceItem(Guid.NewGuid(), Guid.NewGuid(), new ReplaceOrderItemDto());
        Assert.IsType<OkObjectResult>(result.Result);
        mock.Verify(s => s.ReplaceItemAsync(It.IsAny<Guid>(), It.IsAny<Guid>(), It.IsAny<ReplaceOrderItemDto>(), It.Is<Guid?>(uid => uid.HasValue)), Times.Once);
    }
}
