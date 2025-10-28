using HotelManagement.Domain;
using HotelManagement.Repository.Common;
using HotelManagement.Services.Admin.Pricing.Dtos;
using HotelManagement.Services.Common;
using Microsoft.EntityFrameworkCore;
using System.Globalization;

namespace HotelManagement.Services.Admin.Pricing;

public class PricingService : IPricingService
{
    private readonly IRepository<RoomBasePrice> _basePriceRepository;
    private readonly IRepository<RoomDayOfWeekPrice> _dayOfWeekPriceRepository;
    private readonly IRepository<RoomDateRangePrice> _dateRangePriceRepository;
    private readonly IRepository<SurchargeRule> _surchargeRuleRepository;
    private readonly IRepository<DiscountRule> _discountRuleRepository;
    private readonly IRepository<RoomType> _roomTypeRepository;
    private readonly IRepository<Hotel> _hotelRepository;

    public PricingService(
        IRepository<RoomBasePrice> basePriceRepository,
        IRepository<RoomDayOfWeekPrice> dayOfWeekPriceRepository,
        IRepository<RoomDateRangePrice> dateRangePriceRepository,
        IRepository<SurchargeRule> surchargeRuleRepository,
        IRepository<DiscountRule> discountRuleRepository,
        IRepository<RoomType> roomTypeRepository,
        IRepository<Hotel> hotelRepository)
    {
        _basePriceRepository = basePriceRepository;
        _dayOfWeekPriceRepository = dayOfWeekPriceRepository;
        _dateRangePriceRepository = dateRangePriceRepository;
        _surchargeRuleRepository = surchargeRuleRepository;
        _discountRuleRepository = discountRuleRepository;
        _roomTypeRepository = roomTypeRepository;
        _hotelRepository = hotelRepository;
    }

    #region Base Price Management

    public async Task<ApiResponse<BasePriceDto>> SetBasePriceAsync(SetBasePriceDto dto)
    {
        try
        {
            // Validate room type exists
            var roomType = await _roomTypeRepository.Query()
                .Include(rt => rt.Hotel)
                .FirstOrDefaultAsync(rt => rt.Id == dto.RoomTypeId && rt.HotelId == dto.HotelId);

            if (roomType == null)
            {
                return ApiResponse<BasePriceDto>.Fail("Room type not found");
            }

            // Check if base price already exists
            var existingPrice = await _basePriceRepository.Query()
                .FirstOrDefaultAsync(bp => bp.HotelId == dto.HotelId && bp.RoomTypeId == dto.RoomTypeId);

            if (existingPrice != null)
            {
                existingPrice.Price = dto.Price;
                await _basePriceRepository.UpdateAsync(existingPrice);
            }
            else
            {
                existingPrice = new RoomBasePrice
                {
                    Id = Guid.NewGuid(),
                    HotelId = dto.HotelId,
                    RoomTypeId = dto.RoomTypeId,
                    Price = dto.Price
                };
                await _basePriceRepository.AddAsync(existingPrice);
            }

            await _basePriceRepository.SaveChangesAsync();

            return ApiResponse<BasePriceDto>.Ok(new BasePriceDto
            {
                Id = existingPrice.Id,
                HotelId = existingPrice.HotelId,
                RoomTypeId = existingPrice.RoomTypeId,
                RoomTypeName = roomType.Name,
                Price = existingPrice.Price
            });
        }
        catch (Exception ex)
        {
            return ApiResponse<BasePriceDto>.Fail($"Error setting base price: {ex.Message}");
        }
    }

    public async Task<ApiResponse<BasePriceDto>> GetBasePriceAsync(Guid hotelId, Guid roomTypeId)
    {
        try
        {
            var basePrice = await _basePriceRepository.Query()
                .Where(bp => bp.HotelId == hotelId && bp.RoomTypeId == roomTypeId)
                .FirstOrDefaultAsync();

            if (basePrice == null)
            {
                return ApiResponse<BasePriceDto>.Fail("Base price not found");
            }

            var roomType = await _roomTypeRepository.FindAsync(roomTypeId);

            return ApiResponse<BasePriceDto>.Ok(new BasePriceDto
            {
                Id = basePrice.Id,
                HotelId = basePrice.HotelId,
                RoomTypeId = basePrice.RoomTypeId,
                RoomTypeName = roomType?.Name ?? "",
                Price = basePrice.Price
            });
        }
        catch (Exception ex)
        {
            return ApiResponse<BasePriceDto>.Fail($"Error retrieving base price: {ex.Message}");
        }
    }

