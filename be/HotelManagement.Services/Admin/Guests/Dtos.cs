namespace HotelManagement.Services.Admin.Guests;

public class GuestsQueryDto
{
    public string? Name { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? IdCard { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? SortBy { get; set; } = "createdAt";
    public string? SortDir { get; set; } = "desc";
}

public class GuestSummaryDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string IdCard { get; set; } = string.Empty;
}

public class GuestDetailsDto : GuestSummaryDto
{
    public string? IdCardFrontImageUrl { get; set; }
    public string? IdCardBackImageUrl { get; set; }
}

public class CreateGuestDto
{
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string IdCard { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? IdCardFrontImageUrl { get; set; }
    public string? IdCardBackImageUrl { get; set; }
}

public class UpdateGuestDto
{
    public string? FullName { get; set; }
    public string? Phone { get; set; }
    public string? IdCard { get; set; }
    public string? Email { get; set; }
    public string? IdCardFrontImageUrl { get; set; }
    public string? IdCardBackImageUrl { get; set; }
}
