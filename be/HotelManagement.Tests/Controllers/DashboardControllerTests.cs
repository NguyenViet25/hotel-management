using HotelManagement.Api.Controllers;
using HotelManagement.Services.Admin.Audit;
using HotelManagement.Services.Admin.Audit.Dtos;
using HotelManagement.Services.Admin.Bookings;
using HotelManagement.Services.Admin.Bookings.Dtos;
using HotelManagement.Services.Admin.Dining;
using HotelManagement.Services.Admin.Dining.Dtos;
using HotelManagement.Services.Admin.Hotels;
using HotelManagement.Services.Admin.Hotels.Dtos;
using HotelManagement.Services.Admin.Housekeeping;
using HotelManagement.Services.Admin.Housekeeping.Dtos;
using HotelManagement.Services.Admin.Kitchen;
using HotelManagement.Services.Admin.Kitchen.Dtos;
using HotelManagement.Services.Admin.Orders;
using HotelManagement.Services.Admin.Orders.Dtos;
using HotelManagement.Services.Admin.Users;
using HotelManagement.Services.Admin.Users.Dtos;
using HotelManagement.Services.Common;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using System.Security.Claims;
using Xunit;

namespace HotelManagement.Tests.Controllers;

public class DashboardControllerTests
{
    private static DashboardController CreateController(
        Mock<IHotelsAdminService> hotels,
        Mock<IUsersAdminService> users,
        Mock<IAuditService> audit,
        Mock<IRoomStatusService> roomStatus,
        Mock<IHousekeepingTaskService> housekeeping,
        Mock<IBookingsService> bookings,
        Mock<IOrdersService> orders,
        Mock<IDiningSessionService> sessions,
        Mock<IOrderItemStatusService> orderItems,
        ClaimsPrincipal? user = null)
    {
        var controller = new DashboardController(hotels.Object, users.Object, audit.Object, roomStatus.Object, housekeeping.Object, bookings.Object, orders.Object, sessions.Object, orderItems.Object);
        var ctx = new DefaultHttpContext();
        if (user != null) ctx.User = user;
        controller.ControllerContext = new ControllerContext { HttpContext = ctx };
        return controller;
    }

    [Fact]
    public async Task AdminSummary_Forbid_WhenNoUser()
    {
        var hotels = new Mock<IHotelsAdminService>();
        var users = new Mock<IUsersAdminService>();
        var audit = new Mock<IAuditService>();
        var roomStatus = new Mock<IRoomStatusService>();
        var housekeeping = new Mock<IHousekeepingTaskService>();
        var bookings = new Mock<IBookingsService>();
        var orders = new Mock<IOrdersService>();
        var sessions = new Mock<IDiningSessionService>();
        var orderItems = new Mock<IOrderItemStatusService>();
        var controller = CreateController(hotels, users, audit, roomStatus, housekeeping, bookings, orders, sessions, orderItems);
        var result = await controller.GetAdminSummary();
        Assert.IsType<ForbidResult>(result.Result);
    }