    public async Task<ApiResponse<List<BasePriceDto>>> GetBasePricesByHotelAsync(Guid hotelId)
    {
        try
        {
            var basePrices = await _basePriceRepository.Query()
                .Where(bp => bp.HotelId == hotelId)
                .Join(_roomTypeRepository.Query(),
                      bp => bp.RoomTypeId,
                      rt => rt.Id,
                      (bp, rt) => new BasePriceDto
                      {
                          Id = bp.Id,
                          HotelId = bp.HotelId,
                          RoomTypeId = bp.RoomTypeId,
                          RoomTypeName = rt.Name,
                          Price = bp.Price
                      })
                .ToListAsync();

            return ApiResponse<List<BasePriceDto>>.Ok(basePrices);
        }
        catch (Exception ex)
        {
            return ApiResponse<List<BasePriceDto>>.Fail($"Error retrieving base prices: {ex.Message}");
        }
    }

    #endregion

    #region Day of Week Price Management

    public async Task<ApiResponse<DayOfWeekPriceDto>> SetDayOfWeekPriceAsync(SetDayOfWeekPriceDto dto)
    {
        try
        {
            // Validate room type exists
            var roomType = await _roomTypeRepository.Query()
                .FirstOrDefaultAsync(rt => rt.Id == dto.RoomTypeId && rt.HotelId == dto.HotelId);

            if (roomType == null)
            {
                return ApiResponse<DayOfWeekPriceDto>.Fail("Room type not found");
            }

            // Check if day of week price already exists
            var existingPrice = await _dayOfWeekPriceRepository.Query()
                .FirstOrDefaultAsync(dp => dp.HotelId == dto.HotelId && 
                                          dp.RoomTypeId == dto.RoomTypeId && 
                                          dp.DayOfWeek == dto.DayOfWeek);

            if (existingPrice != null)
            {
                existingPrice.Price = dto.Price;
                await _dayOfWeekPriceRepository.UpdateAsync(existingPrice);
            }
            else
            {
                existingPrice = new RoomDayOfWeekPrice
                {
                    Id = Guid.NewGuid(),
                    HotelId = dto.HotelId,
                    RoomTypeId = dto.RoomTypeId,
                    DayOfWeek = dto.DayOfWeek,
                    Price = dto.Price
                };
                await _dayOfWeekPriceRepository.AddAsync(existingPrice);
            }

            await _dayOfWeekPriceRepository.SaveChangesAsync();

            return ApiResponse<DayOfWeekPriceDto>.Ok(new DayOfWeekPriceDto
            {
                Id = existingPrice.Id,
                HotelId = existingPrice.HotelId,
                RoomTypeId = existingPrice.RoomTypeId,
                RoomTypeName = roomType.Name,
                DayOfWeek = existingPrice.DayOfWeek,
                DayName = GetDayName(existingPrice.DayOfWeek),
                Price = existingPrice.Price
            });
        }
        catch (Exception ex)
        {
            return ApiResponse<DayOfWeekPriceDto>.Fail($"Error setting day of week price: {ex.Message}");
        }
    }

    public async Task<ApiResponse> SetBulkDayOfWeekPricesAsync(BulkDayOfWeekPriceDto dto)
    {
        try
        {
            // Validate room type exists
            var roomType = await _roomTypeRepository.Query()
                .FirstOrDefaultAsync(rt => rt.Id == dto.RoomTypeId && rt.HotelId == dto.HotelId);

            if (roomType == null)
            {
                return ApiResponse.Fail("Room type not found");
            }

            // Remove existing day of week prices
            var existingPrices = await _dayOfWeekPriceRepository.Query()
                .Where(dp => dp.HotelId == dto.HotelId && dp.RoomTypeId == dto.RoomTypeId)
                .ToListAsync();

            foreach (var existing in existingPrices)
            {
                await _dayOfWeekPriceRepository.RemoveAsync(existing);
            }

            // Add new prices
            foreach (var dayPrice in dto.DayPrices)
            {
                var newPrice = new RoomDayOfWeekPrice
                {
                    Id = Guid.NewGuid(),
                    HotelId = dto.HotelId,
                    RoomTypeId = dto.RoomTypeId,
                    DayOfWeek = dayPrice.DayOfWeek,
                    Price = dayPrice.Price
                };
                await _dayOfWeekPriceRepository.AddAsync(newPrice);
            }

            await _dayOfWeekPriceRepository.SaveChangesAsync();

            return ApiResponse.Ok("Day of week prices updated successfully");
        }
        catch (Exception ex)
        {
            return ApiResponse.Fail($"Error setting bulk day of week prices: {ex.Message}");
        }
    }

