namespace HotelManagement.Services.Admin.Dining.Dtos;

public class DiningSessionDto
{
    public Guid Id { get; set; }
    public Guid HotelId { get; set; }
    public Guid? WaiterUserId { get; set; }
    public string? WaiterName { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? EndedAt { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public int TotalGuests { get; set; }
    public List<SessionTableDto> Tables { get; set; } = new List<SessionTableDto>();
}

public class CreateDiningSessionRequest
{
    public Guid HotelId { get; set; }
    public Guid? WaiterUserId { get; set; }
    public string? Notes { get; set; }
    public DateTime? StartedAt { get; set; }
    public int? TotalGuests { get; set; }
}

public class UpdateDiningSessionRequest
{
    public Guid? WaiterUserId { get; set; }
    public string? Status { get; set; }
    public string? Notes { get; set; }
    public int? TotalGuests { get; set; }
}

public class SessionTableDto
{
    public Guid TableId { get; set; }
    public string TableName { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public DateTime AttachedAt { get; set; }
}

public class DiningSessionListResponse
{
    public List<DiningSessionDto> Sessions { get; set; } = new List<DiningSessionDto>();
    public int TotalCount { get; set; }
}

public class UpdateSessionTablesRequest
{
    public List<Guid> AttachTableIds { get; set; } = new List<Guid>();
    public List<Guid> DetachTableIds { get; set; } = new List<Guid>();
}
