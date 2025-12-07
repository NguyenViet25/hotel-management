using HotelManagement.Services.Admin.Minibar;
using HotelManagement.Services.Admin.Minibar.Dtos;
using HotelManagement.Services.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.Api.Controllers;

[ApiController]
[Route("api/minibars")]
[Authorize]
public class MinibarsController : ControllerBase
{
    private readonly IMinibarService _service;

    public MinibarsController(IMinibarService service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<MinibarDto>>> Create([FromBody] MinibarCreateRequest request)
    {
        var result = await _service.CreateAsync(request);
        return Ok(result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<MinibarDto>>> Update(Guid id, [FromBody] MinibarUpdateRequest request)
    {
        var result = await _service.UpdateAsync(id, request);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(Guid id)
    {
        var result = await _service.DeleteAsync(id);
        return Ok(result);
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<MinibarDto>>>> List([FromQuery] Guid? hotelId, [FromQuery] Guid? roomTypeId, [FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        var result = await _service.GetAllAsync(hotelId, roomTypeId, search, page, pageSize);
        if (!result.IsSuccess || result.Data is null) return Ok(result);
        var meta = result.Meta;
        return Ok(ApiResponse<List<MinibarDto>>.Success(result.Data, meta: meta));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<MinibarDto>>> GetById(Guid id)
    {
        var result = await _service.GetByIdAsync(id);
        return Ok(result);
    }
}