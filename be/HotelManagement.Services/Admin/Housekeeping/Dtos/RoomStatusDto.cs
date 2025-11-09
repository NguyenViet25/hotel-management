using HotelManagement.Domain;
using System;
using System.Collections.Generic;

namespace HotelManagement.Services.Admin.Housekeeping.Dtos;

public class RoomStatusDto
{
    public Guid Id { get; set; }
    public Guid RoomId { get; set; }
    public string RoomNumber { get; set; } = string.Empty;
    public int Floor { get; set; }
    public RoomStatus Status { get; set; }
    public string StatusName => Status.ToString();
    public DateTime Timestamp { get; set; }
    public string? Notes { get; set; }
}

public class UpdateRoomStatusRequest
{
    public Guid RoomId { get; set; }
    public RoomStatus Status { get; set; }
    public string? Notes { get; set; }
}

public class RoomStatusListResponse
{
    public List<RoomStatusDto> RoomStatuses { get; set; } = new List<RoomStatusDto>();
    public int TotalCount { get; set; }
}

public class RoomWithStatusDto
{
    public Guid Id { get; set; }
    public string Number { get; set; } = string.Empty;
    public int Floor { get; set; }
    public RoomStatus Status { get; set; }
    public string StatusName => Status.ToString();
    public DateTime LastUpdated { get; set; }
    public string RoomTypeName { get; set; } = string.Empty;
}

public class RoomStatusSummaryDto
{
    public int TotalRooms { get; set; }
    public int CleanRooms { get; set; }
    public int DirtyRooms { get; set; }
    public int MaintenanceRooms { get; set; }
    public int OccupiedRooms { get; set; }
    public int OutOfServiceRooms { get; set; }
}