using System;

namespace HotelManagement.Services.Admin.Dining.Dtos;

public class ServiceRequestDto
{
    public Guid Id { get; set; }
    public Guid HotelId { get; set; }
    public Guid DiningSessionId { get; set; }
    public string RequestType { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public string Status { get; set; } = string.Empty;
    public Guid? AssignedToUserId { get; set; }
    public string? AssignedToName { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
}

public class CreateServiceRequestRequest
{
    public Guid HotelId { get; set; }
    public Guid DiningSessionId { get; set; }
    public string RequestType { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int Quantity { get; set; } = 1;
}

public class UpdateServiceRequestRequest
{
    public string Status { get; set; } = string.Empty;
    public Guid? AssignedToUserId { get; set; }
    public string? RequestType { get; set; }
    public string? Description { get; set; }
    public int? Quantity { get; set; }
}

public class ServiceRequestListResponse
{
    public List<ServiceRequestDto> Requests { get; set; } = new List<ServiceRequestDto>();
    public int TotalCount { get; set; }
}
