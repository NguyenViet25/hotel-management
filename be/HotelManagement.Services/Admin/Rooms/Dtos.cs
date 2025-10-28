using HotelManagement.Domain;
using System.ComponentModel.DataAnnotations;

namespace HotelManagement.Services.Admin.Rooms.Dtos;

public class RoomsQueryDto
{
    public Guid? HotelId { get; set; }
    public RoomStatus? Status { get; set; }
    public Guid? RoomTypeId { get; set; }
    public int? Floor { get; set; }
    public string? Search { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

public class RoomSummaryDto
{
    public Guid Id { get; set; }
    public Guid HotelId { get; set; }
    public Guid RoomTypeId { get; set; }
    public string RoomTypeName { get; set; } = string.Empty;
    public string Number { get; set; } = string.Empty;
    public int Floor { get; set; }
    public RoomStatus Status { get; set; }
}

public class CreateRoomDto
{
    [Required]
    public Guid HotelId { get; set; }
    [Required]
    public Guid RoomTypeId { get; set; }
    [Required]
    [StringLength(32)]
    public string Number { get; set; } = string.Empty;
    [Range(0, 500)]
    public int Floor { get; set; }
}

public class UpdateRoomDto
{
    public Guid? RoomTypeId { get; set; }
    [StringLength(32)]
    public string? Number { get; set; }
    [Range(0, 500)]
    public int? Floor { get; set; }
    public RoomStatus? Status { get; set; }
}

public class SetOutOfServiceDto
{
    public string? Reason { get; set; }
}