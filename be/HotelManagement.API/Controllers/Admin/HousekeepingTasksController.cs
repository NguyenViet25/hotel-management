using HotelManagement.Services.Admin.Housekeeping;
using HotelManagement.Services.Admin.Housekeeping.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/housekeeping/tasks")]
[Authorize(Roles = "Admin,Manager,Housekeeper,Staff")]
public class HousekeepingTasksController : ControllerBase
{
    private readonly IHousekeepingTaskService _service;

    public HousekeepingTasksController(IHousekeepingTaskService service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateHousekeepingTaskRequest req)
    {
        var res = await _service.CreateAsync(req);
        return res.IsSuccess ? Ok(res) : BadRequest(res);
    }

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] ListHousekeepingTasksQuery query)
    {
        var res = await _service.ListAsync(query);
        return Ok(res);
    }

    [HttpPut("assign")]
    public async Task<IActionResult> Assign([FromBody] AssignHousekeeperRequest req)
    {
        var res = await _service.AssignAsync(req);
        return res.IsSuccess ? Ok(res) : BadRequest(res);
    }

    [HttpPut("notes")]
    public async Task<IActionResult> UpdateNotes([FromBody] UpdateHousekeepingTaskNotesRequest req)
    {
        var res = await _service.UpdateNotesAsync(req);
        return res.IsSuccess ? Ok(res) : BadRequest(res);
    }

    [HttpPut("start")]
    public async Task<IActionResult> Start([FromBody] StartTaskRequest req)
    {
        var res = await _service.StartAsync(req);
        return res.IsSuccess ? Ok(res) : BadRequest(res);
    }

    [HttpPut("complete")]
    public async Task<IActionResult> Complete([FromBody] CompleteTaskRequest req)
    {
        var res = await _service.CompleteAsync(req);
        return res.IsSuccess ? Ok(res) : BadRequest(res);
    }
}