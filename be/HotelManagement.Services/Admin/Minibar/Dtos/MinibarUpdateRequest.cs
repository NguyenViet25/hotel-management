using System.ComponentModel.DataAnnotations;

namespace HotelManagement.Services.Admin.Minibar.Dtos;

public class MinibarUpdateRequest
{
    [Required]
    public Guid HotelId { get; set; }

    [Required]
    public Guid RoomTypeId { get; set; }

    [Required]
    [StringLength(200)]
    public string Name { get; set; } = string.Empty;

    [Range(0, double.MaxValue)]
    public decimal Price { get; set; }

    [Range(0, int.MaxValue)]
    public int Quantity { get; set; }
    public string? ImageUrl { get; set; }
}
