using System.Net;

namespace HotelManagement.Services.Email.Templates;

public static class EmailTemplates
{
    public static (string subject, string html, string text) ForgotPassword(string? displayName, string link)
    {
        var name = WebUtility.HtmlEncode(displayName ?? "");
        var l = WebUtility.HtmlEncode(link);
        var subject = "Quên mật khẩu";
        var html = $"<p>Xin chào {name},</p><p>Vui lòng bấm vào liên kết để đặt lại mật khẩu:</p><p><a href=\"{l}\">Đặt lại mật khẩu</a></p><p>Nếu không phải bạn yêu cầu, vui lòng bỏ qua.</p>";
        var text = $"Xin chào {displayName},\nVui lòng mở liên kết để đặt lại mật khẩu: {link}\nNếu không phải bạn yêu cầu, vui lòng bỏ qua.";
        return (subject, html, text);
    }

    public static (string subject, string html, string text) ResetPassword(string? displayName, string link)
    {
        var name = WebUtility.HtmlEncode(displayName ?? "");
        var l = WebUtility.HtmlEncode(link);
        var subject = "Đặt lại mật khẩu";
        var html = $"<p>Xin chào {name},</p><p>Liên kết đặt lại mật khẩu của bạn:</p><p><a href=\"{l}\">Đặt lại mật khẩu</a></p>";
        var text = $"Xin chào {displayName},\nLiên kết đặt lại mật khẩu: {link}";
        return (subject, html, text);
    }
}

