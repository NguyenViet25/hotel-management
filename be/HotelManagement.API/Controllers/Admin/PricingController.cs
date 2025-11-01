using HotelManagement.Services.Admin.Pricing;
using HotelManagement.Services.Admin.Pricing.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/pricing")]
[Authorize]
public class PricingController : ControllerBase
{
    private readonly IPricingService _pricingService;

    public PricingController(IPricingService pricingService)
    {
        _pricingService = pricingService;
    }

    #region Base Price Management

    /// <summary>
    /// Thiết lập giá cơ bản áp dụng mặc định cho từng loại phòng
    /// UC-19: Giá mặc định theo loại phòng
    /// </summary>
    [HttpPost("base-price")]
    public async Task<IActionResult> SetBasePrice([FromBody] SetBasePriceDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var result = await _pricingService.SetBasePriceAsync(dto);
        
        if (result.IsSuccess)
        {
            return Ok(result);
        }

        return BadRequest(result);
    }

    /// <summary>
    /// Lấy giá cơ bản của loại phòng
    /// </summary>
    [HttpGet("base-price")]
    public async Task<IActionResult> GetBasePrice([FromQuery] Guid hotelId, [FromQuery] Guid roomTypeId)
    {
        var result = await _pricingService.GetBasePriceAsync(hotelId, roomTypeId);
        
        if (result.IsSuccess)
        {
            return Ok(result);
        }

        return NotFound(result);
    }

    /// <summary>
    /// Lấy tất cả giá cơ bản theo khách sạn
    /// </summary>
    [HttpGet("base-prices/hotel/{hotelId}")]
    public async Task<IActionResult> GetBasePricesByHotel(Guid hotelId)
    {
        var result = await _pricingService.GetBasePricesByHotelAsync(hotelId);
        
        if (result.IsSuccess)
        {
            return Ok(result);
        }

        return BadRequest(result);
    }

    #endregion

    #region Day of Week Price Management

    /// <summary>
    /// Cấu hình giá lặp lại theo từng ngày trong tuần
    /// UC-20: Giá theo thứ trong tuần
    /// </summary>
    [HttpPost("day-of-week-price")]
    public async Task<IActionResult> SetDayOfWeekPrice([FromBody] SetDayOfWeekPriceDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var result = await _pricingService.SetDayOfWeekPriceAsync(dto);
        
        if (result.IsSuccess)
        {
            return Ok(result);
        }

        return BadRequest(result);
    }

    /// <summary>
    /// Cấu hình giá cho tất cả các ngày trong tuần cùng lúc
    /// </summary>
    [HttpPost("day-of-week-prices/bulk")]
    public async Task<IActionResult> SetBulkDayOfWeekPrices([FromBody] BulkDayOfWeekPriceDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var result = await _pricingService.SetBulkDayOfWeekPricesAsync(dto);
        
        if (result.IsSuccess)
        {
            return Ok(result);
        }

        return BadRequest(result);
    }

    /// <summary>
    /// Lấy giá theo ngày trong tuần
    /// </summary>
    [HttpGet("day-of-week-prices")]
    public async Task<IActionResult> GetDayOfWeekPrices([FromQuery] Guid hotelId, [FromQuery] Guid roomTypeId)
    {
        var result = await _pricingService.GetDayOfWeekPricesAsync(hotelId, roomTypeId);
        
        if (result.IsSuccess)
        {
            return Ok(result);
        }

        return BadRequest(result);
    }

    /// <summary>
    /// Xóa giá theo ngày trong tuần
    /// </summary>
    [HttpDelete("day-of-week-price")]
    public async Task<IActionResult> RemoveDayOfWeekPrice([FromQuery] Guid hotelId, [FromQuery] Guid roomTypeId, [FromQuery] int dayOfWeek)
    {
        var result = await _pricingService.RemoveDayOfWeekPriceAsync(hotelId, roomTypeId, dayOfWeek);
        
        if (result.IsSuccess)
        {
            return Ok(result);
        }

        return BadRequest(result);
    }

    #endregion

    #region Date Range Price Management

