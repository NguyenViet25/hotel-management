namespace HotelManagement.Domain;

public class UserPropertyRole
{
    public Guid Id { get; set; }
    public Guid HotelId { get; set; }
    public Guid UserId { get; set; }
    public UserRole Role { get; set; }
}

public class AuditLog
{
    public Guid Id { get; set; }
    public Guid? HotelId { get; set; }
    public Guid? UserId { get; set; }
    public string Action { get; set; } = string.Empty;
    public string? MetadataJson { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.Now;
}