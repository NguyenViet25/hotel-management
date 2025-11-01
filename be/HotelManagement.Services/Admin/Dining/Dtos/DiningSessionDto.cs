using System;

namespace HotelManagement.Services.Admin.Dining.Dtos;

public class DiningSessionDto
{
    public Guid Id { get; set; }
    public Guid HotelId { get; set; }
    public Guid TableId { get; set; }
    public string TableName { get; set; } = string.Empty;
    public Guid? WaiterUserId { get; set; }
    public string? WaiterName { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? EndedAt { get; set; }
    public string Status { get; set; } = string.Empty;
}

public class CreateDiningSessionRequest
{
    public Guid HotelId { get; set; }
    public Guid TableId { get; set; }
    public Guid? WaiterUserId { get; set; }
    public Guid? GuestId { get; set; }
}

public class UpdateDiningSessionRequest
{
    public Guid? WaiterUserId { get; set; }
    public string? Status { get; set; }
}

public class DiningSessionListResponse
{
    public List<DiningSessionDto> Sessions { get; set; } = new List<DiningSessionDto>();
    public int TotalCount { get; set; }
}