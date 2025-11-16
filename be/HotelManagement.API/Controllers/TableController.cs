using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.Api.Controllers;
public class TableController : Controller
{
    public IActionResult Index()
    {
        return View();
    }
}
