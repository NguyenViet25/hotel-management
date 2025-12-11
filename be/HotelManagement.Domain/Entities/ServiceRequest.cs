namespace HotelManagement.Domain;

public class ServiceRequest
{
    public Guid Id { get; set; }
    public Guid HotelId { get; set; }
    public Guid DiningSessionId { get; set; }
    public string RequestType { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int Quantity { get; set; } = 1;
    public ServiceRequestStatus Status { get; set; } = ServiceRequestStatus.Pending;
    public Guid? AssignedToUserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public DateTime? CompletedAt { get; set; }
}

public enum ServiceRequestStatus
{
    Pending = 0,
    InProgress = 1,
    Completed = 2,
    Cancelled = 3
}