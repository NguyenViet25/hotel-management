using HotelManagement.Services.Admin.Invoicing;
using HotelManagement.Services.Admin.Invoicing.Dtos;
using HotelManagement.Services.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HotelManagement.Api.Controllers;

[ApiController]
[Route("api/discount-codes")]
[Authorize]
public class DiscountCodesController : ControllerBase
{
    private readonly IDiscountCodeService _service;

    public DiscountCodesController(IDiscountCodeService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<PromotionDto>>>> List()
    {
        var hotelIdClaim = User.FindFirst("hotelId")?.Value;

        if (hotelIdClaim == null)
            return BadRequest("HotelId not found in user claims");

        Guid hotelId = Guid.Parse(hotelIdClaim);

        var result = await _service.ListAsync(hotelId);
        return Ok(result);
    }

    [HttpGet("active")]
    public async Task<ActionResult<ApiResponse<List<PromotionDto>>>> ListActive()
    {
        var hotelIdClaim = User.FindFirst("hotelId")?.Value;

        if (hotelIdClaim == null)
            return BadRequest("HotelId not found in user claims");

        Guid hotelId = Guid.Parse(hotelIdClaim);

        var result = await _service.ListActiveAsync(hotelId);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<PromotionDto>>> Get(Guid id)
    {
        var result = await _service.GetByIdAsync(id);
        if (!result.IsSuccess) return NotFound(result);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<PromotionDto>>> Create([FromBody] PromotionDto dto)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var userId = userIdStr != null ? Guid.Parse(userIdStr) : Guid.Empty;
        var result = await _service.CreateAsync(dto, userId);
        if (!result.IsSuccess) return BadRequest(result);
        return Ok(result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<PromotionDto>>> Update(Guid id, [FromBody] PromotionDto dto)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var userId = userIdStr != null ? Guid.Parse(userIdStr) : Guid.Empty;
        var result = await _service.UpdateAsync(id, dto, userId);
        if (!result.IsSuccess) return BadRequest(result);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse>> Delete(Guid id)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var userId = userIdStr != null ? Guid.Parse(userIdStr) : Guid.Empty;
        var result = await _service.DeleteAsync(id, userId);
        if (!result.IsSuccess) return BadRequest(result);
        return Ok(result);
    }
}