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
        var action = method + " " + path;

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
        string? hotelIdStr = null;
        if (context.Request.Query.ContainsKey("hotelId"))
        {
            hotelIdStr = context.Request.Query["hotelId"].FirstOrDefault();
        }
        if (string.IsNullOrEmpty(hotelIdStr))
        {
            hotelIdStr = context.Request.Headers["X-Hotel-Id"].FirstOrDefault();
        }
        if (string.IsNullOrEmpty(hotelIdStr) && context.Request.RouteValues.TryGetValue("hotelId", out var rv))
        {
            hotelIdStr = rv?.ToString();
        }
        return Guid.TryParse(hotelIdStr, out var id) ? id : null;
    }
}