    /// <summary>
    /// Đặt giá theo dịp lễ, event, hoặc khoảng thời gian cụ thể
    /// UC-21: Giá theo ngày / khoảng thời gian
    /// </summary>
    [HttpPost("date-range-price")]
    public async Task<IActionResult> CreateDateRangePrice([FromBody] CreateDateRangePriceDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var result = await _pricingService.CreateDateRangePriceAsync(dto);
        
        if (result.IsSuccess)
        {
            return CreatedAtAction(nameof(GetDateRangePriceById), new { id = result.Data!.Id }, result);
        }

        return BadRequest(result);
    }

    /// <summary>
    /// Cập nhật giá theo khoảng thời gian
    /// </summary>
    [HttpPut("date-range-price/{id}")]
    public async Task<IActionResult> UpdateDateRangePrice(Guid id, [FromBody] UpdateDateRangePriceDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var result = await _pricingService.UpdateDateRangePriceAsync(id, dto);
        
        if (result.IsSuccess)
        {
            return Ok(result);
        }

        return BadRequest(result);
    }

    /// <summary>
    /// Xóa giá theo khoảng thời gian
    /// </summary>
    [HttpDelete("date-range-price/{id}")]
    public async Task<IActionResult> DeleteDateRangePrice(Guid id)
    {
        var result = await _pricingService.DeleteDateRangePriceAsync(id);
        
        if (result.IsSuccess)
        {
            return Ok(result);
        }

        return BadRequest(result);
    }

    /// <summary>
    /// Lấy thông tin giá theo khoảng thời gian
    /// </summary>
    [HttpGet("date-range-price/{id}")]
    public async Task<IActionResult> GetDateRangePriceById(Guid id)
    {
        var result = await _pricingService.GetDateRangePriceByIdAsync(id);
        
        if (result.IsSuccess)
        {
            return Ok(result);
        }

        return NotFound(result);
    }

    /// <summary>
    /// Lấy danh sách giá theo khoảng thời gian
    /// </summary>
    [HttpGet("date-range-prices")]
    public async Task<IActionResult> GetDateRangePrices([FromQuery] DateRangePriceQueryDto query)
    {
        var result = await _pricingService.GetDateRangePricesAsync(query);
        
        if (result.IsSuccess)
        {
            return Ok(result);
        }

        return BadRequest(result);
    }

    #endregion

    #region Surcharge Rule Management

    /// <summary>
    /// Thiết lập phụ thu early/late CI-CO, khách thêm
    /// UC-22: Quy tắc phụ thu / giảm giá (phần phụ thu)
    /// </summary>
    [HttpPost("surcharge-rule")]
    public async Task<IActionResult> CreateSurchargeRule([FromBody] CreateSurchargeRuleDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var result = await _pricingService.CreateSurchargeRuleAsync(dto);
        
        if (result.IsSuccess)
        {
            return CreatedAtAction(nameof(GetSurchargeRulesByHotel), new { hotelId = dto.HotelId }, result);
        }

        return BadRequest(result);
    }

    /// <summary>
    /// Cập nhật quy tắc phụ thu
    /// </summary>
    [HttpPut("surcharge-rule/{id}")]
    public async Task<IActionResult> UpdateSurchargeRule(Guid id, [FromBody] UpdateSurchargeRuleDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var result = await _pricingService.UpdateSurchargeRuleAsync(id, dto);
        
        if (result.IsSuccess)
        {
            return Ok(result);
        }

        return BadRequest(result);
    }

    /// <summary>
    /// Xóa quy tắc phụ thu
    /// </summary>
    [HttpDelete("surcharge-rule/{id}")]
    public async Task<IActionResult> DeleteSurchargeRule(Guid id)
    {
        var result = await _pricingService.DeleteSurchargeRuleAsync(id);
        
        if (result.IsSuccess)
        {
            return Ok(result);
        }

        return BadRequest(result);
    }

    /// <summary>
    /// Lấy danh sách quy tắc phụ thu theo khách sạn
    /// </summary>
    [HttpGet("surcharge-rules/hotel/{hotelId}")]
    public async Task<IActionResult> GetSurchargeRulesByHotel(Guid hotelId)
    {
        var result = await _pricingService.GetSurchargeRulesByHotelAsync(hotelId);
        
        if (result.IsSuccess)
        {
            return Ok(result);
        }

        return BadRequest(result);
    }

