using HotelManagement.Services.Admin.Audit;
using HotelManagement.Services.Admin.Audit.Dtos;
using HotelManagement.Services.Admin.Bookings;
using HotelManagement.Services.Admin.Bookings.Dtos;
using HotelManagement.Services.Admin.Dining;
using HotelManagement.Services.Admin.Hotels;
using HotelManagement.Services.Admin.Housekeeping;
using HotelManagement.Services.Admin.Housekeeping.Dtos;
using HotelManagement.Services.Admin.Kitchen;
using HotelManagement.Services.Admin.Orders;
using HotelManagement.Services.Admin.Orders.Dtos;
using HotelManagement.Services.Admin.Users;
using HotelManagement.Services.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HotelManagement.Api.Controllers;

[ApiController]
[Route("api/dashboard")]
public class DashboardController : ControllerBase
{
    private readonly IHotelsAdminService _hotels;
    private readonly IUsersAdminService _users;
    private readonly IAuditService _audit;
    private readonly IRoomStatusService _roomStatus;
    private readonly IHousekeepingTaskService _housekeeping;
    private readonly IBookingsService _bookings;
    private readonly IOrdersService _orders;
    private readonly IDiningSessionService _diningSessions;
    private readonly IOrderItemStatusService _orderItems;

    public DashboardController(
        IHotelsAdminService hotels,
        IUsersAdminService users,
        IAuditService audit,
        IRoomStatusService roomStatus,
        IHousekeepingTaskService housekeeping,
        IBookingsService bookings,
        IOrdersService orders,
        IDiningSessionService diningSessions,
        IOrderItemStatusService orderItems)
    {
        _hotels = hotels;
        _users = users;
        _audit = audit;
        _roomStatus = roomStatus;
        _housekeeping = housekeeping;
        _bookings = bookings;
        _orders = orders;
        _diningSessions = diningSessions;
        _orderItems = orderItems;
    }

    private Guid? CurrentUserId()
    {
        var val = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(val, out var id) ? id : null;
    }

    public record AdminDashboardSummaryDto(int TotalHotels, int TotalUsers, int AuditCountLast24Hours);

