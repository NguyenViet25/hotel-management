using HotelManagement.Api.Controllers;
using HotelManagement.Services.Admin.Invoicing;
using HotelManagement.Services.Admin.Invoicing.Dtos;
using HotelManagement.Services.Common;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using System.Security.Claims;
using Xunit;

namespace HotelManagement.Tests.Controllers;

public class DiscountCodesControllerTests
{
    private static DiscountCodesController CreateController(Mock<IDiscountCodeService> mock, ClaimsPrincipal? user = null)
    {
        var controller = new DiscountCodesController(mock.Object);
        var ctx = new DefaultHttpContext();
        if (user != null) ctx.User = user;
        controller.ControllerContext = new ControllerContext { HttpContext = ctx };
        return controller;
    }

    [Fact]
    public async Task List_ReturnsBadRequest_WhenNoHotelClaim()
    {
        var mock = new Mock<IDiscountCodeService>();
        var controller = CreateController(mock);
        var result = await controller.List();
        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task List_ReturnsOk_WhenHotelClaimPresent()
    {
        var mock = new Mock<IDiscountCodeService>();
        mock.Setup(s => s.ListAsync(It.IsAny<Guid>())).ReturnsAsync(ApiResponse<List<PromotionDto>>.Ok(new List<PromotionDto>()));
        var user = new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim("hotelId", Guid.NewGuid().ToString()) }, "TestAuth"));
        var controller = CreateController(mock, user);
        var result = await controller.List();
        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task Get_ReturnsOkOrNotFound(bool ok)
    {
        var mock = new Mock<IDiscountCodeService>();
        var resp = ok ? ApiResponse<PromotionDto>.Ok(new PromotionDto()) : ApiResponse<PromotionDto>.Fail("not found");
        mock.Setup(s => s.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync(resp);
        var controller = CreateController(mock);
        var result = await controller.Get(Guid.NewGuid());
        if (ok) Assert.IsType<OkObjectResult>(result.Result); else Assert.IsType<NotFoundObjectResult>(result.Result);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task Create_ReturnsOkOrBad(bool ok)
    {
        var mock = new Mock<IDiscountCodeService>();
        var resp = ok ? ApiResponse<PromotionDto>.Ok(new PromotionDto()) : ApiResponse<PromotionDto>.Fail("fail");
        mock.Setup(s => s.CreateAsync(It.IsAny<PromotionDto>(), It.IsAny<Guid>())).ReturnsAsync(resp);
        var user = new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()) }, "TestAuth"));
        var controller = CreateController(mock, user);
        var result = await controller.Create(new PromotionDto());
        if (ok) Assert.IsType<OkObjectResult>(result.Result); else Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task Update_ReturnsOkOrBad(bool ok)
    {
        var mock = new Mock<IDiscountCodeService>();
        var resp = ok ? ApiResponse<PromotionDto>.Ok(new PromotionDto()) : ApiResponse<PromotionDto>.Fail("fail");
        mock.Setup(s => s.UpdateAsync(It.IsAny<Guid>(), It.IsAny<PromotionDto>(), It.IsAny<Guid>())).ReturnsAsync(resp);
        var user = new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()) }, "TestAuth"));
        var controller = CreateController(mock, user);
        var result = await controller.Update(Guid.NewGuid(), new PromotionDto());
        if (ok) Assert.IsType<OkObjectResult>(result.Result); else Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task Delete_ReturnsOkOrBad(bool ok)
    {
        var mock = new Mock<IDiscountCodeService>();
        var resp = ok ? ApiResponse.Ok() : ApiResponse.Fail("fail");
        mock.Setup(s => s.DeleteAsync(It.IsAny<Guid>(), It.IsAny<Guid>())).ReturnsAsync(resp);
        var user = new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()) }, "TestAuth"));
        var controller = CreateController(mock, user);
        var result = await controller.Delete(Guid.NewGuid());
        if (ok) Assert.IsType<OkObjectResult>(result.Result); else Assert.IsType<BadRequestObjectResult>(result.Result);
    }
}
