using HotelManagement.Domain;
using HotelManagement.Domain.Repositories;
using HotelManagement.Repository.Common;
using HotelManagement.Services.Admin.Invoicing.Dtos;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace HotelManagement.Services.Admin.Invoicing;

public class InvoiceService : IInvoiceService
{
    private readonly IRepository<Invoice> _invoiceRepository;
    private readonly IRepository<InvoiceLine> _invoiceLineRepository;
    private readonly IRepository<Booking> _bookingRepository;
    private readonly IUnitOfWork _unitOfWork;

    public InvoiceService(
        IRepository<Invoice> invoiceRepository,
        IRepository<InvoiceLine> invoiceLineRepository,
        IRepository<Booking> bookingRepository,
        IUnitOfWork unitOfWork)
    {
        _invoiceRepository = invoiceRepository;
        _invoiceLineRepository = invoiceLineRepository;
        _unitOfWork = unitOfWork;
        _bookingRepository = bookingRepository;
    }



    public async Task<InvoiceDto> CreateInvoiceAsync(CreateInvoiceDto request, Guid userId)
    {

        var invoice = new Invoice
        {
            Id = Guid.NewGuid(),
            HotelId = request.HotelId,
            BookingId = request.BookingId,
            OrderId = request.OrderId,
            GuestId = request.GuestId,
            IsWalkIn = request.IsWalkIn,
            InvoiceNumber = GenerateInvoiceNumber(),
            Status = InvoiceStatus.Draft,
            Notes = request.Notes,
            CreatedById = userId,
            CreatedAt = DateTime.Now
        };

        // Add invoice lines
        foreach (var line in request.Lines)
        {
            invoice.Lines.Add(new InvoiceLine
            {
                Id = Guid.NewGuid(),
                Description = line.Description,
                Amount = line.Amount,
                SourceType = line.SourceType,
                SourceId = line.SourceId
            });
        }

        // Calculate totals
        CalculateInvoiceTotals(invoice);

        await _invoiceRepository.AddAsync(invoice);
        await _invoiceRepository.SaveChangesAsync();

        return MapToDto(invoice);
    }

    public async Task<InvoiceDto> GetInvoiceAsync(Guid id)
    {
        var invoice = await _invoiceRepository.Query()
            .Include(i => i.Lines)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (invoice == null)
        {
            throw new KeyNotFoundException($"Invoice with ID {id} not found");
        }

        return MapToDto(invoice);
    }

    public async Task<InvoiceDto> UpdateInvoiceAsync(Guid id, UpdateInvoiceDto request)
    {
        var invoice = await _invoiceRepository.Query()
            .Include(i => i.Lines)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (invoice == null)
        {
            throw new KeyNotFoundException($"Invoice with ID {id} not found");
        }

        if (invoice.Status != InvoiceStatus.Draft)
        {
            throw new InvalidOperationException("Only draft invoices can be updated");
        }

        // Update notes if provided
        if (request.Notes != null)
        {
            invoice.Notes = request.Notes;
        }

        // Add new lines if provided
        if (request.AddLines != null && request.AddLines.Any())
        {
            foreach (var line in request.AddLines)
            {
                invoice.Lines.Add(new InvoiceLine
                {
                    Id = Guid.NewGuid(),
                    InvoiceId = invoice.Id,
                    Description = line.Description,
                    Amount = line.Amount,
                    SourceType = line.SourceType,
                    SourceId = line.SourceId
                });
            }
        }

        // Remove lines if provided
        if (request.RemoveLineIds != null && request.RemoveLineIds.Any())
        {
            var linesToRemove = invoice.Lines.Where(l => request.RemoveLineIds.Contains(l.Id)).ToList();
            foreach (var line in linesToRemove)
            {
                invoice.Lines.Remove(line);
                await _invoiceLineRepository.RemoveAsync(line);
            }
        }

        // Recalculate totals
        CalculateInvoiceTotals(invoice);

        await _invoiceRepository.UpdateAsync(invoice);
        await _unitOfWork.SaveChangesAsync();

        return MapToDto(invoice);
    }

    public async Task<InvoiceDto> IssueInvoiceAsync(Guid id)
    {
        var invoice = await _invoiceRepository.Query()
            .Include(i => i.Lines)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (invoice == null)
        {
            throw new KeyNotFoundException($"Invoice with ID {id} not found");
        }

        if (invoice.Status != InvoiceStatus.Draft)
        {
            throw new InvalidOperationException("Only draft invoices can be issued");
        }

        invoice.Status = InvoiceStatus.Issued;
        invoice.IssuedAt = DateTime.Now;

        await _invoiceRepository.UpdateAsync(invoice);
        await _unitOfWork.SaveChangesAsync();

        return MapToDto(invoice);
    }

