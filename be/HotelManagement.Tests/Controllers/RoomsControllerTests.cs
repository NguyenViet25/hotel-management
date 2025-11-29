using HotelManagement.Api.Controllers;
using HotelManagement.Services.Admin.Rooms;
using HotelManagement.Services.Admin.Rooms.Dtos;
using HotelManagement.Services.Common;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace HotelManagement.Tests.Controllers;

public class RoomsControllerTests
{
    private static RoomsController CreateController(Mock<IRoomsService> mock)
    {
        return new RoomsController(mock.Object);
    }

    [Theory]
    [InlineData(null, null, null, null, null)]
    [InlineData("Available", null, null, null, "101")]
    [InlineData("Clean", null, null, 2, null)]
    [InlineData("Dirty", null, null, 5, "A")]
    [InlineData("OutOfService", null, null, null, null)]
    public async Task List_ReturnsOk(object? status, Guid? hotelId, Guid? roomTypeId, int? floor, string? search)
    {
        var mock = new Mock<IRoomsService>();
        mock.Setup(s => s.ListAsync(It.IsAny<RoomsQueryDto>()))
            .ReturnsAsync(ApiResponse<List<RoomSummaryDto>>.Ok(new List<RoomSummaryDto>{new RoomSummaryDto()}));
        var controller = CreateController(mock);

        var query = new RoomsQueryDto
        {
            HotelId = hotelId,
            RoomTypeId = roomTypeId,
            Floor = floor,
            Search = search,
            Status = status is null ? null : Enum.Parse<HotelManagement.Domain.RoomStatus>(status.ToString()!)
        };

        var result = await controller.List(query);
        Assert.IsType<OkObjectResult>(result.Result);
        var ok = (OkObjectResult)result.Result!;
        var payload = Assert.IsType<ApiResponse<List<RoomSummaryDto>>>(ok.Value);
        Assert.True(payload.IsSuccess);
        mock.Verify(s => s.ListAsync(It.IsAny<RoomsQueryDto>()), Times.Once);
    }

    [Theory]
    [InlineData("00000000-0000-0000-0000-000000000001")]
    [InlineData("00000000-0000-0000-0000-000000000002")]
    [InlineData("00000000-0000-0000-0000-000000000003")]
    [InlineData("00000000-0000-0000-0000-000000000004")]
    [InlineData("00000000-0000-0000-0000-000000000005")]
    public async Task ListByType_ReturnsOk(string id)
    {
        var mock = new Mock<IRoomsService>();
        mock.Setup(s => s.ListByTypeAsync(It.IsAny<Guid>()))
            .ReturnsAsync(ApiResponse<List<RoomSummaryDto>>.Ok(new List<RoomSummaryDto> { new RoomSummaryDto() }));
        var controller = CreateController(mock);
        var result = await controller.ListRoomByType(Guid.Parse(id));
        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Fact]
    public async Task Get_ReturnsNotFound_WhenFail()
    {
        var mock = new Mock<IRoomsService>();
        mock.Setup(s => s.GetByIdAsync(It.IsAny<Guid>()))
            .ReturnsAsync(ApiResponse<RoomSummaryDto>.Fail("not found"));
        var controller = CreateController(mock);
        var result = await controller.Get(Guid.NewGuid());
        Assert.IsType<NotFoundObjectResult>(result.Result);
    }

    [Fact]
    public async Task Get_ReturnsOk_WhenSuccess()
    {
        var mock = new Mock<IRoomsService>();
        mock.Setup(s => s.GetByIdAsync(It.IsAny<Guid>()))
            .ReturnsAsync(ApiResponse<RoomSummaryDto>.Ok(new RoomSummaryDto()));
        var controller = CreateController(mock);
        var result = await controller.Get(Guid.NewGuid());
        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task Create_ReturnsOkOrBad(bool success)
    {
        var mock = new Mock<IRoomsService>();
        var response = success ? ApiResponse<RoomSummaryDto>.Ok(new RoomSummaryDto()) : ApiResponse<RoomSummaryDto>.Fail("fail");
        mock.Setup(s => s.CreateAsync(It.IsAny<CreateRoomDto>())).ReturnsAsync(response);
        var controller = CreateController(mock);
        var dto = new CreateRoomDto { HotelId = Guid.NewGuid(), RoomTypeId = Guid.NewGuid(), Number = "101", Floor = 1 };
        var result = await controller.Create(dto);
        if (success) Assert.IsType<OkObjectResult>(result.Result); else Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task Update_ReturnsOkOrBad(bool success)
    {
        var mock = new Mock<IRoomsService>();
        var response = success ? ApiResponse<RoomSummaryDto>.Ok(new RoomSummaryDto()) : ApiResponse<RoomSummaryDto>.Fail("fail");
        mock.Setup(s => s.UpdateAsync(It.IsAny<Guid>(), It.IsAny<UpdateRoomDto>())).ReturnsAsync(response);
        var controller = CreateController(mock);
        var dto = new UpdateRoomDto { Number = "102" };
        var result = await controller.Update(Guid.NewGuid(), dto);
        if (success) Assert.IsType<OkObjectResult>(result.Result); else Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task Delete_ReturnsOkOrBad(bool success)
    {
        var mock = new Mock<IRoomsService>();
        var response = success ? ApiResponse.Ok() : ApiResponse.Fail("fail");
        mock.Setup(s => s.DeleteAsync(It.IsAny<Guid>())).ReturnsAsync(response);
        var controller = CreateController(mock);
        var result = await controller.Delete(Guid.NewGuid());
        if (success) Assert.IsType<OkObjectResult>(result.Result); else Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task SetOutOfService_ReturnsOkOrBad(bool success)
    {
        var mock = new Mock<IRoomsService>();
        var response = success ? ApiResponse<RoomSummaryDto>.Ok(new RoomSummaryDto()) : ApiResponse<RoomSummaryDto>.Fail("fail");
        mock.Setup(s => s.SetOutOfServiceAsync(It.IsAny<Guid>(), It.IsAny<SetOutOfServiceDto>())).ReturnsAsync(response);
        var controller = CreateController(mock);
        var result = await controller.SetOutOfService(Guid.NewGuid(), new SetOutOfServiceDto { Reason = "Maintenance" });
        if (success) Assert.IsType<OkObjectResult>(result.Result); else Assert.IsType<BadRequestObjectResult>(result.Result);
    }
}
