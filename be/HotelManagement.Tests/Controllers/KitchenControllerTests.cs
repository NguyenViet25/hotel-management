using HotelManagement.Api.Controllers;
using HotelManagement.Services.Admin.Kitchen;
using HotelManagement.Services.Common;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;
using System.Linq;

namespace HotelManagement.Tests.Controllers;

public class KitchenControllerTests
{
    private static KitchenController CreateController(Mock<IKitchenService> mock)
    {
        return new KitchenController(mock.Object);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task GenerateShoppingList_ReturnsOk(bool ok)
    {
        var mock = new Mock<IKitchenService>();
        var resp = ok ? ApiResponse.Ok() : ApiResponse.Fail("fail");
        mock.Setup(s => s.GenerateShoppingListAsync(It.IsAny<ShoppingListRequestDto>())).ReturnsAsync(resp);
        var controller = CreateController(mock);
        var result = await controller.GenerateShoppingList(new ShoppingListRequestDto());
        Assert.IsType<OkObjectResult>(result);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task UpdateShoppingList_ReturnsOk(bool ok)
    {
        var mock = new Mock<IKitchenService>();
        var resp = ok ? ApiResponse.Ok() : ApiResponse.Fail("fail");
        mock.Setup(s => s.UpdateShoppingListAsync(It.IsAny<ShoppingListRequestDto>())).ReturnsAsync(resp);
        var controller = CreateController(mock);
        var result = await controller.UpdateShoppingList(new ShoppingListRequestDto());
        Assert.IsType<OkObjectResult>(result);
    }

    [Fact]
    public async Task GetShopping_ReturnsOk()
    {
        var mock = new Mock<IKitchenService>();
        mock.Setup(s => s.GetShoppingOrderAsync(It.IsAny<Guid>())).ReturnsAsync(ApiResponse<ShoppingDto>.Ok(new ShoppingDto()));
        var controller = CreateController(mock);
        var result = await controller.GetShopping(Guid.NewGuid());
        Assert.IsType<OkObjectResult>(result);
    }

    [Fact]
    public async Task GetFoodsByWeek_ReturnsOk()
    {
        var mock = new Mock<IKitchenService>();
        mock.Setup(s => s.GetFoodByWeekRequestAsync(It.IsAny<GetFoodsByWeekRequest>())).ReturnsAsync(ApiResponse<GetFoodsByWeekResponse>.Ok(new GetFoodsByWeekResponse()));
        var controller = CreateController(mock);
        var result = await controller.GetFoodByWeeks(new GetFoodsByWeekRequest());
        Assert.IsType<OkObjectResult>(result);
    }

    [Theory]
    [InlineData(1)]
    [InlineData(5)]
    [InlineData(10)]
    public async Task GenerateShoppingList_WithItems_ReturnsOk(int itemCount)
    {
        var mock = new Mock<IKitchenService>();
        mock.Setup(s => s.GenerateShoppingListAsync(It.IsAny<ShoppingListRequestDto>())).ReturnsAsync(ApiResponse.Ok());
        var controller = CreateController(mock);
        var req = new ShoppingListRequestDto { ShoppingItems = Enumerable.Range(0, itemCount).Select(i => new ShoppingItemDto { Name = $"Item{i}", Quantity = "1", Unit = "pcs" }).ToList() };
        var result = await controller.GenerateShoppingList(req);
        Assert.IsType<OkObjectResult>(result);
    }
}
