using HotelManagement.Services.Admin.RoomTypes;
using HotelManagement.Services.Admin.RoomTypes.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.Api.Controllers.Admin;

[ApiController]
[Route("api/room-types")]
[Authorize]
public class RoomTypesController : ControllerBase
{
    private readonly IRoomTypeService _roomTypeService;

    public RoomTypesController(IRoomTypeService roomTypeService)
    {
        _roomTypeService = roomTypeService;
    }

    /// <summary>
    /// Tạo loại phòng mới
    /// UC-15: Tạo loại phòng mới, thiết lập tiện nghi, mô tả, hình ảnh
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateRoomType([FromBody] CreateRoomTypeDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var result = await _roomTypeService.CreateAsync(dto);
        
        if (result.IsSuccess)
        {
            return CreatedAtAction(nameof(GetRoomTypeById), new { id = result.Data!.Id }, result);
        }

        return BadRequest(result);
    }

    /// <summary>
    /// Chỉnh sửa thông tin loại phòng hiện có
    /// UC-16: Sửa loại phòng
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateRoomType(Guid id, [FromBody] UpdateRoomTypeDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var result = await _roomTypeService.UpdateAsync(id, dto);
        
        if (result.IsSuccess)
        {
            return Ok(result);
        }

        return BadRequest(result);
    }

    /// <summary>
    /// Xóa loại phòng chưa có phát sinh booking
    /// UC-17: Xóa loại phòng
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRoomType(Guid id)
    {
        var result = await _roomTypeService.DeleteAsync(id);
        
        if (result.IsSuccess)
        {
            return Ok(result);
        }

        return BadRequest(result);
    }

    /// <summary>
    /// Lấy thông tin chi tiết loại phòng theo ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetRoomTypeById(Guid id)
    {
        var result = await _roomTypeService.GetByIdAsync(id);
        
        if (result.IsSuccess)
        {
            return Ok(result);
        }

        return NotFound(result);
    }

    /// <summary>
    /// Lấy thông tin chi tiết đầy đủ của loại phòng (bao gồm danh sách phòng và thông tin giá)
    /// </summary>
    [HttpGet("{id}/details")]
    public async Task<IActionResult> GetRoomTypeDetails(Guid id)
    {
        var result = await _roomTypeService.GetDetailByIdAsync(id);
        
        if (result.IsSuccess)
        {
            return Ok(result);
        }

        return NotFound(result);
    }

    /// <summary>
    /// Tra cứu toàn bộ loại phòng hiện hành
    /// UC-18: Xem danh sách loại phòng
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetRoomTypes([FromQuery] RoomTypeQueryDto query)
    {
        var result = await _roomTypeService.GetAllAsync(query);
        
        if (result.IsSuccess)
        {
            return Ok(result);
        }

        return BadRequest(result);
    }

    /// <summary>
    /// Lấy danh sách loại phòng theo khách sạn
    /// </summary>
    [HttpGet("by-hotel/{hotelId}")]
    public async Task<IActionResult> GetRoomTypesByHotel(Guid hotelId)
    {
        var result = await _roomTypeService.GetByHotelIdAsync(hotelId);
        
        if (result.IsSuccess)
        {
            return Ok(result);
        }

        return BadRequest(result);
    }

    /// <summary>
    /// Kiểm tra xem loại phòng có thể xóa được không
    /// </summary>
    [HttpGet("{id}/can-delete")]
    public async Task<IActionResult> ValidateDelete(Guid id)
    {
        var result = await _roomTypeService.ValidateDeleteAsync(id);
        
        if (result.IsSuccess)
        {
            return Ok(result);
        }

        return BadRequest(result);
    }
}