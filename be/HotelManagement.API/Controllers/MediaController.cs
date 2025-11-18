using HotelManagement.Services.Admin.Media.Dtos;
using HotelManagement.Services.Admin.Medias;
using HotelManagement.Services.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Hosting;
using System.ComponentModel.DataAnnotations;

namespace HotelManagement.Api.Controllers;

[ApiController]
[Route("api/media")]
//[Authorize]
public class MediaController : ControllerBase
{
    private readonly IMediaService _service;
    private readonly IWebHostEnvironment _env;

    public MediaController(IMediaService service, IWebHostEnvironment env)
    {
        _service = service;
        _env = env;
    }

    public class MediaUploadRequest
    {
        [Required]
        public IFormFile File { get; set; } = null!;
    }


    [HttpPost]
    [RequestSizeLimit(10485760)] // 10MB default, configurable in service
    public async Task<ActionResult<ApiResponse<MediaUploadResponse>>> Upload([FromForm] MediaUploadRequest request)
    {
        var file = request.File;
        var baseUrl = $"{Request.Scheme}://{Request.Host}";
        var result = await _service.UploadAsync(file.OpenReadStream(), file.FileName, file.ContentType, file.Length, baseUrl, _env.WebRootPath);
        if (!result.IsSuccess) return BadRequest(result);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<MediaResponse>>> Get(int id)
    {
        var result = await _service.GetByIdAsync(id);
        if (!result.IsSuccess) return NotFound(result);
        return Ok(result);
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<MediaResponse>>>> List([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        var result = await _service.ListAsync(page, pageSize);
        return Ok(result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<MediaResponse>>> Update(int id, [FromBody] MediaUpdateRequest request)
    {
        var result = await _service.UpdateAsync(id, request);
        if (!result.IsSuccess) return BadRequest(result);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(int id)
    {
        var result = await _service.DeleteAsync(id);
        if (!result.IsSuccess) return NotFound(result);
        return Ok(result);
    }
}