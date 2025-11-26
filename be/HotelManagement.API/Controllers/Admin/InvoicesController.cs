using HotelManagement.Domain;
using HotelManagement.Domain.Repositories;
using HotelManagement.Repository.Common;
using HotelManagement.Services.Admin.Bookings;
using HotelManagement.Services.Admin.Bookings.Dtos;
using HotelManagement.Services.Admin.Invoicing;
using HotelManagement.Services.Admin.Invoicing.Dtos;
using HotelManagement.Services.Admin.Orders;
using HotelManagement.Services.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/invoices")]
[Authorize]
public class InvoicesController : ControllerBase
{
    private readonly IInvoiceService _invoiceService;
    private readonly IOrdersService _ordersService;
    private readonly IBookingsService _bookingsService;
    private readonly IRepository<Promotion> _promotionRepository;
    private readonly IRepository<Invoice> _invoiceRepository;
    private readonly IUnitOfWork _unitOfWork;

    public InvoicesController(
        IInvoiceService invoiceService,
        IOrdersService ordersService,
        IBookingsService bookingsService,
        IRepository<Promotion> promotionRepository,
        IRepository<Invoice> invoiceRepository,
        IUnitOfWork unitOfWork)
    {
        _invoiceService = invoiceService;
        _ordersService = ordersService;
        _bookingsService = bookingsService;
        _promotionRepository = promotionRepository;
        _invoiceRepository = invoiceRepository;
        _unitOfWork = unitOfWork;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<InvoiceDto>>>> List([FromQuery] InvoiceFilterDto filter)
    {
        var res = await _invoiceService.GetInvoicesAsync(filter);
        return Ok(ApiResponse<PagedResult<InvoiceDto>>.Ok(res));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<InvoiceDto>>> Get(Guid id)
    {
        try
        {
            var dto = await _invoiceService.GetInvoiceAsync(id);
            return Ok(ApiResponse<InvoiceDto>.Ok(dto));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<InvoiceDto>.Fail(ex.Message));
        }
    }

    [HttpPost("walk-in")]
    public async Task<ActionResult<ApiResponse<InvoiceDto>>> CreateWalkInInvoice([FromBody] CreateWalkInInvoiceRequest request)
    {
        var orderRes = await _ordersService.GetByIdAsync(request.OrderId);
        if (!orderRes.IsSuccess || orderRes.Data is null)
        {
            return BadRequest(ApiResponse<InvoiceDto>.Fail(orderRes.Message ?? "Order not found"));
        }
        var order = orderRes.Data;
        if (!order.IsWalkIn)
        {
            return BadRequest(ApiResponse<InvoiceDto>.Fail("Order is not a walk-in order"));
        }

        var lines = new List<CreateInvoiceLineDto>();
        foreach (var it in order.Items)
        {
            lines.Add(new CreateInvoiceLineDto
            {
                Description = $"{it.MenuItemName} x{it.Quantity}",
                Amount = it.Quantity * it.UnitPrice,
                SourceType = InvoiceLineSourceType.Fnb,
                SourceId = it.Id
            });
        }

        if (!string.IsNullOrWhiteSpace(request.DiscountCode))
        {
            var now = DateTime.UtcNow;
            var promo = await _promotionRepository.Query()
                .FirstOrDefaultAsync(p => p.HotelId == order.HotelId && p.Code == request.DiscountCode && p.IsActive && p.StartDate <= now && p.EndDate >= now);
            if (promo is not null && promo.Value > 0)
            {
                var subtotal = lines.Sum(l => l.Amount);
                var discountAmt = Math.Round(subtotal * (promo.Value / 100m), 2);
                if (discountAmt > 0)
                {
                    lines.Add(new CreateInvoiceLineDto
                    {
                        Description = $"Khuyến mãi {promo.Code}",
                        Amount = -discountAmt,
                        SourceType = InvoiceLineSourceType.Discount,
                        SourceId = promo.Id
                    });
                }
            }
        }

        var createDto = new CreateInvoiceDto
        {
            HotelId = order.HotelId,
            OrderId = order.Id,
            IsWalkIn = true,
            GuestId = null,
            Notes = $"Walk-in invoice for {order.CustomerName}",
            Lines = lines
        };

        var uidClaim = User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        Guid.TryParse(uidClaim, out var userId);

        var invoice = await _invoiceService.CreateInvoiceAsync(createDto, userId);
        return Ok(ApiResponse<InvoiceDto>.Ok(invoice, "Created"));
    }

    [HttpPost("booking")]
    public async Task<ActionResult<ApiResponse<InvoiceDto>>> CreateBookingInvoice([FromBody] CreateBookingInvoiceRequest request)
    {
        var checkoutDto = new CheckoutRequestDto
        {
            DiscountCode = request.DiscountCode,
            FinalPayment = request.FinalPayment,
            CheckoutTime = request.CheckoutTime,
            AdditionalAmount = request.AdditionalAmount,
            Notes = request.Notes
        };

        var result = await _bookingsService.CheckOutAsync(request.BookingId, checkoutDto);
        if (!result.IsSuccess)
        {
            return BadRequest(ApiResponse<InvoiceDto>.Fail(result.Message ?? "Checkout failed"));
        }

        var inv = await _invoiceRepository.Query()
            .Where(i => i.BookingId == request.BookingId)
            .OrderByDescending(i => i.CreatedAt)
            .FirstOrDefaultAsync();
        if (inv is null)
        {
            return NotFound(ApiResponse<InvoiceDto>.Fail("Invoice not found after checkout"));
        }

        var dto = await _invoiceService.GetInvoiceAsync(inv.Id);
        return Ok(ApiResponse<InvoiceDto>.Ok(dto, "Created"));
    }
}

public class CreateWalkInInvoiceRequest
{
    public Guid OrderId { get; set; }
    public string? DiscountCode { get; set; }
}

public class CreateBookingInvoiceRequest
{
    public Guid BookingId { get; set; }
    public string? DiscountCode { get; set; }
    public string? Notes { get; set; }
    public decimal? AdditionalAmount { get; set; }
    public PaymentDto? FinalPayment { get; set; }
    public DateTime? CheckoutTime { get; set; }
}