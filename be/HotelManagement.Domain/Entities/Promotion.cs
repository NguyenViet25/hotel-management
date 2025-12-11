namespace HotelManagement.Domain;

public class Promotion
{
    public Guid Id { get; set; }
    public Guid HotelId { get; set; }
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Scope { get; set; } = "booking";
    public decimal Value { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;
}