    public async Task<ApiResponse<List<DayOfWeekPriceDto>>> GetDayOfWeekPricesAsync(Guid hotelId, Guid roomTypeId)
    {
        try
        {
            var roomType = await _roomTypeRepository.FindAsync(roomTypeId);
            if (roomType == null)
            {
                return ApiResponse<List<DayOfWeekPriceDto>>.Fail("Room type not found");
            }

            var dayPrices = await _dayOfWeekPriceRepository.Query()
                .Where(dp => dp.HotelId == hotelId && dp.RoomTypeId == roomTypeId)
                .Select(dp => new DayOfWeekPriceDto
                {
                    Id = dp.Id,
                    HotelId = dp.HotelId,
                    RoomTypeId = dp.RoomTypeId,
                    RoomTypeName = roomType.Name,
                    DayOfWeek = dp.DayOfWeek,
                    DayName = GetDayName(dp.DayOfWeek),
                    Price = dp.Price
                })
                .OrderBy(dp => dp.DayOfWeek)
                .ToListAsync();

            return ApiResponse<List<DayOfWeekPriceDto>>.Ok(dayPrices);
        }
        catch (Exception ex)
        {
            return ApiResponse<List<DayOfWeekPriceDto>>.Fail($"Error retrieving day of week prices: {ex.Message}");
        }
    }

    public async Task<ApiResponse> RemoveDayOfWeekPriceAsync(Guid hotelId, Guid roomTypeId, int dayOfWeek)
    {
        try
        {
            var dayPrice = await _dayOfWeekPriceRepository.Query()
                .FirstOrDefaultAsync(dp => dp.HotelId == hotelId && 
                                          dp.RoomTypeId == roomTypeId && 
                                          dp.DayOfWeek == dayOfWeek);

            if (dayPrice == null)
            {
                return ApiResponse.Fail("Day of week price not found");
            }

            await _dayOfWeekPriceRepository.RemoveAsync(dayPrice);
            await _dayOfWeekPriceRepository.SaveChangesAsync();

            return ApiResponse.Ok("Day of week price removed successfully");
        }
        catch (Exception ex)
        {
            return ApiResponse.Fail($"Error removing day of week price: {ex.Message}");
        }
    }

    #endregion

    #region Date Range Price Management

    public async Task<ApiResponse<DateRangePriceDto>> CreateDateRangePriceAsync(CreateDateRangePriceDto dto)
    {
        try
        {
            // Validate room type exists
            var roomType = await _roomTypeRepository.Query()
                .FirstOrDefaultAsync(rt => rt.Id == dto.RoomTypeId && rt.HotelId == dto.HotelId);

            if (roomType == null)
            {
                return ApiResponse<DateRangePriceDto>.Fail("Room type not found");
            }

            // Validate date range
            if (dto.StartDate >= dto.EndDate)
            {
                return ApiResponse<DateRangePriceDto>.Fail("Start date must be before end date");
            }

            // Check for overlapping date ranges
            var overlapping = await _dateRangePriceRepository.Query()
                .AnyAsync(dr => dr.HotelId == dto.HotelId && 
                               dr.RoomTypeId == dto.RoomTypeId &&
                               ((dto.StartDate >= dr.StartDate && dto.StartDate < dr.EndDate) ||
                                (dto.EndDate > dr.StartDate && dto.EndDate <= dr.EndDate) ||
                                (dto.StartDate <= dr.StartDate && dto.EndDate >= dr.EndDate)));

            if (overlapping)
            {
                return ApiResponse<DateRangePriceDto>.Fail("Date range overlaps with existing price range");
            }

            var dateRangePrice = new RoomDateRangePrice
            {
                Id = Guid.NewGuid(),
                HotelId = dto.HotelId,
                RoomTypeId = dto.RoomTypeId,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Price = dto.Price
            };

            await _dateRangePriceRepository.AddAsync(dateRangePrice);
            await _dateRangePriceRepository.SaveChangesAsync();

            return ApiResponse<DateRangePriceDto>.Ok(new DateRangePriceDto
            {
                Id = dateRangePrice.Id,
                HotelId = dateRangePrice.HotelId,
                RoomTypeId = dateRangePrice.RoomTypeId,
                RoomTypeName = roomType.Name,
                StartDate = dateRangePrice.StartDate,
                EndDate = dateRangePrice.EndDate,
                Price = dateRangePrice.Price,
                Description = dto.Description,
                IsActive = DateTime.Now >= dateRangePrice.StartDate && DateTime.Now <= dateRangePrice.EndDate
            });
        }
        catch (Exception ex)
        {
            return ApiResponse<DateRangePriceDto>.Fail($"Error creating date range price: {ex.Message}");
        }
    }