    #endregion

    #region Discount Rule Management

    /// <summary>
    /// Thiết lập mã giảm giá, khuyến mãi
    /// UC-22: Quy tắc phụ thu / giảm giá (phần giảm giá)
    /// </summary>
    [HttpPost("discount-rule")]
    public async Task<IActionResult> CreateDiscountRule([FromBody] CreateDiscountRuleDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var result = await _pricingService.CreateDiscountRuleAsync(dto);
        
        if (result.IsSuccess)
        {
            return CreatedAtAction(nameof(GetDiscountRuleById), new { id = result.Data!.Id }, result);
        }

        return BadRequest(result);
    }

    /// <summary>
    /// Cập nhật quy tắc giảm giá
    /// </summary>
    [HttpPut("discount-rule/{id}")]
    public async Task<IActionResult> UpdateDiscountRule(Guid id, [FromBody] UpdateDiscountRuleDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var result = await _pricingService.UpdateDiscountRuleAsync(id, dto);
        
        if (result.IsSuccess)
        {
            return Ok(result);
        }

        return BadRequest(result);
    }

    /// <summary>
    /// Xóa quy tắc giảm giá
    /// </summary>
    [HttpDelete("discount-rule/{id}")]
    public async Task<IActionResult> DeleteDiscountRule(Guid id)
    {
        var result = await _pricingService.DeleteDiscountRuleAsync(id);
        
        if (result.IsSuccess)
        {
            return Ok(result);
        }

        return BadRequest(result);
    }

    /// <summary>
    /// Lấy thông tin quy tắc giảm giá
    /// </summary>
    [HttpGet("discount-rule/{id}")]
    public async Task<IActionResult> GetDiscountRuleById(Guid id)
    {
        var result = await _pricingService.GetDiscountRuleByIdAsync(id);
        
        if (result.IsSuccess)
        {
            return Ok(result);
        }

        return NotFound(result);
    }

    /// <summary>
    /// Lấy danh sách quy tắc giảm giá
    /// </summary>
    [HttpGet("discount-rules")]
    public async Task<IActionResult> GetDiscountRules([FromQuery] DiscountRuleQueryDto query)
    {
        var result = await _pricingService.GetDiscountRulesAsync(query);
        
        if (result.IsSuccess)
        {
            return Ok(result);
        }

        return BadRequest(result);
    }

    /// <summary>
    /// Kiểm tra tính hợp lệ của mã giảm giá
    /// </summary>
    [HttpGet("discount-code/validate")]
    public async Task<IActionResult> ValidateDiscountCode([FromQuery] Guid hotelId, [FromQuery] string code)
    {
        if (string.IsNullOrEmpty(code))
        {
            return BadRequest("Discount code is required");
        }

        var result = await _pricingService.ValidateDiscountCodeAsync(hotelId, code);
        
        if (result.IsSuccess)
        {
            return Ok(result);
        }

        return BadRequest(result);
    }

    #endregion

    #region Comprehensive Pricing

    /// <summary>
    /// Lấy tổng quan về cấu hình giá của loại phòng
    /// </summary>
    [HttpGet("overview")]
    public async Task<IActionResult> GetPricingOverview([FromQuery] Guid hotelId, [FromQuery] Guid roomTypeId)
    {
        var result = await _pricingService.GetPricingOverviewAsync(hotelId, roomTypeId);
        
        if (result.IsSuccess)
        {
            return Ok(result);
        }

        return BadRequest(result);
    }

    /// <summary>
    /// Tính toán giá phòng dựa trên các quy tắc giá đã cấu hình
    /// </summary>
    [HttpPost("calculate")]
    public async Task<IActionResult> CalculatePrice([FromBody] PriceCalculationRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var result = await _pricingService.CalculatePriceAsync(request);
        
        if (result.IsSuccess)
        {
            return Ok(result);
        }

        return BadRequest(result);
    }

    #endregion
}