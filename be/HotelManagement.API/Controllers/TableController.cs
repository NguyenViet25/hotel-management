using HotelManagement.Services.Admin.Dining;
using HotelManagement.Services.Admin.Dining.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.Api.Controllers;

[ApiController]
[Route("api/tables")]
[Authorize]
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

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] Guid hotelId, [FromQuery] string? search, [FromQuery] bool? isActive, [FromQuery] int? status, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        var response = await _tableService.GetTablesAsync(hotelId, search, isActive, status, page, pageSize);
        if (!response.IsSuccess || response.Data is null)
        {
            return Ok(response);
        }

        var list = response.Data.Tables;
        var meta = new { total = response.Data.TotalCount, page, pageSize };
        return Ok(Services.Common.ApiResponse<List<TableDto>>.Success(list, meta: meta));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var response = await _tableService.DeleteTableAsync(id);
        return response.IsSuccess ? Ok(response) : NotFound(response);
    }
}