using HotelManagement.Services.Admin.Dining;
using HotelManagement.Services.Admin.Dining.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/service-requests")]
[Authorize]
public class ServiceRequestController : ControllerBase
{
    private readonly IServiceRequestService _serviceRequestService;

    public ServiceRequestController(IServiceRequestService serviceRequestService)
    {
        _serviceRequestService = serviceRequestService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateRequest([FromBody] CreateServiceRequestRequest request)
    {
        var response = await _serviceRequestService.CreateRequestAsync(request);
        return Ok(response);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateRequest(Guid id, [FromBody] UpdateServiceRequestRequest request)
    {
        var response = await _serviceRequestService.UpdateRequestAsync(id, request);
        if (!response.IsSuccess)
        {
            return NotFound(response);
        }
        return Ok(response);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetRequest(Guid id)
    {
        var response = await _serviceRequestService.GetRequestAsync(id);
        if (!response.IsSuccess)
        {
            return NotFound(response);
        }
        return Ok(response);
    }

    [HttpGet("by-session/{sessionId}")]
    public async Task<IActionResult> GetRequestsBySession(
        Guid sessionId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var response = await _serviceRequestService.GetRequestsBySessionAsync(sessionId, page, pageSize);
        return Ok(response);
    }

    [HttpPost("{id}/complete")]
    public async Task<IActionResult> CompleteRequest(Guid id)
    {
        var response = await _serviceRequestService.CompleteRequestAsync(id);
        if (!response.IsSuccess)
        {
            return NotFound(response);
        }
        return Ok(response);
    }
}