using System;
using System.Collections.Generic;

namespace HotelManagement.Services.Admin.Pricing;

public class PricingQuoteItemDto
{
    public DateTime Date { get; set; }
    public decimal Price { get; set; }
}

public class PricingQuoteResponse
{
    public List<PricingQuoteItemDto> Items { get; set; } = new();
    public decimal Total { get; set; }
}

