using HotelManagement.Services.Common;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HotelManagement.Services.Admin.Pricing;

public interface IPricingService
{
    Task<ApiResponse<PricingQuoteResponse>> QuoteAsync(Guid roomTypeId, DateTime checkInDate, DateTime checkOutDate);
}

