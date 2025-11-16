using HotelManagement.Services.Admin.Kitchen;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.Api.Controllers.Admin;

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

    [HttpGet("foods-by-week")]
    public async Task<IActionResult> GetFoodByWeeks([FromBody] GetFoodsByWeekRequest request)
    {
        var result = await _kitchenService.GetFoodByWeekRequestAsync(request);
        return Ok(result);
    }
}