    public async Task<ApiResponse<DateRangePriceDto>> UpdateDateRangePriceAsync(Guid id, UpdateDateRangePriceDto dto)
    {
        try
        {
            var dateRangePrice = await _dateRangePriceRepository.FindAsync(id);
            if (dateRangePrice == null)
            {
                return ApiResponse<DateRangePriceDto>.Fail("Date range price not found");
            }

            // Validate date range
            if (dto.StartDate >= dto.EndDate)
            {
                return ApiResponse<DateRangePriceDto>.Fail("Start date must be before end date");
            }

            // Check for overlapping date ranges (excluding current record)
            var overlapping = await _dateRangePriceRepository.Query()
                .AnyAsync(dr => dr.Id != id &&
                               dr.HotelId == dateRangePrice.HotelId && 
                               dr.RoomTypeId == dateRangePrice.RoomTypeId &&
                               ((dto.StartDate >= dr.StartDate && dto.StartDate < dr.EndDate) ||
                                (dto.EndDate > dr.StartDate && dto.EndDate <= dr.EndDate) ||
                                (dto.StartDate <= dr.StartDate && dto.EndDate >= dr.EndDate)));

            if (overlapping)
            {
                return ApiResponse<DateRangePriceDto>.Fail("Date range overlaps with existing price range");
            }

            dateRangePrice.StartDate = dto.StartDate;
            dateRangePrice.EndDate = dto.EndDate;
            dateRangePrice.Price = dto.Price;

            await _dateRangePriceRepository.UpdateAsync(dateRangePrice);
            await _dateRangePriceRepository.SaveChangesAsync();

            var roomType = await _roomTypeRepository.FindAsync(dateRangePrice.RoomTypeId);

            return ApiResponse<DateRangePriceDto>.Ok(new DateRangePriceDto
            {
                Id = dateRangePrice.Id,
                HotelId = dateRangePrice.HotelId,
                RoomTypeId = dateRangePrice.RoomTypeId,
                RoomTypeName = roomType?.Name ?? "",
                StartDate = dateRangePrice.StartDate,
                EndDate = dateRangePrice.EndDate,
                Price = dateRangePrice.Price,
                Description = dto.Description,
                IsActive = DateTime.Now >= dateRangePrice.StartDate && DateTime.Now <= dateRangePrice.EndDate
            });
        }
        catch (Exception ex)
        {
            return ApiResponse<DateRangePriceDto>.Fail($"Error updating date range price: {ex.Message}");
        }
    }

    public async Task<ApiResponse> DeleteDateRangePriceAsync(Guid id)
    {
        try
        {
            var dateRangePrice = await _dateRangePriceRepository.FindAsync(id);
            if (dateRangePrice == null)
            {
                return ApiResponse.Fail("Date range price not found");
            }

            await _dateRangePriceRepository.RemoveAsync(dateRangePrice);
            await _dateRangePriceRepository.SaveChangesAsync();

            return ApiResponse.Ok("Date range price deleted successfully");
        }
        catch (Exception ex)
        {
            return ApiResponse.Fail($"Error deleting date range price: {ex.Message}");
        }
    }

    public async Task<ApiResponse<DateRangePriceDto>> GetDateRangePriceByIdAsync(Guid id)
    {
        try
        {
            var dateRangePrice = await _dateRangePriceRepository.FindAsync(id);
            if (dateRangePrice == null)
            {
                return ApiResponse<DateRangePriceDto>.Fail("Date range price not found");
            }

            var roomType = await _roomTypeRepository.FindAsync(dateRangePrice.RoomTypeId);

            return ApiResponse<DateRangePriceDto>.Ok(new DateRangePriceDto
            {
                Id = dateRangePrice.Id,
                HotelId = dateRangePrice.HotelId,
                RoomTypeId = dateRangePrice.RoomTypeId,
                RoomTypeName = roomType?.Name ?? "",
                StartDate = dateRangePrice.StartDate,
                EndDate = dateRangePrice.EndDate,
                Price = dateRangePrice.Price,
                Description = "",
                IsActive = DateTime.Now >= dateRangePrice.StartDate && DateTime.Now <= dateRangePrice.EndDate
            });
        }
        catch (Exception ex)
        {
            return ApiResponse<DateRangePriceDto>.Fail($"Error retrieving date range price: {ex.Message}");
        }
    }

    public async Task<ApiResponse<List<DateRangePriceDto>>> GetDateRangePricesAsync(DateRangePriceQueryDto query)
    {
        try
        {
            var queryable = _dateRangePriceRepository.Query().AsQueryable();

            if (query.HotelId.HasValue)
            {
                queryable = queryable.Where(dr => dr.HotelId == query.HotelId.Value);
            }

            if (query.RoomTypeId.HasValue)
            {
                queryable = queryable.Where(dr => dr.RoomTypeId == query.RoomTypeId.Value);
            }

            if (query.StartDate.HasValue)
            {
                queryable = queryable.Where(dr => dr.EndDate >= query.StartDate.Value);
            }

            if (query.EndDate.HasValue)
            {
                queryable = queryable.Where(dr => dr.StartDate <= query.EndDate.Value);
            }

            var dateRangePrices = await queryable
                .Join(_roomTypeRepository.Query(),
                      dr => dr.RoomTypeId,
                      rt => rt.Id,
                      (dr, rt) => new DateRangePriceDto
                      {
                          Id = dr.Id,
                          HotelId = dr.HotelId,
                          RoomTypeId = dr.RoomTypeId,
                          RoomTypeName = rt.Name,
                          StartDate = dr.StartDate,
                          EndDate = dr.EndDate,
                          Price = dr.Price,
                          Description = "",
                          IsActive = DateTime.Now >= dr.StartDate && DateTime.Now <= dr.EndDate
                      })
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToListAsync();

            return ApiResponse<List<DateRangePriceDto>>.Ok(dateRangePrices);
        }
        catch (Exception ex)
        {
            return ApiResponse<List<DateRangePriceDto>>.Fail($"Error retrieving date range prices: {ex.Message}");
        }
    }