    [Fact]
    public async Task AdminSummary_ReturnsOk()
    {
        var hotels = new Mock<IHotelsAdminService>();
        hotels.Setup(h => h.ListAllAsync()).ReturnsAsync(new List<HotelSummaryDto> { new HotelSummaryDto(Guid.NewGuid(), "C","Name","Addr", true, DateTime.UtcNow) });
        var users = new Mock<IUsersAdminService>();
        users.Setup(u => u.ListAsync(It.IsAny<UsersQueryDto>())).ReturnsAsync((new List<UserSummaryDto> { new UserSummaryDto(Guid.NewGuid(), "user","email","0123","Full Name", true, null, Enumerable.Empty<string>(), Enumerable.Empty<UserPropertyRoleDto>()) }, 42));
        var audit = new Mock<IAuditService>();
        audit.Setup(a => a.QueryAsync(It.IsAny<AuditQueryDto>(), It.IsAny<Guid>(), true)).ReturnsAsync((new List<AuditLogDto>(), 7));
        var roomStatus = new Mock<IRoomStatusService>();
        var housekeeping = new Mock<IHousekeepingTaskService>();
        var bookings = new Mock<IBookingsService>();
        var orders = new Mock<IOrdersService>();
        var sessions = new Mock<IDiningSessionService>();
        var orderItems = new Mock<IOrderItemStatusService>();
        var user = new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()), new Claim(ClaimTypes.Role, "Admin") }, "TestAuth"));
        var controller = CreateController(hotels, users, audit, roomStatus, housekeeping, bookings, orders, sessions, orderItems, user);
        var result = await controller.GetAdminSummary();
        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var payload = Assert.IsType<ApiResponse<DashboardController.AdminDashboardSummaryDto>>(ok.Value);
        Assert.True(payload.IsSuccess);
    }

    [Fact]
    public async Task ManagerSummary_BadRequest_WhenNoHotelId()
    {
        var c = CreateController(new Mock<IHotelsAdminService>(), new Mock<IUsersAdminService>(), new Mock<IAuditService>(), new Mock<IRoomStatusService>(), new Mock<IHousekeepingTaskService>(), new Mock<IBookingsService>(), new Mock<IOrdersService>(), new Mock<IDiningSessionService>(), new Mock<IOrderItemStatusService>(), new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim(ClaimTypes.Role, "Manager") }, "TestAuth")));
        var result = await c.GetManagerSummary(null);
        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task ManagerSummary_ReturnsOk()
    {
        var roomStatus = new Mock<IRoomStatusService>();
        roomStatus.Setup(r => r.GetRoomStatusSummaryAsync(It.IsAny<Guid>())).ReturnsAsync(ApiResponse<RoomStatusSummaryDto>.Ok(new RoomStatusSummaryDto()));
        roomStatus.Setup(r => r.GetRoomsByStatusAsync(It.IsAny<Guid>(), HotelManagement.Domain.RoomStatus.Dirty)).ReturnsAsync(ApiResponse<List<RoomWithStatusDto>>.Ok(new List<RoomWithStatusDto>()))
;
        var housekeeping = new Mock<IHousekeepingTaskService>();
        housekeeping.Setup(h => h.ListAsync(It.IsAny<ListHousekeepingTasksQuery>())).ReturnsAsync(ApiResponse<List<HousekeepingTaskDto>>.Ok(new List<HousekeepingTaskDto>()));
        var controller = CreateController(new Mock<IHotelsAdminService>(), new Mock<IUsersAdminService>(), new Mock<IAuditService>(), roomStatus, housekeeping, new Mock<IBookingsService>(), new Mock<IOrdersService>(), new Mock<IDiningSessionService>(), new Mock<IOrderItemStatusService>(), new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim(ClaimTypes.Role, "Manager") }, "TestAuth")));
        var result = await controller.GetManagerSummary(Guid.NewGuid());
        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Fact]
    public async Task FrontDeskSummary_BadRequest_WhenNoHotelId()
    {
        var controller = CreateController(new Mock<IHotelsAdminService>(), new Mock<IUsersAdminService>(), new Mock<IAuditService>(), new Mock<IRoomStatusService>(), new Mock<IHousekeepingTaskService>(), new Mock<IBookingsService>(), new Mock<IOrdersService>(), new Mock<IDiningSessionService>(), new Mock<IOrderItemStatusService>(), new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim(ClaimTypes.Role, "FrontDesk") }, "TestAuth")));
        var result = await controller.GetFrontDeskSummary(null);
        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task FrontDeskSummary_ReturnsOk()
    {
        var bookings = new Mock<IBookingsService>();
        bookings.Setup(b => b.ListAsync(It.IsAny<BookingsQueryDto>())).ReturnsAsync(ApiResponse<List<BookingDetailsDto>>.Ok(new List<BookingDetailsDto>()));
        var controller = CreateController(new Mock<IHotelsAdminService>(), new Mock<IUsersAdminService>(), new Mock<IAuditService>(), new Mock<IRoomStatusService>(), new Mock<IHousekeepingTaskService>(), bookings, new Mock<IOrdersService>(), new Mock<IDiningSessionService>(), new Mock<IOrderItemStatusService>(), new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim(ClaimTypes.Role, "FrontDesk") }, "TestAuth")));
        var result = await controller.GetFrontDeskSummary(Guid.NewGuid());
        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Fact]
    public async Task WaiterSummary_BadRequest_WhenNoHotelId()
    {
        var controller = CreateController(new Mock<IHotelsAdminService>(), new Mock<IUsersAdminService>(), new Mock<IAuditService>(), new Mock<IRoomStatusService>(), new Mock<IHousekeepingTaskService>(), new Mock<IBookingsService>(), new Mock<IOrdersService>(), new Mock<IDiningSessionService>(), new Mock<IOrderItemStatusService>(), new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim(ClaimTypes.Role, "Waiter") }, "TestAuth")));
        var result = await controller.GetWaiterSummary(null);
        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task WaiterSummary_ReturnsOk()
    {
        var sessions = new Mock<IDiningSessionService>();
        sessions.Setup(s => s.GetSessionsAsync(It.IsAny<Guid>(), 1, 1, HotelManagement.Domain.DiningSessionStatus.Open.ToString())).ReturnsAsync(ApiResponse<DiningSessionListResponse>.Ok(new DiningSessionListResponse { TotalCount = 2 }));
        var orders = new Mock<IOrdersService>();
        orders.Setup(o => o.ListAsync(It.IsAny<OrdersQueryDto>())).ReturnsAsync(ApiResponse<List<OrderSummaryDto>>.Ok(new List<OrderSummaryDto> { new OrderSummaryDto() }));
        var controller = CreateController(new Mock<IHotelsAdminService>(), new Mock<IUsersAdminService>(), new Mock<IAuditService>(), new Mock<IRoomStatusService>(), new Mock<IHousekeepingTaskService>(), new Mock<IBookingsService>(), orders, sessions, new Mock<IOrderItemStatusService>(), new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim(ClaimTypes.Role, "Waiter") }, "TestAuth")));
        var result = await controller.GetWaiterSummary(Guid.NewGuid());
        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Fact]
    public async Task KitchenSummary_BadRequest_WhenNoHotelId()
    {
        var controller = CreateController(new Mock<IHotelsAdminService>(), new Mock<IUsersAdminService>(), new Mock<IAuditService>(), new Mock<IRoomStatusService>(), new Mock<IHousekeepingTaskService>(), new Mock<IBookingsService>(), new Mock<IOrdersService>(), new Mock<IDiningSessionService>(), new Mock<IOrderItemStatusService>(), new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim(ClaimTypes.Role, "Kitchen") }, "TestAuth")));
        var result = await controller.GetKitchenSummary(null);
        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task KitchenSummary_ReturnsOk()
    {
        var orderItems = new Mock<IOrderItemStatusService>();
        orderItems.Setup(oi => oi.GetPendingOrderItemsAsync(It.IsAny<Guid>(), 1, 1)).ReturnsAsync(ApiResponse<OrderItemStatusListResponse>.Ok(new OrderItemStatusListResponse { TotalCount = 3 }));
        var orders = new Mock<IOrdersService>();
        orders.Setup(o => o.ListAsync(It.IsAny<OrdersQueryDto>())).ReturnsAsync(ApiResponse<List<OrderSummaryDto>>.Ok(new List<OrderSummaryDto> { new OrderSummaryDto() }));
        var controller = CreateController(new Mock<IHotelsAdminService>(), new Mock<IUsersAdminService>(), new Mock<IAuditService>(), new Mock<IRoomStatusService>(), new Mock<IHousekeepingTaskService>(), new Mock<IBookingsService>(), orders, new Mock<IDiningSessionService>(), orderItems, new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim(ClaimTypes.Role, "Kitchen") }, "TestAuth")));
        var result = await controller.GetKitchenSummary(Guid.NewGuid());
        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Fact]
    public async Task HousekeeperSummary_Forbid_WhenNoUser()
    {
        var controller = CreateController(new Mock<IHotelsAdminService>(), new Mock<IUsersAdminService>(), new Mock<IAuditService>(), new Mock<IRoomStatusService>(), new Mock<IHousekeepingTaskService>(), new Mock<IBookingsService>(), new Mock<IOrdersService>(), new Mock<IDiningSessionService>(), new Mock<IOrderItemStatusService>());
        var result = await controller.GetHousekeeperSummary(Guid.NewGuid());
        Assert.IsType<ForbidResult>(result.Result);
    }

    [Fact]
    public async Task HousekeeperSummary_BadRequest_WhenNoHotelId()
    {
        var user = new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()), new Claim(ClaimTypes.Role, "Housekeeper") }, "TestAuth"));
        var controller = CreateController(new Mock<IHotelsAdminService>(), new Mock<IUsersAdminService>(), new Mock<IAuditService>(), new Mock<IRoomStatusService>(), new Mock<IHousekeepingTaskService>(), new Mock<IBookingsService>(), new Mock<IOrdersService>(), new Mock<IDiningSessionService>(), new Mock<IOrderItemStatusService>(), user);
        var result = await controller.GetHousekeeperSummary(null);
        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task HousekeeperSummary_ReturnsOk()
    {
        var housekeeping = new Mock<IHousekeepingTaskService>();
        housekeeping.Setup(h => h.ListAsync(It.IsAny<ListHousekeepingTasksQuery>())).ReturnsAsync(ApiResponse<List<HousekeepingTaskDto>>.Ok(new List<HousekeepingTaskDto>()));
        var roomStatus = new Mock<IRoomStatusService>();
        roomStatus.Setup(r => r.GetRoomsByStatusAsync(It.IsAny<Guid>(), HotelManagement.Domain.RoomStatus.Dirty)).ReturnsAsync(ApiResponse<List<RoomWithStatusDto>>.Ok(new List<RoomWithStatusDto>()));
        var user = new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()), new Claim(ClaimTypes.Role, "Housekeeper") }, "TestAuth"));
        var controller = CreateController(new Mock<IHotelsAdminService>(), new Mock<IUsersAdminService>(), new Mock<IAuditService>(), roomStatus, housekeeping, new Mock<IBookingsService>(), new Mock<IOrdersService>(), new Mock<IDiningSessionService>(), new Mock<IOrderItemStatusService>(), user);
        var result = await controller.GetHousekeeperSummary(Guid.NewGuid());
        Assert.IsType<OkObjectResult>(result.Result);
    }
}
