using HotelManagement.Domain;
using HotelManagement.Domain.Repositories;
using HotelManagement.Repository.Common;
using HotelManagement.Services.Admin.Invoicing.Dtos;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Services.Admin.Invoicing;

public class InvoiceService : IInvoiceService
{
    private readonly IRepository<Invoice> _invoiceRepository;
    private readonly IRepository<InvoiceLine> _invoiceLineRepository;
    private readonly IUnitOfWork _unitOfWork;

    public InvoiceService(
        IRepository<Invoice> invoiceRepository,
        IRepository<InvoiceLine> invoiceLineRepository,
        IUnitOfWork unitOfWork)
    {
        _invoiceRepository = invoiceRepository;
        _invoiceLineRepository = invoiceLineRepository;
        _unitOfWork = unitOfWork;
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
            CreatedAt = DateTime.UtcNow
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
        invoice.IssuedAt = DateTime.UtcNow;

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
        return $"INV-{DateTime.UtcNow:yyMM}-{new Random().Next(100000, 999999)}";
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