using HotelManagement.Services.Admin.Pricing;
using HotelManagement.Services.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace HotelManagement.Api.Controllers;

[ApiController]
[Route("api/pricing")]
[Authorize]
public class PricingController : ControllerBase
{
    private readonly IPricingService _pricingService;

    public PricingController(IPricingService pricingService)
    {
        _pricingService = pricingService;
    }

    [HttpGet("quote")]
    public async Task<ActionResult<ApiResponse<PricingQuoteResponse>>> Quote([FromQuery] Guid roomTypeId, [FromQuery] string checkInDate, [FromQuery] string checkOutDate)
    {
        if (!DateTime.TryParse(checkInDate, out var start))
        {
            return BadRequest(ApiResponse<PricingQuoteResponse>.Fail("Invalid checkInDate"));
        }
        if (!DateTime.TryParse(checkOutDate, out var end))
        {
            return BadRequest(ApiResponse<PricingQuoteResponse>.Fail("Invalid checkOutDate"));
        }

        var result = await _pricingService.QuoteAsync(roomTypeId, start, end);
        if (result.IsSuccess) return Ok(result);
        return BadRequest(result);
    }
}

