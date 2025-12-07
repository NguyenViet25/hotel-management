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

    public static (string subject, string html, string text) ResetPassword(string? displayName, string newPassword)
    {
        var name = WebUtility.HtmlEncode(displayName ?? "");
        var subject = "Đặt lại mật khẩu";
        var html = $"<p>Xin chào {name},</p>";
        var text = $"Mật khẩu mới của bạn là: {newPassword}";

        return (subject, html, text);
    }
}

