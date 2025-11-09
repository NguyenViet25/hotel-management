using Microsoft.AspNetCore.Identity;

namespace HotelManagement.Domain.Entities;

public class AppUser : IdentityUser<Guid>
{
    public string? Fullname { get; set; }
}

public class AppUserResponse : AppUser
{
    public List<string>? Roles { get; set; }
    public Guid? HotelId { get; set; }
}


public class UserMapper
{
    public static AppUserResponse MapToResponseAsync(AppUser user, List<string>? roles, Guid? hotelId)
    {
        return new AppUserResponse
        {
            Id = user.Id,
            UserName = user.UserName,
            Email = user.Email,
            Fullname = user.Fullname,
            Roles = roles,
            HotelId = hotelId
        };
    }
}
