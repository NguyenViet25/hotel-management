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
using HotelManagement.Services.Admin.Invoicing;
using HotelManagement.Services.Admin.Invoicing.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Linq;
using HotelManagement.Domain;

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
    private readonly IInvoiceService _invoiceService;

    public DashboardController(
        IHotelsAdminService hotels,
        IUsersAdminService users,
        IAuditService audit,
        IRoomStatusService roomStatus,
        IHousekeepingTaskService housekeeping,
        IBookingsService bookings,
        IOrdersService orders,
        IDiningSessionService diningSessions,
        IOrderItemStatusService orderItems,
        IInvoiceService invoiceService)
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
        _invoiceService = invoiceService;
    }

    private Guid? CurrentUserId()
    {
        var val = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(val, out var id) ? id : null;
    }

    [HttpGet("admin/revenue")]

    public async Task<ActionResult<ApiResponse<RevenueStatsDto>>> GetAdminTotalRevenue([FromQuery] Guid? hotelId, [FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate, [FromQuery] string? granularity = "day", [FromQuery] bool includeIssued = true, [FromQuery] bool includePaid = true)
    {
        var uid = CurrentUserId();
        if (uid == null) return Forbid();
        if (hotelId.HasValue && hotelId.Value != Guid.Empty)
        {
            var stats = await _invoiceService.GetRevenueAsync(new RevenueQueryDto
            {
                HotelId = hotelId.Value,
                FromDate = fromDate,
                ToDate = toDate,
                Granularity = granularity,
                IncludeIssued = includeIssued,
                IncludePaid = includePaid
            });
            return Ok(ApiResponse<RevenueStatsDto>.Ok(stats));
        }
        else
        {
            var hotels = await _hotels.ListAllAsync();
            var dict = new Dictionary<DateTime, decimal>();
            decimal total = 0m;
            int count = 0;
            foreach (var h in hotels)
            {
                var stats = await _invoiceService.GetRevenueAsync(new RevenueQueryDto
                {
                    HotelId = h.Id,
                    FromDate = fromDate,
                    ToDate = toDate,
                    Granularity = granularity,
                    IncludeIssued = includeIssued,
                    IncludePaid = includePaid
                });
                total += stats.Total;
                count += stats.Count;
                foreach (var p in stats.Points)
                {
                    var key = p.Date;
                    if (dict.ContainsKey(key)) dict[key] += p.Total;
                    else dict[key] = p.Total;
                }
            }
            var points = dict.OrderBy(kv => kv.Key).Select(kv => new RevenuePointDto { Date = kv.Key, Total = kv.Value }).ToList();
            var res = new RevenueStatsDto { Total = total, Count = count, Points = points };
            return Ok(ApiResponse<RevenueStatsDto>.Ok(res));
        }
    }

    public record AdminDashboardSummaryDto(int TotalHotels, int TotalUsers, int AuditCountLast24Hours);

    [HttpGet("admin/summary")]

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

    [HttpGet("rooms/in-use-today")]
    public async Task<ActionResult<ApiResponse<object>>> GetRoomsInUseToday()
    {
        var hotelIdClaim = User.FindFirst("hotelId")?.Value;

        if (hotelIdClaim == null)
            return BadRequest("HotelId not found in user claims");

        Guid hotelId = Guid.Parse(hotelIdClaim);

        var summary = await _roomStatus.GetRoomStatusSummaryAsync(hotelId);
        var dto = new { date = DateTime.Today, summary };
        return Ok(ApiResponse<object>.Ok(dto));
    }

    public record RoomsUsageSummaryDto(DateTime Date, int TotalRooms, int BookedRooms, double Percentage, bool IsPeakDay);

    [HttpGet("rooms/usage-summary-today")]
    public async Task<ActionResult<ApiResponse<RoomsUsageSummaryDto>>> GetRoomsUsageSummaryToday([FromQuery] Guid? hotelId)
    {
        if (hotelId == null || hotelId == Guid.Empty)
            return BadRequest(ApiResponse.Fail("HotelId is required"));

        var date = DateTime.Today;
        var roomMapRes = await _bookings.GetRoomMapAsync(new RoomMapQueryDto { Date = date, HotelId = hotelId.Value });
        var totalRooms = roomMapRes.Data?.Count ?? 0;
        var bookedRooms = roomMapRes.Data?.Count(x => x.Timeline.Any(s => s.Status == RoomStatus.Occupied)) ?? 0;
        var percentage = totalRooms == 0 ? 0 : Math.Round((double)bookedRooms / totalRooms * 100.0, 2);
        var isPeakDay = percentage >= 75.0;

        var dto = new RoomsUsageSummaryDto(date, totalRooms, bookedRooms, percentage, isPeakDay);
        return Ok(ApiResponse<RoomsUsageSummaryDto>.Ok(dto));
    }

    [HttpGet("rooms/usage-summary-by-month")]
    public async Task<ActionResult<ApiResponse<List<RoomsUsageSummaryDto>>>> GetRoomsUsageSummaryByMonth([FromQuery] int? year, [FromQuery] int? month)
    {
        var hotelIdClaim = User.FindFirst("hotelId")?.Value;

        if (hotelIdClaim == null)
            return BadRequest("HotelId not found in user claims");

        Guid hotelId = Guid.Parse(hotelIdClaim);
      
        var now = DateTime.Today;
        var y = year ?? now.Year;
        var m = month ?? now.Month;
        if (m < 1 || m > 12)
            return BadRequest(ApiResponse.Fail("Invalid month"));
        var start = new DateTime(y, m, 1);
        var end = start.AddMonths(1).AddDays(-1);
        var list = new List<RoomsUsageSummaryDto>();
        for (var d = start; d <= end; d = d.AddDays(1))
        {
            var totalRooms = await _bookings.GetTotalRoomAsync(hotelId);
            var bookedRooms = await _bookings.GetBookedRoomByDateAsync(hotelId, d);
            var percentage = totalRooms == 0 ? 0 : Math.Round((double)bookedRooms / totalRooms * 100.0, 2);
            var isPeakDay = percentage >= 75.0;
            list.Add(new RoomsUsageSummaryDto(d, totalRooms, bookedRooms, percentage, isPeakDay));
        }
        return Ok(ApiResponse<List<RoomsUsageSummaryDto>>.Ok(list));
    }

    public record KitchenDashboardSummaryDto(int PendingOrderItems, int InProgressOrders, int ReadyOrders, int CompletedOrders);

    [HttpGet("kitchen/summary")]

    public async Task<ActionResult<ApiResponse<KitchenDashboardSummaryDto>>> GetKitchenSummary([FromQuery] Guid? hotelId)
    {
        if (hotelId == null || hotelId == Guid.Empty)
            return BadRequest(ApiResponse.Fail("HotelId is required"));

        var orders = await _orders.ListAsync(new OrdersQueryDto
        {
            HotelId = hotelId.Value,
            Page = 1,
            PageSize = 1000
        });

        var dto = new KitchenDashboardSummaryDto(
            PendingOrderItems: orders.Data?.Count ?? 0,
            InProgressOrders: orders.Data?.Count(x => x.Status == Domain.OrderStatus.InProgress) ?? 0,
            ReadyOrders: orders.Data?.Count(x => x.Status == Domain.OrderStatus.Ready) ?? 0,
            CompletedOrders: orders.Data?.Count(x => x.Status == Domain.OrderStatus.Completed) ?? 0
        );
        return Ok(ApiResponse<KitchenDashboardSummaryDto>.Ok(dto));
    }

    public record HousekeeperDashboardSummaryDto(int AssignedActiveTasks, int DirtyRoomsCount);

    [HttpGet("housekeeper/summary")]

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