    public async Task<InvoiceDto> CancelInvoiceAsync(Guid id)
    {
        var invoice = await _invoiceRepository.Query()
            .Include(i => i.Lines)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (invoice == null)
        {
            throw new KeyNotFoundException($"Invoice with ID {id} not found");
        }

        if (invoice.Status == InvoiceStatus.Paid)
        {
            throw new InvalidOperationException("Paid invoices cannot be cancelled");
        }

        invoice.Status = InvoiceStatus.Cancelled;

        await _invoiceRepository.UpdateAsync(invoice);
        await _unitOfWork.SaveChangesAsync();

        return MapToDto(invoice);
    }

    public async Task<PagedResult<InvoiceDto>> GetInvoicesAsync(InvoiceFilterDto filter)
    {
        var query = _invoiceRepository.Query()
            .Include(i => i.Lines)
            .AsQueryable();

        // Apply filters
        if (filter.HotelId.HasValue)
        {
            query = query.Where(i => i.HotelId == filter.HotelId);
        }

        if (filter.BookingId.HasValue)
        {
            query = query.Where(i => i.BookingId == filter.BookingId);
        }

        if (filter.GuestId.HasValue)
        {
            query = query.Where(i => i.GuestId == filter.GuestId);
        }

        if (filter.Status.HasValue)
        {
            query = query.Where(i => i.Status == filter.Status);
        }

        if (filter.FromDate.HasValue)
        {
            query = query.Where(i => i.CreatedAt >= filter.FromDate);
        }

        if (filter.ToDate.HasValue)
        {
            query = query.Where(i => i.CreatedAt <= filter.ToDate);
        }

        // Get total count
        var totalCount = await query.CountAsync();

        // Apply pagination
        var items = await query
            .OrderByDescending(i => i.CreatedAt)
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync();

        return new PagedResult<InvoiceDto>
        {
            Items = items.Select(MapToDto).ToList(),
            TotalCount = totalCount,
            Page = filter.Page,
            PageSize = filter.PageSize
        };
    }

    public async Task<RevenueStatsDto> GetRevenueAsync(RevenueQueryDto query)
    {
    

        var q = _invoiceRepository.Query().Where(x => x.BookingId != null).AsQueryable();

        q = q.Where(i => i.HotelId == query.HotelId);
        q = q.Where(i => i.Status != InvoiceStatus.Cancelled);

        if (!(query.IncludeIssued && query.IncludePaid))
        {
            var statuses = new List<InvoiceStatus>();
            if (query.IncludeIssued) statuses.Add(InvoiceStatus.Issued);
            if (query.IncludePaid) statuses.Add(InvoiceStatus.Paid);
            q = q.Where(i => statuses.Contains(i.Status));
        }

        if (query.FromDate.HasValue)
        {
            q = q.Where(i => i.CreatedAt >= query.FromDate);
        }
        if (query.ToDate.HasValue)
        {
            q = q.Where(i => i.CreatedAt <= query.ToDate);
        }

        var items = await q.Select(i => new { i.TotalAmount, i.CreatedAt }).ToListAsync();

        var gran = (query.Granularity ?? "day").ToLowerInvariant();

        Func<DateTime, DateTime> bucket = gran == "month"
            ? (d => new DateTime(d.Year, d.Month, 1))
            : (d => d.Date);

        var points = items
            .GroupBy(i => bucket(i.CreatedAt))
            .OrderBy(g => g.Key)
            .Select(g => new RevenuePointDto { Date = g.Key, Total = g.Sum(x => x.TotalAmount) })
            .ToList();

        var total = items.Sum(i => i.TotalAmount);
        var count = items.Count;

        return new RevenueStatsDto { Total = total < 0 ? 0 : total, Count = count, Points = points };
    }

