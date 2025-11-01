using HotelManagement.Services.Admin.Kitchen;
using HotelManagement.Services.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HotelManagement.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/[controller]")]
[Authorize(Roles = "Admin,Manager,Staff")]
public class KitchenController : ControllerBase
{
    private readonly IKitchenService _kitchenService;

    public KitchenController(IKitchenService kitchenService)
    {
        _kitchenService = kitchenService;
    }

    // UC-49: Generate shopping list based on menu items and their ingredients
    [HttpPost("shopping-list")]
    public async Task<IActionResult> GenerateShoppingList([FromBody] ShoppingListRequestDto request)
    {
        var result = await _kitchenService.GenerateShoppingListAsync(request);
        return Ok(result);
    }

    // UC-50: Check ingredient quality and replace if needed
    [HttpPost("ingredient-quality-check")]
    public async Task<IActionResult> CheckIngredientQuality([FromBody] IngredientQualityCheckDto request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var result = await _kitchenService.CheckIngredientQualityAsync(request, Guid.Parse(userId));
        return Ok(result);
    }
}