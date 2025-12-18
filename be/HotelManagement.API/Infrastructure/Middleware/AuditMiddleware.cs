using System.Security.Claims;
using System.Text.Json;
using HotelManagement.Domain;
using HotelManagement.Repository;
using Microsoft.AspNetCore.Http;

namespace HotelManagement.Api.Infrastructure.Middleware;

public class AuditMiddleware
{
    private readonly RequestDelegate _next;

    public AuditMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, ApplicationDbContext db)
    {
        var path = context.Request.Path.Value ?? string.Empty;
        if (path.StartsWith("/swagger") || path.StartsWith("/static") || context.Request.Method == "OPTIONS")
        {
            await _next(context);
            return;
        }

        var start = DateTime.Now;
        await _next(context);

        var method = context.Request.Method;
        var query = context.Request.QueryString.HasValue ? context.Request.QueryString.Value! : string.Empty;
        var status = context.Response?.StatusCode ?? 0;
        var endpoint = context.GetEndpoint()?.DisplayName ?? string.Empty;
        var ua = context.Request.Headers["User-Agent"].ToString();
        var ip = context.Connection.RemoteIpAddress?.ToString();

        var userId = ParseGuid(context.User.FindFirstValue(ClaimTypes.NameIdentifier));
        var hotelId = ParseHotelId(context);

        string MapMethod(string m)
        {
            var k = m.ToUpperInvariant();
            return k switch
            {
                "GET" => "Xem",
                "POST" => "Tạo",
                "PUT" => "Cập nhật",
                "PATCH" => "Cập nhật",
                "DELETE" => "Xóa",
                "HEAD" => "Lấy tiêu đề",
                "OPTIONS" => "Tùy chọn",
                "TRACE" => "Theo dõi",
                "CONNECT" => "Kết nối",
                _ => m
            };
        }
        string MapPath(string p)
        {
            var s = (p ?? string.Empty).ToLowerInvariant();
            if (s.StartsWith("/api/")) s = s.Substring(5);
            if (s.StartsWith("menu")) return "Menu";
            if (s.StartsWith("bookings"))
            {
                if (s.Contains("/call-log")) return "Nhật ký gọi khách";
                if (s.StartsWith("bookings/confirm")) return "Xác nhận đặt phòng";
                if (s.StartsWith("bookings/complete")) return "Hoàn tất đặt phòng";
                return "Đặt phòng";
            }
            if (s.StartsWith("orders"))
            {
                if (s.Contains("walk-in")) return "Đơn khách lẻ F&B";
                return "Đơn F&B";
            }
            if (s.StartsWith("dining-sessions")) return "Phiên dùng bữa";
            if (s.StartsWith("order-items")) return "Trạng thái món";
            if (s.StartsWith("kitchen/shopping")) return "Danh sách mua sắm bếp";
            if (s.StartsWith("kitchen")) return "Bếp";
            if (s.StartsWith("invoices")) return "Hóa đơn";
            if (s.StartsWith("users/by-hotel")) return "Người dùng theo khách sạn";
            if (s.StartsWith("users")) return "Người dùng";
            if (s.StartsWith("hotels")) return "Khách sạn";
            if (s.StartsWith("rooms/by-type")) return "Phòng theo loại";
            if (s.StartsWith("rooms")) return "Phòng";
            if (s.StartsWith("minibars")) return "Minibar";
            if (s.StartsWith("audit/logs")) return "Nhật ký hệ thống";
            if (s.StartsWith("dashboard/admin/revenue")) return "Doanh thu tổng hợp";
            if (s.StartsWith("dashboard/admin/summary")) return "Tổng quan quản trị";
            if (s.StartsWith("common/hotels")) return "Danh sách khách sạn";
            if (s.StartsWith("profile/me")) return "Hồ sơ cá nhân";
            return p ?? string.Empty;
        }
        var action = MapMethod(method) + " " + MapPath(path);

        var meta = new
        {
            method,
            path,
            query,
            status,
            endpoint,
            ip,
            ua,
            elapsedMs = (int)(DateTime.Now - start).TotalMilliseconds
        };
        var metadataJson = JsonSerializer.Serialize(meta);

        var log = new AuditLog
        {
            Id = Guid.NewGuid(),
            HotelId = hotelId,
            UserId = userId,
            Action = action,
            MetadataJson = metadataJson,
            Timestamp = DateTime.Now
        };

        await db.AuditLogs.AddAsync(log);
        await db.SaveChangesAsync();
    }

    private static Guid? ParseGuid(string? s)
    {
        return Guid.TryParse(s, out var id) ? id : null;
    }

    private static Guid? ParseHotelId(HttpContext context)
    {
        var hotelIdStr = context.User.FindFirst("hotelId")?.Value;

        return Guid.TryParse(hotelIdStr, out var id) ? id : null;
    }
}

