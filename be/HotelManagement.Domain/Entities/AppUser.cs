using Microsoft.AspNetCore.Identity;

namespace HotelManagement.Domain.Entities;

public class AppUser : IdentityUser<Guid>
{
    public string? Fullname { get; set; }
}