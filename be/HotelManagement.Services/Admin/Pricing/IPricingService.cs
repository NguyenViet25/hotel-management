using HotelManagement.Services.Admin.Pricing.Dtos;
using HotelManagement.Services.Common;

namespace HotelManagement.Services.Admin.Pricing;

public interface IPricingService
{
    // Base Price Management
    Task<ApiResponse<BasePriceDto>> SetBasePriceAsync(SetBasePriceDto dto);
    Task<ApiResponse<BasePriceDto>> GetBasePriceAsync(Guid hotelId, Guid roomTypeId);
    Task<ApiResponse<List<BasePriceDto>>> GetBasePricesByHotelAsync(Guid hotelId);

    // Day of Week Price Management
    Task<ApiResponse<DayOfWeekPriceDto>> SetDayOfWeekPriceAsync(SetDayOfWeekPriceDto dto);
    Task<ApiResponse> SetBulkDayOfWeekPricesAsync(BulkDayOfWeekPriceDto dto);
    Task<ApiResponse<List<DayOfWeekPriceDto>>> GetDayOfWeekPricesAsync(Guid hotelId, Guid roomTypeId);
    Task<ApiResponse> RemoveDayOfWeekPriceAsync(Guid hotelId, Guid roomTypeId, int dayOfWeek);

    // Date Range Price Management
    Task<ApiResponse<DateRangePriceDto>> CreateDateRangePriceAsync(CreateDateRangePriceDto dto);
    Task<ApiResponse<DateRangePriceDto>> UpdateDateRangePriceAsync(Guid id, UpdateDateRangePriceDto dto);
    Task<ApiResponse> DeleteDateRangePriceAsync(Guid id);
    Task<ApiResponse<DateRangePriceDto>> GetDateRangePriceByIdAsync(Guid id);
    Task<ApiResponse<List<DateRangePriceDto>>> GetDateRangePricesAsync(DateRangePriceQueryDto query);

    // Surcharge Rule Management
    Task<ApiResponse<SurchargeRuleDto>> CreateSurchargeRuleAsync(CreateSurchargeRuleDto dto);
    Task<ApiResponse<SurchargeRuleDto>> UpdateSurchargeRuleAsync(Guid id, UpdateSurchargeRuleDto dto);
    Task<ApiResponse> DeleteSurchargeRuleAsync(Guid id);
    Task<ApiResponse<List<SurchargeRuleDto>>> GetSurchargeRulesByHotelAsync(Guid hotelId);

    // Discount Rule Management
    Task<ApiResponse<DiscountRuleDto>> CreateDiscountRuleAsync(CreateDiscountRuleDto dto);
    Task<ApiResponse<DiscountRuleDto>> UpdateDiscountRuleAsync(Guid id, UpdateDiscountRuleDto dto);
    Task<ApiResponse> DeleteDiscountRuleAsync(Guid id);
    Task<ApiResponse<DiscountRuleDto>> GetDiscountRuleByIdAsync(Guid id);
    Task<ApiResponse<List<DiscountRuleDto>>> GetDiscountRulesAsync(DiscountRuleQueryDto query);
    Task<ApiResponse<DiscountRuleDto>> ValidateDiscountCodeAsync(Guid hotelId, string code);

    // Comprehensive Pricing
    Task<ApiResponse<PricingOverviewDto>> GetPricingOverviewAsync(Guid hotelId, Guid roomTypeId);
    Task<ApiResponse<PriceCalculationResultDto>> CalculatePriceAsync(PriceCalculationRequestDto request);
}