    #endregion

    #region Surcharge Rule Management

    public async Task<ApiResponse<SurchargeRuleDto>> CreateSurchargeRuleAsync(CreateSurchargeRuleDto dto)
    {
        try
        {
            // Validate hotel exists
            var hotel = await _hotelRepository.FindAsync(dto.HotelId);
            if (hotel == null)
            {
                return ApiResponse<SurchargeRuleDto>.Fail("Hotel not found");
            }

            // Check if surcharge rule already exists for this type
            var existing = await _surchargeRuleRepository.Query()
                .FirstOrDefaultAsync(sr => sr.HotelId == dto.HotelId && sr.Type == (SurchargeType)dto.SurchargeType);

            if (existing != null)
            {
                return ApiResponse<SurchargeRuleDto>.Fail("Surcharge rule for this type already exists");
            }

            var surchargeRule = new SurchargeRule
            {
                Id = Guid.NewGuid(),
                HotelId = dto.HotelId,
                Type = (SurchargeType)dto.SurchargeType,
                Amount = dto.Amount,
                IsPercentage = dto.IsPercentage
            };

            await _surchargeRuleRepository.AddAsync(surchargeRule);
            await _surchargeRuleRepository.SaveChangesAsync();

            return ApiResponse<SurchargeRuleDto>.Ok(MapToSurchargeRuleDto(surchargeRule));
        }
        catch (Exception ex)
        {
            return ApiResponse<SurchargeRuleDto>.Fail($"Error creating surcharge rule: {ex.Message}");
        }
    }

    public async Task<ApiResponse<SurchargeRuleDto>> UpdateSurchargeRuleAsync(Guid id, UpdateSurchargeRuleDto dto)
    {
        try
        {
            var surchargeRule = await _surchargeRuleRepository.FindAsync(id);
            if (surchargeRule == null)
            {
                return ApiResponse<SurchargeRuleDto>.Fail("Surcharge rule not found");
            }

            surchargeRule.Amount = dto.Amount;
            surchargeRule.IsPercentage = dto.IsPercentage;

            await _surchargeRuleRepository.UpdateAsync(surchargeRule);
            await _surchargeRuleRepository.SaveChangesAsync();

            return ApiResponse<SurchargeRuleDto>.Ok(MapToSurchargeRuleDto(surchargeRule));
        }
        catch (Exception ex)
        {
            return ApiResponse<SurchargeRuleDto>.Fail($"Error updating surcharge rule: {ex.Message}");
        }
    }

    public async Task<ApiResponse> DeleteSurchargeRuleAsync(Guid id)
    {
        try
        {
            var surchargeRule = await _surchargeRuleRepository.FindAsync(id);
            if (surchargeRule == null)
            {
                return ApiResponse.Fail("Surcharge rule not found");
            }

            await _surchargeRuleRepository.RemoveAsync(surchargeRule);
            await _surchargeRuleRepository.SaveChangesAsync();

            return ApiResponse.Ok("Surcharge rule deleted successfully");
        }
        catch (Exception ex)
        {
            return ApiResponse.Fail($"Error deleting surcharge rule: {ex.Message}");
        }
    }

    public async Task<ApiResponse<List<SurchargeRuleDto>>> GetSurchargeRulesByHotelAsync(Guid hotelId)
    {
        try
        {
            var surchargeRules = await _surchargeRuleRepository.Query()
                .Where(sr => sr.HotelId == hotelId)
                .Select(sr => MapToSurchargeRuleDto(sr))
                .ToListAsync();

            return ApiResponse<List<SurchargeRuleDto>>.Ok(surchargeRules);
        }
        catch (Exception ex)
        {
            return ApiResponse<List<SurchargeRuleDto>>.Fail($"Error retrieving surcharge rules: {ex.Message}");
        }
    }

    #endregion

    #region Discount Rule Management

