using HotelManagement.Domain;
using HotelManagement.Domain.Entities;
using HotelManagement.Repository.Common;
using HotelManagement.Services.Admin.RoomTypes.Dtos;
using HotelManagement.Services.Common;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace HotelManagement.Services.Admin.Pricing;

public class PricingService : IPricingService
{
    private readonly IRepository<RoomType> _roomTypeRepository;

    public PricingService(IRepository<RoomType> roomTypeRepository)
    {
        _roomTypeRepository = roomTypeRepository;
    }

    public async Task<ApiResponse<PricingQuoteResponse>> QuoteAsync(Guid roomTypeId, DateTime checkInDate, DateTime checkOutDate)
    {
        try
        {
            if (checkOutDate <= checkInDate)
            {
                return ApiResponse<PricingQuoteResponse>.Fail("Check-out date must be after check-in date");
            }

            var roomType = await _roomTypeRepository.Query()
                .FirstOrDefaultAsync(rt => rt.Id == roomTypeId);

            if (roomType == null)
            {
                return ApiResponse<PricingQuoteResponse>.Fail("Room type not found");
            }

            var overridePrices = new List<PriceByDate>();
            if (!string.IsNullOrWhiteSpace(roomType.Prices))
            {
                try
                {
                    overridePrices = JsonSerializer.Deserialize<List<PriceByDate>>(roomType.Prices) ?? new List<PriceByDate>();
                }
                catch
                {
                    overridePrices = new List<PriceByDate>();
                }
            }

            var items = new List<PricingQuoteItemDto>();
            var cursor = checkInDate.Date;
            var endExclusive = checkOutDate.Date;

            while (cursor < endExclusive)
            {
                var match = overridePrices.FirstOrDefault(p => p.Date.Date == cursor);
                var price = match?.Price ?? roomType.BasePriceFrom;
                items.Add(new PricingQuoteItemDto
                {
                    Date = cursor,
                    Price = price
                });
                cursor = cursor.AddDays(1);
            }

            var total = items.Sum(i => i.Price);
            var resp = new PricingQuoteResponse
            {
                Items = items,
                Total = total
            };

            return ApiResponse<PricingQuoteResponse>.Ok(resp);
        }
        catch (Exception ex)
        {
            return ApiResponse<PricingQuoteResponse>.Fail($"Error generating quote: {ex.Message}");
        }
    }
}

