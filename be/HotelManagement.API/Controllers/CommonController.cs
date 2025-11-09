using HotelManagement.Services.Admin.Hotels;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.Api.Controllers;


[ApiController]
[Route("api/common")]
public class CommonController : Controller
{

    private readonly IHotelsAdminService _hotelsAdmin;

    public CommonController(IHotelsAdminService hotelsAdmin)
    {
        _hotelsAdmin = hotelsAdmin;
    }

    [HttpGet("hotels")]
    public async Task<IActionResult> ListHotels()
    {
        var result = await _hotelsAdmin.ListAllAsync();
        return Ok(result);

    }
}
