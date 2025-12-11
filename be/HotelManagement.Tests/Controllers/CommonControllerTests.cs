using HotelManagement.Api.Controllers;
using HotelManagement.Services.Admin.Hotels;
using HotelManagement.Services.Admin.Hotels.Dtos;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace HotelManagement.Tests.Controllers;

public class CommonControllerTests
{
    [Theory]
    [InlineData(0)]
    [InlineData(1)]
    [InlineData(5)]
    [InlineData(10)]
    [InlineData(25)]
    public async Task ListHotels_ReturnsOk_WithVariousCounts(int count)
    {
        var hotels = new Mock<IHotelsAdminService>();
        hotels.Setup(h => h.ListAllAsync()).ReturnsAsync(Enumerable.Range(0, count).Select(_ => new HotelSummaryDto(Guid.NewGuid(), "C","Name","Addr", true, DateTime.Now)));
        var controller = new CommonController(hotels.Object);
        var result = await controller.ListHotels();
        Assert.IsType<OkObjectResult>(result);
        hotels.Verify(h => h.ListAllAsync(), Times.Once);
    }
}
