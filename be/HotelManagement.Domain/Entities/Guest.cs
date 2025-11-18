namespace HotelManagement.Domain;

public class Guest
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? IdCardFrontImageUrl { get; set; }
    public string? IdCardBackImageUrl { get; set; }
}