    public async Task<ApiResponse<DiscountRuleDto>> CreateDiscountRuleAsync(CreateDiscountRuleDto dto)
    {
        try
        {
            // Validate hotel exists
            var hotel = await _hotelRepository.FindAsync(dto.HotelId);
            if (hotel == null)
            {
                return ApiResponse<DiscountRuleDto>.Fail("Hotel not found");
            }

            // Check if discount code already exists
            var existing = await _discountRuleRepository.Query()
                .FirstOrDefaultAsync(dr => dr.HotelId == dto.HotelId && dr.Code == dto.Code);

            if (existing != null)
            {
                return ApiResponse<DiscountRuleDto>.Fail("Discount code already exists");
            }

            var discountRule = new DiscountRule
            {
                Id = Guid.NewGuid(),
                HotelId = dto.HotelId,
                Code = dto.Code,
                Amount = dto.Amount,
                IsPercentage = dto.IsPercentage,
                ValidFrom = dto.ValidFrom,
                ValidTo = dto.ValidTo,
                IsActive = true
            };

            await _discountRuleRepository.AddAsync(discountRule);
            await _discountRuleRepository.SaveChangesAsync();

            return ApiResponse<DiscountRuleDto>.Ok(MapToDiscountRuleDto(discountRule));
        }
        catch (Exception ex)
        {
            return ApiResponse<DiscountRuleDto>.Fail($"Error creating discount rule: {ex.Message}");
        }
    }

    public async Task<ApiResponse<DiscountRuleDto>> UpdateDiscountRuleAsync(Guid id, UpdateDiscountRuleDto dto)
    {
        try
        {
            var discountRule = await _discountRuleRepository.FindAsync(id);
            if (discountRule == null)
            {
                return ApiResponse<DiscountRuleDto>.Fail("Discount rule not found");
            }

            // Check if new code conflicts with existing codes
            if (discountRule.Code != dto.Code)
            {
                var existing = await _discountRuleRepository.Query()
                    .FirstOrDefaultAsync(dr => dr.HotelId == discountRule.HotelId && dr.Code == dto.Code && dr.Id != id);

                if (existing != null)
                {
                    return ApiResponse<DiscountRuleDto>.Fail("Discount code already exists");
                }
            }

            discountRule.Code = dto.Code;
            discountRule.Amount = dto.Amount;
            discountRule.IsPercentage = dto.IsPercentage;
            discountRule.ValidFrom = dto.ValidFrom;
            discountRule.ValidTo = dto.ValidTo;
            discountRule.IsActive = dto.IsActive;

            await _discountRuleRepository.UpdateAsync(discountRule);
            await _discountRuleRepository.SaveChangesAsync();

            return ApiResponse<DiscountRuleDto>.Ok(MapToDiscountRuleDto(discountRule));
        }
        catch (Exception ex)
        {
            return ApiResponse<DiscountRuleDto>.Fail($"Error updating discount rule: {ex.Message}");
        }
    }

    public async Task<ApiResponse> DeleteDiscountRuleAsync(Guid id)
    {
        try
        {
            var discountRule = await _discountRuleRepository.FindAsync(id);
            if (discountRule == null)
            {
                return ApiResponse.Fail("Discount rule not found");
            }

            await _discountRuleRepository.RemoveAsync(discountRule);
            await _discountRuleRepository.SaveChangesAsync();

            return ApiResponse.Ok("Discount rule deleted successfully");
        }
        catch (Exception ex)
        {
            return ApiResponse.Fail($"Error deleting discount rule: {ex.Message}");
        }
    }

    public async Task<ApiResponse<DiscountRuleDto>> GetDiscountRuleByIdAsync(Guid id)
    {
        try
        {
            var discountRule = await _discountRuleRepository.FindAsync(id);
            if (discountRule == null)
            {
                return ApiResponse<DiscountRuleDto>.Fail("Discount rule not found");
            }

            return ApiResponse<DiscountRuleDto>.Ok(MapToDiscountRuleDto(discountRule));
        }
        catch (Exception ex)
        {
            return ApiResponse<DiscountRuleDto>.Fail($"Error retrieving discount rule: {ex.Message}");
        }
    }

    public async Task<ApiResponse<List<DiscountRuleDto>>> GetDiscountRulesAsync(DiscountRuleQueryDto query)
    {
        try
        {
            var queryable = _discountRuleRepository.Query().AsQueryable();

            if (query.HotelId.HasValue)
            {
                queryable = queryable.Where(dr => dr.HotelId == query.HotelId.Value);
            }

            if (!string.IsNullOrEmpty(query.Code))
            {
                queryable = queryable.Where(dr => dr.Code.Contains(query.Code));
            }

            if (query.IsActive.HasValue)
            {
                queryable = queryable.Where(dr => dr.IsActive == query.IsActive.Value);
            }

            if (query.OnlyValid.HasValue && query.OnlyValid.Value)
            {
                var now = DateTime.Now;
                queryable = queryable.Where(dr => dr.IsActive && 
                                                 (!dr.ValidFrom.HasValue || dr.ValidFrom <= now) &&
                                                 (!dr.ValidTo.HasValue || dr.ValidTo >= now));
            }

            var discountRules = await queryable
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .Select(dr => MapToDiscountRuleDto(dr))
                .ToListAsync();

            return ApiResponse<List<DiscountRuleDto>>.Ok(discountRules);
        }
        catch (Exception ex)
        {
            return ApiResponse<List<DiscountRuleDto>>.Fail($"Error retrieving discount rules: {ex.Message}");
        }
    }