    [HttpGet("admin/summary")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<AdminDashboardSummaryDto>>> GetAdminSummary()
    {
        var uid = CurrentUserId();
        if (uid == null) return Forbid();
        var isAdmin = true;

        var hotels = await _hotels.ListAllAsync();
        var usersList = await _users.ListAsync(new Services.Admin.Users.Dtos.UsersQueryDto(Page: 1, PageSize: 1));
        var (auditItems, auditTotal) = await _audit.QueryAsync(new AuditQueryDto(Page: 1, PageSize: 1, From: DateTimeOffset.UtcNow.AddDays(-1)), uid.Value, isAdmin);

        var dto = new AdminDashboardSummaryDto(
            TotalHotels: hotels.Count(),
            TotalUsers: usersList.Total,
            AuditCountLast24Hours: auditTotal
        );
        return Ok(ApiResponse<AdminDashboardSummaryDto>.Ok(dto));
    }

    public record ManagerDashboardSummaryDto(
        RoomStatusSummaryDto RoomSummary,
        int DirtyRoomsCount,
        int ActiveHousekeepingTaskCount,
        int OccupiedRoomsCount);

    [HttpGet("manager/summary")]
    [Authorize(Roles = "Manager")]
    public async Task<ActionResult<ApiResponse<ManagerDashboardSummaryDto>>> GetManagerSummary([FromQuery] Guid? hotelId)
    {
        if (hotelId == null || hotelId == Guid.Empty)
            return BadRequest(ApiResponse.Fail("HotelId is required"));

        var roomSummaryRes = await _roomStatus.GetRoomStatusSummaryAsync(hotelId.Value);
        var dirtyRoomsRes = await _roomStatus.GetRoomsByStatusAsync(hotelId.Value, HotelManagement.Domain.RoomStatus.Dirty);
        var tasksRes = await _housekeeping.ListAsync(new ListHousekeepingTasksQuery { HotelId = hotelId.Value, OnlyActive = true });

        var dto = new ManagerDashboardSummaryDto(
            RoomSummary: roomSummaryRes.Data!,
            DirtyRoomsCount: dirtyRoomsRes.Data?.Count ?? 0,
            ActiveHousekeepingTaskCount: tasksRes.Data?.Count ?? 0,
            OccupiedRoomsCount: roomSummaryRes.Data?.OccupiedRooms ?? 0
        );
        return Ok(ApiResponse<ManagerDashboardSummaryDto>.Ok(dto));
    }

    public record FrontDeskDashboardSummaryDto(int PendingBookings, int ConfirmedBookings, int CompletedBookings);

    [HttpGet("frontdesk/summary")]
    [Authorize(Roles = "FrontDesk")]
    public async Task<ActionResult<ApiResponse<FrontDeskDashboardSummaryDto>>> GetFrontDeskSummary([FromQuery] Guid? hotelId)
    {
        if (hotelId == null || hotelId == Guid.Empty)
            return BadRequest(ApiResponse.Fail("HotelId is required"));

        var pending = await _bookings.ListAsync(new BookingsQueryDto { HotelId = hotelId.Value, Status = HotelManagement.Domain.BookingStatus.Pending, Page = 1, PageSize = 1000 });
        var confirmed = await _bookings.ListAsync(new BookingsQueryDto { HotelId = hotelId.Value, Status = HotelManagement.Domain.BookingStatus.Confirmed, Page = 1, PageSize = 1000 });
        var completed = await _bookings.ListAsync(new BookingsQueryDto { HotelId = hotelId.Value, Status = HotelManagement.Domain.BookingStatus.Completed, Page = 1, PageSize = 1000 });

        var dto = new FrontDeskDashboardSummaryDto(
            PendingBookings: pending.Data?.Count ?? 0,
            ConfirmedBookings: confirmed.Data?.Count ?? 0,
            CompletedBookings: completed.Data?.Count ?? 0
        );
        return Ok(ApiResponse<FrontDeskDashboardSummaryDto>.Ok(dto));
    }

    public record WaiterDashboardSummaryDto(int OpenDiningSessions, int InProgressOrders);

    [HttpGet("waiter/summary")]
    [Authorize(Roles = "Waiter")]
    public async Task<ActionResult<ApiResponse<WaiterDashboardSummaryDto>>> GetWaiterSummary([FromQuery] Guid? hotelId)
    {
        if (hotelId == null || hotelId == Guid.Empty)
            return BadRequest(ApiResponse.Fail("HotelId is required"));

        var sessions = await _diningSessions.GetSessionsAsync(hotelId.Value, page: 1, pageSize: 1, status: HotelManagement.Domain.DiningSessionStatus.Open.ToString());
        var orders = await _orders.ListAsync(new OrdersQueryDto { HotelId = hotelId.Value, Status = HotelManagement.Domain.OrderStatus.InProgress, Page = 1, PageSize = 1000 });

        var dto = new WaiterDashboardSummaryDto(
            OpenDiningSessions: sessions.Data?.TotalCount ?? 0,
            InProgressOrders: orders.Data?.Count ?? 0
        );
        return Ok(ApiResponse<WaiterDashboardSummaryDto>.Ok(dto));
    }

    public record KitchenDashboardSummaryDto(int PendingOrderItems, int InProgressOrders);

    [HttpGet("kitchen/summary")]
    [Authorize(Roles = "Kitchen")]
    public async Task<ActionResult<ApiResponse<KitchenDashboardSummaryDto>>> GetKitchenSummary([FromQuery] Guid? hotelId)
    {
        if (hotelId == null || hotelId == Guid.Empty)
            return BadRequest(ApiResponse.Fail("HotelId is required"));

        var pendingItems = await _orderItems.GetPendingOrderItemsAsync(hotelId.Value, page: 1, pageSize: 1);
        var orders = await _orders.ListAsync(new OrdersQueryDto { HotelId = hotelId.Value, Status = HotelManagement.Domain.OrderStatus.InProgress, Page = 1, PageSize = 1000 });

        var dto = new KitchenDashboardSummaryDto(
            PendingOrderItems: pendingItems.Data?.TotalCount ?? 0,
            InProgressOrders: orders.Data?.Count ?? 0
        );
        return Ok(ApiResponse<KitchenDashboardSummaryDto>.Ok(dto));
    }

    public record HousekeeperDashboardSummaryDto(int AssignedActiveTasks, int DirtyRoomsCount);

    [HttpGet("housekeeper/summary")]
    [Authorize(Roles = "Housekeeper")]
    public async Task<ActionResult<ApiResponse<HousekeeperDashboardSummaryDto>>> GetHousekeeperSummary([FromQuery] Guid? hotelId)
    {
        var uid = CurrentUserId();
        if (uid == null) return Forbid();
        if (hotelId == null || hotelId == Guid.Empty)
            return BadRequest(ApiResponse.Fail("HotelId is required"));

        var tasks = await _housekeeping.ListAsync(new ListHousekeepingTasksQuery { HotelId = hotelId.Value, AssignedToUserId = uid.Value, OnlyActive = true });
        var dirty = await _roomStatus.GetRoomsByStatusAsync(hotelId.Value, HotelManagement.Domain.RoomStatus.Dirty);

        var dto = new HousekeeperDashboardSummaryDto(
            AssignedActiveTasks: tasks.Data?.Count ?? 0,
            DirtyRoomsCount: dirty.Data?.Count ?? 0
        );
        return Ok(ApiResponse<HousekeeperDashboardSummaryDto>.Ok(dto));
    }
}