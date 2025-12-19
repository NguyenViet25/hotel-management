using HotelManagement.Services.Admin.Guests;
using HotelManagement.Services.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.Api.Controllers;

[ApiController]
[Route("api/guests")]
[Authorize]
public class GuestsController : ControllerBase
{
    private readonly IGuestsService _svc;
    public GuestsController(IGuestsService svc) { _svc = svc; }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IEnumerable<GuestDetailsDto>>>> List([FromQuery] GuestsQueryDto query)
    {
        var hotelIdClaim = User.FindFirst("hotelId")?.Value;

        if (hotelIdClaim == null)
            return BadRequest("HotelId not found in user claims");

        Guid hotelId = Guid.Parse(hotelIdClaim);
        var (items, total) = await _svc.ListAsync(query, hotelId);
        var meta = new { total, page = query.Page, pageSize = query.PageSize };
        return Ok(ApiResponse<IEnumerable<GuestDetailsDto>>.Ok(items, meta: meta));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<GuestDetailsDto>>> Get(Guid id)
    {
        var dto = await _svc.GetAsync(id);
        return Ok(ApiResponse<GuestDetailsDto>.Ok(dto));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<GuestDetailsDto>>> Create([FromBody] CreateGuestDto request)
    {
        var hotelIdClaim = User.FindFirst("hotelId")?.Value;

        if (hotelIdClaim == null)
            return BadRequest("HotelId not found in user claims");

        Guid hotelId = Guid.Parse(hotelIdClaim);
        var resp = await _svc.CreateAsync(request, hotelId);
        return Ok(resp);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<GuestDetailsDto>>> Update(Guid id, [FromBody] UpdateGuestDto request)
    {
        var resp = await _svc.UpdateAsync(id, request);
        return Ok(resp);
    }
}