    public async Task<ApiResponse<DiscountRuleDto>> ValidateDiscountCodeAsync(Guid hotelId, string code)
    {
        try
        {
            var now = DateTime.Now;
            var discountRule = await _discountRuleRepository.Query()
                .FirstOrDefaultAsync(dr => dr.HotelId == hotelId && 
                                          dr.Code == code && 
                                          dr.IsActive &&
                                          (!dr.ValidFrom.HasValue || dr.ValidFrom <= now) &&
                                          (!dr.ValidTo.HasValue || dr.ValidTo >= now));

            if (discountRule == null)
            {
                return ApiResponse<DiscountRuleDto>.Fail("Invalid or expired discount code");
            }

            return ApiResponse<DiscountRuleDto>.Ok(MapToDiscountRuleDto(discountRule));
        }
        catch (Exception ex)
        {
            return ApiResponse<DiscountRuleDto>.Fail($"Error validating discount code: {ex.Message}");
        }
    }

    #endregion

    #region Comprehensive Pricing

    public async Task<ApiResponse<PricingOverviewDto>> GetPricingOverviewAsync(Guid hotelId, Guid roomTypeId)
    {
        try
        {
            var roomType = await _roomTypeRepository.FindAsync(roomTypeId);
            if (roomType == null)
            {
                return ApiResponse<PricingOverviewDto>.Fail("Room type not found");
            }

            var basePrice = await _basePriceRepository.Query()
                .Where(bp => bp.HotelId == hotelId && bp.RoomTypeId == roomTypeId)
                .Select(bp => bp.Price)
                .FirstOrDefaultAsync();

            var dayOfWeekPrices = await GetDayOfWeekPricesAsync(hotelId, roomTypeId);
            var activeDateRangePrices = await _dateRangePriceRepository.Query()
                .Where(dr => dr.HotelId == hotelId && dr.RoomTypeId == roomTypeId && dr.EndDate >= DateTime.Now)
                .Join(_roomTypeRepository.Query(),
                      dr => dr.RoomTypeId,
                      rt => rt.Id,
                      (dr, rt) => new DateRangePriceDto
                      {
                          Id = dr.Id,
                          HotelId = dr.HotelId,
                          RoomTypeId = dr.RoomTypeId,
                          RoomTypeName = rt.Name,
                          StartDate = dr.StartDate,
                          EndDate = dr.EndDate,
                          Price = dr.Price,
                          Description = "",
                          IsActive = DateTime.Now >= dr.StartDate && DateTime.Now <= dr.EndDate
                      })
                .ToListAsync();

            var surchargeRules = await GetSurchargeRulesByHotelAsync(hotelId);

            return ApiResponse<PricingOverviewDto>.Ok(new PricingOverviewDto
            {
                RoomTypeId = roomTypeId,
                RoomTypeName = roomType.Name,
                BasePrice = basePrice == 0 ? null : basePrice,
                DayOfWeekPrices = dayOfWeekPrices.Data ?? new List<DayOfWeekPriceDto>(),
                ActiveDateRangePrices = activeDateRangePrices,
                SurchargeRules = surchargeRules.Data ?? new List<SurchargeRuleDto>()
            });
        }
        catch (Exception ex)
        {
            return ApiResponse<PricingOverviewDto>.Fail($"Error retrieving pricing overview: {ex.Message}");
        }
    }

