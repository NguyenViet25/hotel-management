using HotelManagement.Domain;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Tests.Utils;

public class EfTestContext : DbContext
{
    public EfTestContext(DbContextOptions<EfTestContext> options) : base(options) { }

    public DbSet<Invoice> Invoices => Set<Invoice>();
    public DbSet<Promotion> Promotions => Set<Promotion>();
}
