using HotelManagement.Services.Admin.Invoicing.Dtos;

namespace HotelManagement.Services.Admin.Invoicing;

public interface IInvoiceService
{
    Task<InvoiceDto> CreateInvoiceAsync(CreateInvoiceDto request, Guid userId);
    Task<InvoiceDto> GetInvoiceAsync(Guid id);
    Task<InvoiceDto> UpdateInvoiceAsync(Guid id, UpdateInvoiceDto request);
    Task<InvoiceDto> IssueInvoiceAsync(Guid id);
    Task<InvoiceDto> CancelInvoiceAsync(Guid id);
    Task<PagedResult<InvoiceDto>> GetInvoicesAsync(InvoiceFilterDto filter);
}