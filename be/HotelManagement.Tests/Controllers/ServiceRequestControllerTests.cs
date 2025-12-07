using HotelManagement.Api.Controllers;
using HotelManagement.Services.Admin.Dining;
using HotelManagement.Services.Admin.Dining.Dtos;
using HotelManagement.Services.Common;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace HotelManagement.Tests.Controllers;

public class ServiceRequestControllerTests
{
    private static ServiceRequestController CreateController(Mock<IServiceRequestService> mock)
    {
        return new ServiceRequestController(mock.Object);
    }

    [Fact]
    public async Task CreateRequest_ReturnsOk()
    {
        var mock = new Mock<IServiceRequestService>();
        mock.Setup(s => s.CreateRequestAsync(It.IsAny<CreateServiceRequestRequest>()))
            .ReturnsAsync(ApiResponse<ServiceRequestDto>.Ok(new ServiceRequestDto()));
        var controller = CreateController(mock);
        var result = await controller.CreateRequest(new CreateServiceRequestRequest());
        Assert.IsType<OkObjectResult>(result);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task UpdateRequest_ReturnsOkOrNotFound(bool success)
    {
        var mock = new Mock<IServiceRequestService>();
        var resp = success ? ApiResponse<ServiceRequestDto>.Ok(new ServiceRequestDto()) : ApiResponse<ServiceRequestDto>.Fail("not found");
        mock.Setup(s => s.UpdateRequestAsync(It.IsAny<Guid>(), It.IsAny<UpdateServiceRequestRequest>())).ReturnsAsync(resp);
        var controller = CreateController(mock);
        var result = await controller.UpdateRequest(Guid.NewGuid(), new UpdateServiceRequestRequest());
        if (success) Assert.IsType<OkObjectResult>(result); else Assert.IsType<NotFoundObjectResult>(result);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task GetRequest_ReturnsOkOrNotFound(bool success)
    {
        var mock = new Mock<IServiceRequestService>();
        var resp = success ? ApiResponse<ServiceRequestDto>.Ok(new ServiceRequestDto()) : ApiResponse<ServiceRequestDto>.Fail("not found");
        mock.Setup(s => s.GetRequestAsync(It.IsAny<Guid>())).ReturnsAsync(resp);
        var controller = CreateController(mock);
        var result = await controller.GetRequest(Guid.NewGuid());
        if (success) Assert.IsType<OkObjectResult>(result); else Assert.IsType<NotFoundObjectResult>(result);
    }

    [Fact]
    public async Task GetRequestsBySession_ReturnsOk()
    {
        var mock = new Mock<IServiceRequestService>();
        mock.Setup(s => s.GetRequestsBySessionAsync(It.IsAny<Guid>(), It.IsAny<int>(), It.IsAny<int>()))
            .ReturnsAsync(ApiResponse<ServiceRequestListResponse>.Ok(new ServiceRequestListResponse()));
        var controller = CreateController(mock);
        var result = await controller.GetRequestsBySession(Guid.NewGuid());
        Assert.IsType<OkObjectResult>(result);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task CompleteRequest_ReturnsOkOrNotFound(bool success)
    {
        var mock = new Mock<IServiceRequestService>();
        var resp = success ? ApiResponse<bool>.Ok(true) : ApiResponse<bool>.Fail("not found");
        mock.Setup(s => s.CompleteRequestAsync(It.IsAny<Guid>())).ReturnsAsync(resp);
        var controller = CreateController(mock);
        var result = await controller.CompleteRequest(Guid.NewGuid());
        if (success) Assert.IsType<OkObjectResult>(result); else Assert.IsType<NotFoundObjectResult>(result);
    }
}
