using HotelManagement.Services.Admin.Dining;
using HotelManagement.Services.Admin.Dining.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/[controller]")]
[Authorize(Roles = "Admin,Manager")]
public class TableController : ControllerBase
{
    private readonly ITableService _tableService;

    public TableController(ITableService tableService)
    {
        _tableService = tableService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateTable([FromBody] CreateTableRequest request)
    {
        var response = await _tableService.CreateTableAsync(request);
        return response.IsSuccess ? Ok(response) : BadRequest(response);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTable(Guid id, [FromBody] UpdateTableRequest request)
    {
        var response = await _tableService.UpdateTableAsync(id, request);
        return response.IsSuccess ? Ok(response) : BadRequest(response);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetTable(Guid id)
    {
        var response = await _tableService.GetTableAsync(id);
        return response.IsSuccess ? Ok(response) : NotFound(response);
    }

    [HttpGet("hotel/{hotelId}")]
    public async Task<IActionResult> GetTables(Guid hotelId, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        var response = await _tableService.GetTablesAsync(hotelId, page, pageSize);
        return Ok(response);
    }

    [HttpPost("merge")]
    public async Task<IActionResult> MergeTables([FromBody] MergeTablesRequest request)
    {
        var response = await _tableService.MergeTablesAsync(request);
        return response.IsSuccess ? Ok(response) : BadRequest(response);
    }

    [HttpPost("split")]
    public async Task<IActionResult> SplitTable([FromBody] SplitTableRequest request)
    {
        var response = await _tableService.SplitTableAsync(request);
        return response.IsSuccess ? Ok(response) : BadRequest(response);
    }

    [HttpPost("move-session")]
    public async Task<IActionResult> MoveSession([FromBody] MoveSessionRequest request)
    {
        var response = await _tableService.MoveSessionAsync(request);
        return response.IsSuccess ? Ok(response) : BadRequest(response);
    }
}