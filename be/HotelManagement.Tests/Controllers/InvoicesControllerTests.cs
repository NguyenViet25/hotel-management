using HotelManagement.Api.Controllers;
using HotelManagement.Services.Admin.Bookings;
using HotelManagement.Services.Admin.Invoicing;
using HotelManagement.Services.Admin.Invoicing.Dtos;
using HotelManagement.Services.Admin.Orders;
using HotelManagement.Services.Admin.Orders.Dtos;
using HotelManagement.Services.Common;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Tests.Controllers;

public class InvoicesControllerTests
{
    private static InvoicesController CreateController(Mock<IInvoiceService> inv, Mock<IOrdersService> ord, Mock<IBookingsService> book)
    {
        var controller = new InvoicesController(inv.Object, ord.Object, book.Object, new Mock<HotelManagement.Repository.Common.IRepository<HotelManagement.Domain.Promotion>>().Object, new Mock<HotelManagement.Repository.Common.IRepository<HotelManagement.Domain.Invoice>>().Object, new Mock<HotelManagement.Domain.Repositories.IUnitOfWork>().Object);
        return controller;
    }

    [Fact]
    public async Task List_ReturnsOk()
    {
        var inv = new Mock<IInvoiceService>();
        inv.Setup(i => i.GetInvoicesAsync(It.IsAny<InvoiceFilterDto>()))
            .ReturnsAsync(new PagedResult<InvoiceDto> { Items = new List<InvoiceDto> { new InvoiceDto() }, TotalCount = 1, Page = 1, PageSize = 10 });
        var ord = new Mock<IOrdersService>();
        var book = new Mock<IBookingsService>();
        var controller = CreateController(inv, ord, book);
        var result = await controller.List(new InvoiceFilterDto());
        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Fact]
    public async Task Get_ReturnsOk()
    {
        var inv = new Mock<IInvoiceService>();
        inv.Setup(i => i.GetInvoiceAsync(It.IsAny<Guid>())).ReturnsAsync(new InvoiceDto());
        var ord = new Mock<IOrdersService>();
        var book = new Mock<IBookingsService>();
        var controller = CreateController(inv, ord, book);
        var result = await controller.Get(Guid.NewGuid());
        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Fact]
    public async Task Get_ReturnsNotFound_OnKeyNotFound()
    {
        var inv = new Mock<IInvoiceService>();
        inv.Setup(i => i.GetInvoiceAsync(It.IsAny<Guid>())).ThrowsAsync(new KeyNotFoundException("not found"));
        var ord = new Mock<IOrdersService>();
        var book = new Mock<IBookingsService>();
        var controller = CreateController(inv, ord, book);
        var result = await controller.Get(Guid.NewGuid());
        Assert.IsType<NotFoundObjectResult>(result.Result);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task CreateWalkInInvoice_ReturnsOkOrBad(bool orderExists)
    {
        var inv = new Mock<IInvoiceService>();
        inv.Setup(i => i.CreateInvoiceAsync(It.IsAny<CreateInvoiceDto>(), It.IsAny<Guid>()))
            .ReturnsAsync(new InvoiceDto { Id = Guid.NewGuid() });
        var ord = new Mock<IOrdersService>();
        var orderDto = new OrderDetailsDto { Id = Guid.NewGuid(), HotelId = Guid.NewGuid(), IsWalkIn = true, Items = new List<OrderItemDto>() };
        var orderResp = orderExists ? ApiResponse<OrderDetailsDto>.Ok(orderDto) : ApiResponse<OrderDetailsDto>.Fail("Order not found");
        ord.Setup(o => o.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync(orderResp);
        var book = new Mock<IBookingsService>();
        var controller = CreateController(inv, ord, book);
        var result = await controller.CreateWalkInInvoice(new CreateWalkInInvoiceRequest { OrderId = Guid.NewGuid() });
        if (orderExists) Assert.IsType<OkObjectResult>(result.Result); else Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task CreateBookingInvoice_ReturnsOkOrNotFound(bool invoiceCreated)
    {
        var options = new Microsoft.EntityFrameworkCore.DbContextOptionsBuilder<HotelManagement.Tests.Utils.EfTestContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        using var ctx = new HotelManagement.Tests.Utils.EfTestContext(options);
        if (invoiceCreated)
        {
            var invEntity = new HotelManagement.Domain.Invoice { Id = Guid.NewGuid(), HotelId = Guid.NewGuid(), BookingId = Guid.NewGuid(), CreatedAt = DateTime.UtcNow };
            ctx.Invoices.Add(invEntity);
            ctx.SaveChanges();
        }
        var invRepo = new Mock<HotelManagement.Repository.Common.IRepository<HotelManagement.Domain.Invoice>>();
        invRepo.Setup(r => r.Query()).Returns(ctx.Invoices.AsQueryable());

        var inv = new Mock<IInvoiceService>();
        inv.Setup(i => i.GetInvoiceAsync(It.IsAny<Guid>())).ReturnsAsync(new InvoiceDto());
        var ord = new Mock<IOrdersService>();
        var book = new Mock<IBookingsService>();
        book.Setup(b => b.CheckOutAsync(It.IsAny<Guid>(), It.IsAny<HotelManagement.Services.Admin.Bookings.Dtos.CheckoutRequestDto>()))
            .ReturnsAsync(ApiResponse<HotelManagement.Services.Admin.Bookings.Dtos.CheckoutResultDto>.Ok(new HotelManagement.Services.Admin.Bookings.Dtos.CheckoutResultDto()));

        var uow = new Mock<HotelManagement.Domain.Repositories.IUnitOfWork>();
        var promoRepo = new Mock<HotelManagement.Repository.Common.IRepository<HotelManagement.Domain.Promotion>>();

        var controller = new InvoicesController(inv.Object, ord.Object, book.Object, promoRepo.Object, invRepo.Object, uow.Object);
        var bookingId = !invoiceCreated ? Guid.NewGuid() : ctx.Invoices.First().BookingId!.Value;
        var result = await controller.CreateBookingInvoice(new CreateBookingInvoiceRequest { BookingId = bookingId });
        if (invoiceCreated) Assert.IsType<OkObjectResult>(result.Result); else Assert.IsType<NotFoundObjectResult>(result.Result);
    }

    [Fact]
    public async Task CreateWalkInInvoice_ReturnsBad_WhenBookingScopePromotion()
    {
        var options = new Microsoft.EntityFrameworkCore.DbContextOptionsBuilder<HotelManagement.Tests.Utils.EfTestContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        using var ctx = new HotelManagement.Tests.Utils.EfTestContext(options);

        var hotelId = Guid.NewGuid();
        var code = "CODE10";
        ctx.Promotions.Add(new HotelManagement.Domain.Promotion
        {
            Id = Guid.NewGuid(),
            HotelId = hotelId,
            Code = code,
            Description = "Khuyến mãi đặt phòng",
            Scope = "booking",
            Value = 10,
            IsActive = true,
            StartDate = DateTime.UtcNow.AddDays(-1),
            EndDate = DateTime.UtcNow.AddDays(1)
        });
        ctx.SaveChanges();

        var promoRepo = new Mock<HotelManagement.Repository.Common.IRepository<HotelManagement.Domain.Promotion>>();
        promoRepo.Setup(r => r.Query()).Returns(ctx.Promotions.AsQueryable());

        var invRepo = new Mock<HotelManagement.Repository.Common.IRepository<HotelManagement.Domain.Invoice>>();
        var uow = new Mock<HotelManagement.Domain.Repositories.IUnitOfWork>();

        var inv = new Mock<IInvoiceService>();
        inv.Setup(i => i.CreateInvoiceAsync(It.IsAny<CreateInvoiceDto>(), It.IsAny<Guid>()))
            .ReturnsAsync(new InvoiceDto { Id = Guid.NewGuid() });

        var ord = new Mock<IOrdersService>();
        var orderDto = new OrderDetailsDto
        {
            Id = Guid.NewGuid(),
            HotelId = hotelId,
            IsWalkIn = true,
            Items = new List<OrderItemDto> { new OrderItemDto { Id = Guid.NewGuid(), MenuItemName = "Item", Quantity = 1, UnitPrice = 100 } }
        };
        ord.Setup(o => o.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync(ApiResponse<OrderDetailsDto>.Ok(orderDto));

        var book = new Mock<IBookingsService>();
        var controller = new InvoicesController(inv.Object, ord.Object, book.Object, promoRepo.Object, invRepo.Object, uow.Object);

        var result = await controller.CreateWalkInInvoice(new CreateWalkInInvoiceRequest { OrderId = orderDto.Id, DiscountCode = code });
        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task CreateWalkInInvoice_ReturnsOk_WhenFoodScopePromotion()
    {
        var options = new Microsoft.EntityFrameworkCore.DbContextOptionsBuilder<HotelManagement.Tests.Utils.EfTestContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        using var ctx = new HotelManagement.Tests.Utils.EfTestContext(options);

        var hotelId = Guid.NewGuid();
        var code = "CODE15";
        ctx.Promotions.Add(new HotelManagement.Domain.Promotion
        {
            Id = Guid.NewGuid(),
            HotelId = hotelId,
            Code = code,
            Description = "Khuyến mãi ăn uống",
            Scope = "food",
            Value = 15,
            IsActive = true,
            StartDate = DateTime.UtcNow.AddDays(-1),
            EndDate = DateTime.UtcNow.AddDays(1)
        });
        ctx.SaveChanges();

        var promoRepo = new Mock<HotelManagement.Repository.Common.IRepository<HotelManagement.Domain.Promotion>>();
        promoRepo.Setup(r => r.Query()).Returns(ctx.Promotions.AsQueryable());

        var invRepo = new Mock<HotelManagement.Repository.Common.IRepository<HotelManagement.Domain.Invoice>>();
        var uow = new Mock<HotelManagement.Domain.Repositories.IUnitOfWork>();

        var inv = new Mock<IInvoiceService>();
        inv.Setup(i => i.CreateInvoiceAsync(It.IsAny<CreateInvoiceDto>(), It.IsAny<Guid>()))
            .ReturnsAsync(new InvoiceDto { Id = Guid.NewGuid() });

        var ord = new Mock<IOrdersService>();
        var orderDto = new OrderDetailsDto
        {
            Id = Guid.NewGuid(),
            HotelId = hotelId,
            IsWalkIn = true,
            Items = new List<OrderItemDto> { new OrderItemDto { Id = Guid.NewGuid(), MenuItemName = "Item", Quantity = 2, UnitPrice = 100 } }
        };
        ord.Setup(o => o.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync(ApiResponse<OrderDetailsDto>.Ok(orderDto));

        var book = new Mock<IBookingsService>();
        var controller = new InvoicesController(inv.Object, ord.Object, book.Object, promoRepo.Object, invRepo.Object, uow.Object);

        var result = await controller.CreateWalkInInvoice(new CreateWalkInInvoiceRequest { OrderId = orderDto.Id, DiscountCode = code });
        Assert.IsType<OkObjectResult>(result.Result);
    }
}
