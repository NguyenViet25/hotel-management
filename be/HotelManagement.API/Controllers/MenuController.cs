using HotelManagement.Services.Admin.Menu;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HotelManagement.Api.Controllers;

[ApiController]
[Route("api/menu")]
//[Authorize]
public class MenuController : ControllerBase
{
    private readonly IMenuService _menuService;

    public MenuController(IMenuService menuService)
    {
        _menuService = menuService;
    }

    // UC-45: Display menu by group, session, and status
    [HttpGet]
    public async Task<IActionResult> GetMenuItems([FromQuery] MenuQueryDto query)
    {
        var hotelIdClaim = User.FindFirst("hotelId")?.Value;

        if (hotelIdClaim == null)
            return BadRequest("HotelId not found in user claims");

        Guid hotelId = Guid.Parse(hotelIdClaim);

        var result = await _menuService.GetMenuItemsAsync(query, hotelId);
        return Ok(result);
    }

    // UC-46: Add new menu item with quantity, price, and image
    [HttpPost]
    public async Task<IActionResult> CreateMenuItem([FromBody] CreateMenuItemDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var result = await _menuService.CreateMenuItemAsync(dto, Guid.Parse(userId!));
        return Ok(result);
    }

    // UC-47: Update menu item information, quantity, and price
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateMenuItem(Guid id, [FromBody] UpdateMenuItemDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var result = await _menuService.UpdateMenuItemAsync(id, dto, Guid.Parse(userId!));
        return Ok(result);
    }

    // UC-48: Delete menu item without existing orders
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMenuItem(Guid id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var result = await _menuService.DeleteMenuItemAsync(id, Guid.Parse(userId!));
        return Ok(result);
    }


}