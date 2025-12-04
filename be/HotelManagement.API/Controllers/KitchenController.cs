using HotelManagement.Services.Admin.Kitchen;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.Api.Controllers;

[ApiController]
[Route("api/kitchen")]
[Authorize]
public class KitchenController : ControllerBase
{
    private readonly IKitchenService _kitchenService;

    public KitchenController(IKitchenService kitchenService)
    {
        _kitchenService = kitchenService;
    }

    // UC-49: Generate shopping list based on menu items and their ingredients
    [HttpPost("shopping")]
    public async Task<IActionResult> GenerateShoppingList([FromBody] ShoppingListRequestDto request)
    {
        var result = await _kitchenService.GenerateShoppingListAsync(request);
        return Ok(result);
    }

    [HttpPut("shopping")]
    public async Task<IActionResult> UpdateShoppingList([FromBody] ShoppingListRequestDto request)
    {
        var result = await _kitchenService.UpdateShoppingListAsync(request);
        return Ok(result);
    }

    [HttpGet("shopping/{id}")]
    public async Task<IActionResult> GetShopping([FromRoute] Guid id)
    {
        var result = await _kitchenService.GetShoppingOrderAsync(id);
        return Ok(result);
    }

    [HttpGet("foods-by-week")]
    public async Task<IActionResult> GetFoodByWeeks([FromQuery] GetFoodsByWeekRequest request)
    {
        var result = await _kitchenService.GetFoodByWeekRequestAsync(request);
        return Ok(result);
    }

    [HttpPut("shopping/{id}/status")]
    public async Task<IActionResult> UpdateShoppingStatus([FromRoute] Guid id, [FromBody] UpdateShoppingOrderStatusRequest request)
    {
        var result = await _kitchenService.UpdateShoppingOrderStatusAsync(id, request.Status);
        return Ok(result);
    }
}
