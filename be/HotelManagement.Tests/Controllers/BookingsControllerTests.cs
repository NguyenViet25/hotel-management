using HotelManagement.Api.Controllers;
using HotelManagement.Services.Admin.Bookings;
using HotelManagement.Services.Admin.Bookings.Dtos;
using HotelManagement.Services.Common;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace HotelManagement.Tests.Controllers;

public class BookingsControllerTests
{
    private static BookingsController CreateController(Mock<IBookingsService> mock)
    {
        var env = new Mock<IWebHostEnvironment>();
        var media = new Mock<HotelManagement.Services.Admin.Medias.IMediaService>();
        return new BookingsController(mock.Object, env.Object, media.Object);
    }

    [Fact]
    public async Task Create_ReturnsOk()
    {
        var mock = new Mock<IBookingsService>();
        mock.Setup(s => s.CreateAsync(It.IsAny<CreateBookingDto>()))
            .ReturnsAsync(ApiResponse<BookingDetailsDto>.Ok(new BookingDetailsDto()));
        var controller = CreateController(mock);
        var result = await controller.Create(new CreateBookingDto());
        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Fact]
    public async Task List_ReturnsOk()
    {
        var mock = new Mock<IBookingsService>();
        mock.Setup(s => s.ListAsync(It.IsAny<BookingsQueryDto>()))
            .ReturnsAsync(ApiResponse<List<BookingDetailsDto>>.Ok(new List<BookingDetailsDto> { new BookingDetailsDto() }));
        var controller = CreateController(mock);
        var result = await controller.List(new BookingsQueryDto());
        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Fact]
    public async Task Get_ReturnsOk()
    {
        var mock = new Mock<IBookingsService>();
        mock.Setup(s => s.GetByIdAsync(It.IsAny<Guid>()))
            .ReturnsAsync(ApiResponse<BookingDetailsDto>.Ok(new BookingDetailsDto()));
        var controller = CreateController(mock);
        var result = await controller.Get(Guid.NewGuid());
        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task AddCallLog_ReturnsOk(bool plural)
    {
        var mock = new Mock<IBookingsService>();
        mock.Setup(s => s.AddCallLogAsync(It.IsAny<Guid>(), It.IsAny<AddCallLogDto>()))
            .ReturnsAsync(ApiResponse<CallLogDto>.Ok(new CallLogDto()));
        var controller = CreateController(mock);
        var id = Guid.NewGuid();
        var dto = new AddCallLogDto();
        var result = plural ? await controller.AddCallLogPlural(id, dto) : await controller.AddCallLog(id, dto);
        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Fact]
    public async Task Confirm_ReturnsOk()
    {
        var mock = new Mock<IBookingsService>();
        mock.Setup(s => s.ConfirmAsync(It.IsAny<Guid>())).ReturnsAsync(ApiResponse.Ok());
        var controller = CreateController(mock);
        var result = await controller.Confirm(Guid.NewGuid());
        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Fact]
    public async Task Cancel_ReturnsOk()
    {
        var mock = new Mock<IBookingsService>();
        mock.Setup(s => s.CancelAsync(It.IsAny<Guid>())).ReturnsAsync(ApiResponse.Ok());
        var controller = CreateController(mock);
        var result = await controller.Cancel(Guid.NewGuid());
        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Fact]
    public async Task RoomMap_ReturnsOk()
    {
        var mock = new Mock<IBookingsService>();
        mock.Setup(s => s.GetRoomMapAsync(It.IsAny<RoomMapQueryDto>()))
            .ReturnsAsync(ApiResponse<List<RoomMapItemDto>>.Ok(new List<RoomMapItemDto>()));
        var controller = CreateController(mock);
        var result = await controller.RoomMap(new RoomMapQueryDto());
        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Fact]
    public async Task RoomAvailability_ReturnsOk()
    {
        var mock = new Mock<IBookingsService>();
        mock.Setup(s => s.GetRoomAvailabilityAsync(It.IsAny<RoomAvailabilityQueryDto>()))
            .ReturnsAsync(ApiResponse<object>.Ok(new object()));
        var controller = CreateController(mock);
        var result = await controller.RoomAvailability(new RoomAvailabilityQueryDto());
        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Fact]
    public async Task RoomSchedule_ReturnsOk()
    {
        var mock = new Mock<IBookingsService>();
        mock.Setup(s => s.GetRoomScheduleAsync(It.IsAny<Guid>(), It.IsAny<DateTime>(), It.IsAny<DateTime>()))
            .ReturnsAsync(ApiResponse<List<BookingIntervalDto>>.Ok(new List<BookingIntervalDto>()));
        var controller = CreateController(mock);
        var result = await controller.RoomSchedule(Guid.NewGuid(), DateTime.UtcNow, DateTime.UtcNow.AddDays(1));
        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Fact]
    public async Task AddRoomToBooking_ReturnsOk()
    {
        var mock = new Mock<IBookingsService>();
        mock.Setup(s => s.AddRoomToBookingAsync(It.IsAny<Guid>(), It.IsAny<Guid>()))
            .ReturnsAsync(ApiResponse.Ok());
        var controller = CreateController(mock);
        var result = await controller.AddRoomToBooking(new AddRoomToBooking { BookingRoomTypeId = Guid.NewGuid(), RoomId = Guid.NewGuid() });
        Assert.IsType<OkObjectResult>(result);
    }

    [Fact]
    public async Task ChangeRoom_ReturnsOk()
    {
        var mock = new Mock<IBookingsService>();
        mock.Setup(s => s.ChangeRoomAsync(It.IsAny<Guid>(), It.IsAny<Guid>()))
            .ReturnsAsync(ApiResponse<BookingDetailsDto>.Ok(new BookingDetailsDto()));
        var controller = CreateController(mock);
        var result = await controller.ChangeRoom(Guid.NewGuid(), new ChangeRoomDto { NewRoomId = Guid.NewGuid() });
        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task ExtendStay_ReturnsOk_WithSuccessFlag(bool success)
    {
        var mock = new Mock<IBookingsService>();
        var resp = success ? ApiResponse.Ok() : ApiResponse.Fail("fail");
        mock.Setup(s => s.ExtendStayAsync(It.IsAny<Guid>(), It.IsAny<DateTime>(), It.IsAny<string?>()))
            .ReturnsAsync(resp);
        var controller = CreateController(mock);
        var result = await controller.ExtendStay(Guid.NewGuid(), new ExtendStayDto { NewEndDate = DateTime.UtcNow.AddDays(2), DiscountCode = null });
        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var payload = Assert.IsType<ApiResponse>(ok.Value);
        Assert.Equal(success, payload.IsSuccess);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task CheckOut_ReturnsOk_WithSuccessFlag(bool success)
    {
        var mock = new Mock<IBookingsService>();
        var resp = success ? ApiResponse<CheckoutResultDto>.Ok(new CheckoutResultDto()) : ApiResponse<CheckoutResultDto>.Fail("fail");
        mock.Setup(s => s.CheckOutAsync(It.IsAny<Guid>(), It.IsAny<CheckoutRequestDto>())).ReturnsAsync(resp);
        var controller = CreateController(mock);
        var result = await controller.CheckOut(Guid.NewGuid(), new CheckoutRequestDto());
        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var payload = Assert.IsType<ApiResponse<CheckoutResultDto>>(ok.Value);
        Assert.Equal(success, payload.IsSuccess);
    }

    [Fact]
    public async Task AdditionalChargesPreview_ReturnsOk()
    {
        var mock = new Mock<IBookingsService>();
        mock.Setup(s => s.GetAdditionalChargesPreviewAsync(It.IsAny<Guid>()))
            .ReturnsAsync(ApiResponse<AdditionalChargesDto>.Ok(new AdditionalChargesDto()));
        var controller = CreateController(mock);
        var result = await controller.AdditionalChargesPreview(Guid.NewGuid());
        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Fact]
    public async Task RecordMinibar_ReturnsOk()
    {
        var mock = new Mock<IBookingsService>();
        mock.Setup(s => s.RecordMinibarConsumptionAsync(It.IsAny<Guid>(), It.IsAny<MinibarConsumptionDto>()))
            .ReturnsAsync(ApiResponse.Ok());
        var controller = CreateController(mock);
        var result = await controller.RecordMinibar(Guid.NewGuid(), new MinibarConsumptionDto());
        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Fact]
    public async Task UpdateGuestInRoom_ReturnsOk()
    {
        var mock = new Mock<IBookingsService>();
        mock.Setup(s => s.UpdateGuestInRoomAsync(It.IsAny<Guid>(), It.IsAny<Guid>(), It.IsAny<UpdateGuestDto>()))
            .ReturnsAsync(ApiResponse.Ok());
        var controller = CreateController(mock);
        var result = await controller.UpdateGuestInRoom(Guid.NewGuid(), Guid.NewGuid(), new UpdateGuestDto());
        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Fact]
    public async Task RemoveGuestFromRoom_ReturnsOk()
    {
        var mock = new Mock<IBookingsService>();
        mock.Setup(s => s.RemoveGuestFromRoomAsync(It.IsAny<Guid>(), It.IsAny<Guid>()))
            .ReturnsAsync(ApiResponse.Ok());
        var controller = CreateController(mock);
        var result = await controller.RemoveGuestFromRoom(Guid.NewGuid(), Guid.NewGuid());
        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Fact]
    public async Task UpdateRoomDates_ReturnsOk()
    {
        var mock = new Mock<IBookingsService>();
        mock.Setup(s => s.UpdateRoomDatesAsync(It.IsAny<Guid>(), It.IsAny<DateTime>(), It.IsAny<DateTime>()))
            .ReturnsAsync(ApiResponse<BookingDetailsDto>.Ok(new BookingDetailsDto()));
        var controller = CreateController(mock);
        var result = await controller.UpdateRoomDates(Guid.NewGuid(), new UpdateBookingRoomDatesDto { StartDate = DateTime.UtcNow, EndDate = DateTime.UtcNow.AddDays(1) });
        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Fact]
    public async Task UpdateRoomActualTimes_ReturnsOk()
    {
        var mock = new Mock<IBookingsService>();
        mock.Setup(s => s.UpdateRoomActualTimesAsync(It.IsAny<Guid>(), It.IsAny<DateTime?>(), It.IsAny<DateTime?>()))
            .ReturnsAsync(ApiResponse<BookingDetailsDto>.Ok(new BookingDetailsDto()));
        var controller = CreateController(mock);
        var result = await controller.UpdateRoomActualTimes(Guid.NewGuid(), new UpdateBookingRoomActualTimesDto { ActualCheckInAt = DateTime.UtcNow, ActualCheckOutAt = DateTime.UtcNow.AddHours(1) });
        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Fact]
    public async Task MoveGuest_ReturnsOk()
    {
        var mock = new Mock<IBookingsService>();
        mock.Setup(s => s.MoveGuestAsync(It.IsAny<Guid>(), It.IsAny<Guid>(), It.IsAny<Guid>()))
            .ReturnsAsync(ApiResponse<BookingDetailsDto>.Ok(new BookingDetailsDto()));
        var controller = CreateController(mock);
        var result = await controller.MoveGuest(Guid.NewGuid(), Guid.NewGuid(), new MoveGuestDto { TargetBookingRoomId = Guid.NewGuid() });
        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Fact]
    public async Task SwapGuests_ReturnsOk()
    {
        var mock = new Mock<IBookingsService>();
        mock.Setup(s => s.SwapGuestsAsync(It.IsAny<Guid>(), It.IsAny<Guid>(), It.IsAny<Guid>(), It.IsAny<Guid>()))
            .ReturnsAsync(ApiResponse<BookingDetailsDto>.Ok(new BookingDetailsDto()));
        var controller = CreateController(mock);
        var result = await controller.SwapGuests(Guid.NewGuid(), Guid.NewGuid(), new SwapGuestsDto { TargetBookingRoomId = Guid.NewGuid(), TargetGuestId = Guid.NewGuid() });
        Assert.IsType<OkObjectResult>(result.Result);
    }
}
