using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HotelManagement.Tests.Utils;

public static class ControllerTestHelper
{
    public static TController WithUser<TController>(TController controller, IEnumerable<Claim>? claims = null) where TController : ControllerBase
    {
        var httpContext = new DefaultHttpContext();
        if (claims != null)
        {
            httpContext.User = new ClaimsPrincipal(new ClaimsIdentity(claims, "TestAuth"));
        }
        controller.ControllerContext = new ControllerContext { HttpContext = httpContext };
        return controller;
    }

    public static ClaimsPrincipal CreateUser(params Claim[] claims)
    {
        return new ClaimsPrincipal(new ClaimsIdentity(claims, "TestAuth"));
    }

    public static DefaultHttpContext CreateHttpContextWithRequest(string scheme = "http", string host = "localhost", ClaimsPrincipal? user = null)
    {
        var ctx = new DefaultHttpContext();
        ctx.Request.Scheme = scheme;
        ctx.Request.Host = new HostString(host);
        if (user != null)
        {
            ctx.User = user;
        }
        return ctx;
    }
}
