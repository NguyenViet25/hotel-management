using System.ComponentModel.DataAnnotations;
using HotelManagement.Domain;

namespace HotelManagement.Services.Admin.Housekeeping.Dtos;

public class HousekeepingTaskDto
{
    public Guid Id { get; set; }
    public Guid HotelId { get; set; }
    public Guid RoomId { get; set; }
    public string RoomNumber { get; set; } = string.Empty;
    public int Floor { get; set; }
    public string ImageSrc { get; set; } = string.Empty;
    public Guid? AssignedToUserId { get; set; }
    public string? AssignedToName { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
}

public class CreateHousekeepingTaskRequest
{
    [Required]
    public Guid HotelId { get; set; }
    [Required]
    public Guid RoomId { get; set; }
    public Guid? AssignedToUserId { get; set; }
    public string? Notes { get; set; }
}

public class AssignHousekeeperRequest
{
    [Required]
    public Guid TaskId { get; set; }
    [Required]
    public Guid AssignedToUserId { get; set; }
}

public class UpdateHousekeepingTaskNotesRequest
{
    [Required]
    public Guid TaskId { get; set; }
    public string? Notes { get; set; }
}

public class ListHousekeepingTasksQuery
{
    public Guid HotelId { get; set; }
    public Guid? AssignedToUserId { get; set; }
    public bool OnlyActive { get; set; } = true;
}

public class StartTaskRequest
{
    [Required]
    public Guid TaskId { get; set; }
    public string? Notes { get; set; }
}

public class CompleteTaskRequest
{
    [Required]
    public Guid TaskId { get; set; }
    public string? Notes { get; set; }
    public List<string>? EvidenceUrls { get; set; }
}