    public async Task<RevenueBreakdownDto> GetRevenueBreakdownAsync(RevenueQueryDto query)
    {
        var q = _invoiceRepository.Query().Include(i => i.Lines).AsQueryable();

        q = q.Where(i => i.HotelId == query.HotelId);
        q = q.Where(i => i.Status != InvoiceStatus.Cancelled);

        if (query.FromDate.HasValue)
        {
            q = q.Where(i => i.CreatedAt >= query.FromDate);
        }
        if (query.ToDate.HasValue)
        {
            q = q.Where(i => i.CreatedAt <= query.ToDate);
        }

        var invoices = await q.ToListAsync();

        var roomTotal = invoices.Sum(i => i.Lines.Where(l => l.SourceType == InvoiceLineSourceType.RoomCharge).Sum(l => l.Amount));
        var fnbTotal = invoices.Sum(i => i.Lines.Where(l => l.SourceType == InvoiceLineSourceType.Fnb).Sum(l => l.Amount));
        var otherTotal = invoices.Sum(i => i.Lines.Where(l => l.SourceType == InvoiceLineSourceType.Surcharge).Sum(l => l.Amount));
        var discountTotal = invoices.Sum(i => i.Lines.Where(l => l.SourceType == InvoiceLineSourceType.Discount).Sum(l => l.Amount));

        var gran = (query.Granularity ?? "day").ToLowerInvariant();
        Func<DateTime, DateTime> bucket = gran == "month"
            ? (d => new DateTime(d.Year, d.Month, 1))
            : (d => d.Date);

        var points = invoices
            .GroupBy(i => bucket(i.CreatedAt))
            .OrderBy(g => g.Key)
            .Select(g => new RevenueCategoryPointDto
            {
                Date = g.Key,
                RoomTotal = g.Sum(i => i.Lines.Where(l => l.SourceType == InvoiceLineSourceType.RoomCharge).Sum(l => l.Amount)),
                FnbTotal = g.Sum(i => i.Lines.Where(l => l.SourceType == InvoiceLineSourceType.Fnb).Sum(l => l.Amount)),
                OtherTotal = g.Sum(i => i.Lines.Where(l => l.SourceType == InvoiceLineSourceType.Surcharge).Sum(l => l.Amount)),
                DiscountTotal = g.Sum(i => i.Lines.Where(l => l.SourceType == InvoiceLineSourceType.Discount).Sum(l => l.Amount)),
            })
            .ToList();

        return new RevenueBreakdownDto
        {
            RoomTotal = roomTotal,
            FnbTotal = fnbTotal,
            OtherTotal = otherTotal,
            DiscountTotal = discountTotal,
            Points = points
        };
    }

    public async Task<List<RevenueDetailItemDto>> GetRevenueDetailsAsync(RevenueQueryDto query, InvoiceLineSourceType? sourceType = null)
    {
        var q = _invoiceRepository.Query().Include(i => i.Lines).AsQueryable();
        q = q.Where(i => i.HotelId == query.HotelId);
        q = q.Where(i => i.Status != InvoiceStatus.Cancelled);
        if (query.FromDate.HasValue) q = q.Where(i => i.CreatedAt >= query.FromDate);
        if (query.ToDate.HasValue) q = q.Where(i => i.CreatedAt <= query.ToDate);

        var invoices = await q.OrderByDescending(i => i.CreatedAt).ToListAsync();

        var list = new List<RevenueDetailItemDto>();
        foreach (var inv in invoices)
        {
            foreach (var l in inv.Lines)
            {
                if (sourceType.HasValue && l.SourceType != sourceType.Value) continue;
                list.Add(new RevenueDetailItemDto
                {
                    InvoiceId = inv.Id,
                    BookingId = inv.BookingId,
                    OrderId = inv.OrderId,
                    CreatedAt = inv.CreatedAt,
                    Description = l.Description,
                    Amount = l.Amount,
                    SourceType = l.SourceType
                });
            }
        }
        return list;
    }

    private void CalculateInvoiceTotals(Invoice invoice)
    {
        // Calculate subtotal (sum of all positive line amounts)
        invoice.SubTotal = invoice.Lines.Where(l => l.Amount > 0).Sum(l => l.Amount);

        // Calculate discount amount (sum of all negative line amounts, as a positive number)
        invoice.DiscountAmount = Math.Abs(invoice.Lines.Where(l => l.Amount < 0).Sum(l => l.Amount));

        // Calculate tax amount (if VAT included)
        invoice.TaxAmount = invoice.VatIncluded ? Math.Round(invoice.SubTotal * 0.1m, 2) : 0;

        // Calculate total amount
        invoice.TotalAmount = invoice.SubTotal - invoice.DiscountAmount + invoice.TaxAmount;
    }

    private string GenerateInvoiceNumber()
    {
        // Format: INV-{YearMonth}-{Random6Digits}
        return $"INV-{DateTime.Now:yyMM}-{new Random().Next(100000, 999999)}";
    }

    private InvoiceDto MapToDto(Invoice invoice)
    {
        return new InvoiceDto
        {
            Id = invoice.Id,
            InvoiceNumber = invoice.InvoiceNumber,
            HotelId = invoice.HotelId,
            BookingId = invoice.BookingId,
            OrderId = invoice.OrderId,
            GuestId = invoice.GuestId,
            IsWalkIn = invoice.IsWalkIn,
            SubTotal = invoice.SubTotal,
            TaxAmount = invoice.TaxAmount,
            DiscountAmount = invoice.DiscountAmount,
            TotalAmount = invoice.TotalAmount,
            PaidAmount = invoice.PaidAmount,
            VatIncluded = invoice.VatIncluded,
            PdfUrl = invoice.PdfUrl,
            Status = invoice.Status,
            Notes = invoice.Notes,
            CreatedAt = invoice.CreatedAt,
            IssuedAt = invoice.IssuedAt,
            PaidAt = invoice.PaidAt,
            Lines = invoice.Lines.Select(l => new InvoiceLineDto
            {
                Id = l.Id,
                Description = l.Description,
                Amount = l.Amount,
                SourceType = l.SourceType,
                SourceId = l.SourceId
            }).ToList()
        };
    }
}