    public async Task<ApiResponse<PriceCalculationResultDto>> CalculatePriceAsync(PriceCalculationRequestDto request)
    {
        try
        {
            var result = new PriceCalculationResultDto
            {
                Breakdown = new List<PriceBreakdownDto>(),
                AppliedSurcharges = new List<string>()
            };

            // Get base price
            var basePrice = await _basePriceRepository.Query()
                .Where(bp => bp.HotelId == request.HotelId && bp.RoomTypeId == request.RoomTypeId)
                .Select(bp => bp.Price)
                .FirstOrDefaultAsync();

            if (basePrice == 0)
            {
                return ApiResponse<PriceCalculationResultDto>.Fail("Base price not set for this room type");
            }

            // Calculate price for each night
            var currentDate = request.CheckInDate;
            while (currentDate < request.CheckOutDate)
            {
                var dailyPrice = await GetDailyPrice(request.HotelId, request.RoomTypeId, currentDate, basePrice);
                
                result.Breakdown.Add(new PriceBreakdownDto
                {
                    Date = currentDate,
                    DayName = currentDate.ToString("dddd", CultureInfo.InvariantCulture),
                    Price = dailyPrice.Price,
                    PriceSource = dailyPrice.Source
                });

                result.BaseAmount += dailyPrice.Price;
                currentDate = currentDate.AddDays(1);
            }

            // Calculate surcharges
            var surchargeRules = await _surchargeRuleRepository.Query()
                .Where(sr => sr.HotelId == request.HotelId)
                .ToListAsync();

            foreach (var rule in surchargeRules)
            {
                var shouldApply = rule.Type switch
                {
                    SurchargeType.EarlyCheckIn => request.EarlyCheckIn,
                    SurchargeType.LateCheckOut => request.LateCheckOut,
                    SurchargeType.ExtraGuest => request.GuestCount > 2, // Assuming 2 is standard
                    _ => false
                };

                if (shouldApply)
                {
                    var surchargeAmount = rule.IsPercentage 
                        ? result.BaseAmount * (rule.Amount / 100) 
                        : rule.Amount;
                    
                    result.SurchargeAmount += surchargeAmount;
                    result.AppliedSurcharges.Add($"{rule.Type}: {(rule.IsPercentage ? $"{rule.Amount}%" : $"{rule.Amount:C}")}");
                }
            }

            // Apply discount if provided
            if (!string.IsNullOrEmpty(request.DiscountCode))
            {
                var discountValidation = await ValidateDiscountCodeAsync(request.HotelId, request.DiscountCode);
                if (discountValidation.Success && discountValidation.Data != null)
                {
                    var discount = discountValidation.Data;
                    result.DiscountCode = discount.Code;
                    result.DiscountAmount = discount.IsPercentage 
                        ? result.BaseAmount * (discount.Amount / 100) 
                        : discount.Amount;
                }
            }

            result.TotalAmount = result.BaseAmount + result.SurchargeAmount - result.DiscountAmount;

            return ApiResponse<PriceCalculationResultDto>.Ok(result);
        }
        catch (Exception ex)
        {
            return ApiResponse<PriceCalculationResultDto>.Fail($"Error calculating price: {ex.Message}");
        }
    }

    #endregion

    #region Helper Methods

    private async Task<(decimal Price, string Source)> GetDailyPrice(Guid hotelId, Guid roomTypeId, DateTime date, decimal basePrice)
    {
        // Check for date range price first (highest priority)
        var dateRangePrice = await _dateRangePriceRepository.Query()
            .Where(dr => dr.HotelId == hotelId && 
                        dr.RoomTypeId == roomTypeId && 
                        date >= dr.StartDate && 
                        date <= dr.EndDate)
            .Select(dr => dr.Price)
            .FirstOrDefaultAsync();

        if (dateRangePrice > 0)
        {
            return (dateRangePrice, "DateRange");
        }

        // Check for day of week price
        var dayOfWeek = (int)date.DayOfWeek;
        var dayOfWeekPrice = await _dayOfWeekPriceRepository.Query()
            .Where(dp => dp.HotelId == hotelId && 
                        dp.RoomTypeId == roomTypeId && 
                        dp.DayOfWeek == dayOfWeek)
            .Select(dp => dp.Price)
            .FirstOrDefaultAsync();

        if (dayOfWeekPrice > 0)
        {
            return (dayOfWeekPrice, "DayOfWeek");
        }

        // Fall back to base price
        return (basePrice, "Base");
    }

    private static string GetDayName(int dayOfWeek)
    {
        return dayOfWeek switch
        {
            0 => "Sunday",
            1 => "Monday",
            2 => "Tuesday",
            3 => "Wednesday",
            4 => "Thursday",
            5 => "Friday",
            6 => "Saturday",
            _ => "Unknown"
        };
    }

    private static SurchargeRuleDto MapToSurchargeRuleDto(SurchargeRule surchargeRule)
    {
        return new SurchargeRuleDto
        {
            Id = surchargeRule.Id,
            HotelId = surchargeRule.HotelId,
            SurchargeType = (int)surchargeRule.Type,
            SurchargeTypeName = surchargeRule.Type.ToString(),
            Amount = surchargeRule.Amount,
            IsPercentage = surchargeRule.IsPercentage,
            DisplayAmount = surchargeRule.IsPercentage ? $"{surchargeRule.Amount}%" : $"{surchargeRule.Amount:C}"
        };
    }

    private static DiscountRuleDto MapToDiscountRuleDto(DiscountRule discountRule)
    {
        var now = DateTime.Now;
        var isCurrentlyValid = discountRule.IsActive &&
                              (!discountRule.ValidFrom.HasValue || discountRule.ValidFrom <= now) &&
                              (!discountRule.ValidTo.HasValue || discountRule.ValidTo >= now);

        return new DiscountRuleDto
        {
            Id = discountRule.Id,
            HotelId = discountRule.HotelId,
            Code = discountRule.Code,
            Amount = discountRule.Amount,
            IsPercentage = discountRule.IsPercentage,
            ValidFrom = discountRule.ValidFrom,
            ValidTo = discountRule.ValidTo,
            IsActive = discountRule.IsActive,
            Description = "",
            DisplayAmount = discountRule.IsPercentage ? $"{discountRule.Amount}%" : $"{discountRule.Amount:C}",
            IsCurrentlyValid = isCurrentlyValid
        };
    }

    #endregion
}