using HotelManagement.Domain;
using HotelManagement.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Repository;

public class ApplicationDbContext : IdentityDbContext<AppUser, IdentityRole<Guid>, Guid>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<Hotel> Hotels => Set<Hotel>();
    public DbSet<RoomType> RoomTypes => Set<RoomType>();
    public DbSet<Amenity> Amenities => Set<Amenity>();
    public DbSet<RoomTypeAmenity> RoomTypeAmenities => Set<RoomTypeAmenity>();
    public DbSet<HotelRoom> Rooms => Set<HotelRoom>();
    public DbSet<RoomBasePrice> RoomBasePrices => Set<RoomBasePrice>();
    public DbSet<RoomDayOfWeekPrice> RoomDayOfWeekPrices => Set<RoomDayOfWeekPrice>();
    public DbSet<RoomDateRangePrice> RoomDateRangePrices => Set<RoomDateRangePrice>();
    public DbSet<SurchargeRule> SurchargeRules => Set<SurchargeRule>();
    public DbSet<DiscountRule> DiscountRules => Set<DiscountRule>();
    public DbSet<Guest> Guests => Set<Guest>();
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<BookingGuest> BookingGuests => Set<BookingGuest>();
    public DbSet<CallLog> CallLogs => Set<CallLog>();
    public DbSet<HousekeepingTask> HousekeepingTasks => Set<HousekeepingTask>();
    public DbSet<RoomStatusLog> RoomStatusLogs => Set<RoomStatusLog>();
    public DbSet<MenuGroup> MenuGroups => Set<MenuGroup>();
    public DbSet<MenuItem> MenuItems => Set<MenuItem>();
    public DbSet<Table> Tables => Set<Table>();
    public DbSet<DiningSession> DiningSessions => Set<DiningSession>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<Invoice> Invoices => Set<Invoice>();
    public DbSet<InvoiceLine> InvoiceLines => Set<InvoiceLine>();
    public DbSet<UserPropertyRole> UserPropertyRoles => Set<UserPropertyRole>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<RoomTypeAmenity>().HasKey(x => new { x.RoomTypeId, x.AmenityId });
        builder.Entity<BookingGuest>().HasKey(x => new { x.BookingId, x.GuestId });

        builder.Entity<Hotel>().HasIndex(h => h.Code).IsUnique();
        builder.Entity<HotelRoom>().HasIndex(r => new { r.HotelId, r.Number }).IsUnique();

        builder.Entity<HotelRoom>()
            .HasOne(r => r.RoomType)
            .WithMany(rt => rt.Rooms)
            .HasForeignKey(r => r.RoomTypeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<HotelRoom>()
            .HasOne(r => r.Hotel)
            .WithMany(h => h.Rooms)
            .HasForeignKey(r => r.HotelId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<RoomType>()
            .HasOne(rt => rt.Hotel)
            .WithMany(h => h.RoomTypes)
            .HasForeignKey(rt => rt.HotelId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<Amenity>()
            .HasOne(a => a.Hotel)
            .WithMany()
            .HasForeignKey(a => a.HotelId);

        builder.Entity<OrderItem>()
            .HasOne<Order>()
            .WithMany(o => o.Items)
            .HasForeignKey(oi => oi.OrderId);

        builder.Entity<MenuItem>()
            .HasOne(mi => mi.Group)
            .WithMany(g => g.Items)
            .HasForeignKey(mi => mi.MenuGroupId);

        // Pricing relations
        builder.Entity<RoomBasePrice>()
            .HasOne<Hotel>()
            .WithMany()
            .HasForeignKey(rbp => rbp.HotelId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<RoomBasePrice>()
            .HasOne<RoomType>()
            .WithMany()
            .HasForeignKey(rbp => rbp.RoomTypeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<RoomDayOfWeekPrice>()
            .HasOne<Hotel>()
            .WithMany()
            .HasForeignKey(rdwp => rdwp.HotelId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<RoomDayOfWeekPrice>()
            .HasOne<RoomType>()
            .WithMany()
            .HasForeignKey(rdwp => rdwp.RoomTypeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<RoomDateRangePrice>()
            .HasOne<Hotel>()
            .WithMany()
            .HasForeignKey(rdrp => rdrp.HotelId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<RoomDateRangePrice>()
            .HasOne<RoomType>()
            .WithMany()
            .HasForeignKey(rdrp => rdrp.RoomTypeId)
            .OnDelete(DeleteBehavior.Restrict);

        // Rules relations
        builder.Entity<SurchargeRule>()
            .HasOne<Hotel>()
            .WithMany()
            .HasForeignKey(sr => sr.HotelId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<DiscountRule>()
            .HasOne<Hotel>()
            .WithMany()
            .HasForeignKey(dr => dr.HotelId)
            .OnDelete(DeleteBehavior.Restrict);

        // Booking relations
        builder.Entity<Booking>()
            .HasOne<Hotel>()
            .WithMany()
            .HasForeignKey(b => b.HotelId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<Booking>()
            .HasOne<HotelRoom>()
            .WithMany()
            .HasForeignKey(b => b.RoomId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<Booking>()
            .HasOne(b => b.PrimaryGuest)
            .WithMany()
            .HasForeignKey(b => b.PrimaryGuestId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Entity<BookingGuest>()
            .HasOne(bg => bg.Booking)
            .WithMany(b => b.Guests)
            .HasForeignKey(bg => bg.BookingId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<BookingGuest>()
            .HasOne(bg => bg.Guest)
            .WithMany()
            .HasForeignKey(bg => bg.GuestId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<CallLog>()
            .HasOne<Booking>()
            .WithMany(b => b.CallLogs)
            .HasForeignKey(cl => cl.BookingId)
            .OnDelete(DeleteBehavior.Restrict);

        // Housekeeping relations
        builder.Entity<HousekeepingTask>()
            .HasOne<Hotel>()
            .WithMany()
            .HasForeignKey(hk => hk.HotelId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<HousekeepingTask>()
            .HasOne<HotelRoom>()
            .WithMany()
            .HasForeignKey(hk => hk.RoomId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<RoomStatusLog>()
            .HasOne<Hotel>()
            .WithMany()
            .HasForeignKey(rsl => rsl.HotelId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<RoomStatusLog>()
            .HasOne<HotelRoom>()
            .WithMany(r => r.StatusLogs)
            .HasForeignKey(rsl => rsl.RoomId)
            .OnDelete(DeleteBehavior.Restrict);

        // Menu relations
        builder.Entity<MenuGroup>()
            .HasOne<Hotel>()
            .WithMany()
            .HasForeignKey(mg => mg.HotelId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<MenuItem>()
            .HasOne<Hotel>()
            .WithMany()
            .HasForeignKey(mi => mi.HotelId)
            .OnDelete(DeleteBehavior.Restrict);

        // Dining relations
        builder.Entity<Table>()
            .HasOne<Hotel>()
            .WithMany()
            .HasForeignKey(t => t.HotelId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<DiningSession>()
            .HasOne<Hotel>()
            .WithMany()
            .HasForeignKey(ds => ds.HotelId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<DiningSession>()
            .HasOne<Table>()
            .WithMany()
            .HasForeignKey(ds => ds.TableId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<DiningSession>()
            .HasOne<AppUser>()
            .WithMany()
            .HasForeignKey(ds => ds.WaiterUserId)
            .OnDelete(DeleteBehavior.SetNull);

        // Orders relations
        builder.Entity<Order>()
            .HasOne<Hotel>()
            .WithMany()
            .HasForeignKey(o => o.HotelId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<Order>()
            .HasOne<Booking>()
            .WithMany()
            .HasForeignKey(o => o.BookingId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<Order>()
            .HasOne<DiningSession>()
            .WithMany()
            .HasForeignKey(o => o.DiningSessionId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<OrderItem>()
            .HasOne<MenuItem>()
            .WithMany()
            .HasForeignKey(oi => oi.MenuItemId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<OrderItem>()
            .HasOne<MenuItem>()
            .WithMany()
            .HasForeignKey(oi => oi.ProposedReplacementMenuItemId)
            .OnDelete(DeleteBehavior.SetNull);

        // Billing relations
        builder.Entity<Payment>()
            .HasOne<Hotel>()
            .WithMany()
            .HasForeignKey(p => p.HotelId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<Payment>()
            .HasOne<Booking>()
            .WithMany()
            .HasForeignKey(p => p.BookingId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<Payment>()
            .HasOne<Order>()
            .WithMany()
            .HasForeignKey(p => p.OrderId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<Invoice>()
            .HasOne<Hotel>()
            .WithMany()
            .HasForeignKey(i => i.HotelId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<Invoice>()
            .HasOne<Booking>()
            .WithMany()
            .HasForeignKey(i => i.BookingId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<Invoice>()
            .HasOne<Order>()
            .WithMany()
            .HasForeignKey(i => i.OrderId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<InvoiceLine>()
            .HasOne<Invoice>()
            .WithMany(i => i.Lines)
            .HasForeignKey(il => il.InvoiceId)
            .OnDelete(DeleteBehavior.Cascade);

        // Security & audit
        builder.Entity<UserPropertyRole>()
            .HasOne<Hotel>()
            .WithMany()
            .HasForeignKey(upr => upr.HotelId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<UserPropertyRole>()
            .HasOne<AppUser>()
            .WithMany()
            .HasForeignKey(upr => upr.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<AuditLog>()
            .HasOne<Hotel>()
            .WithMany()
            .HasForeignKey(al => al.HotelId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Entity<AuditLog>()
            .HasOne<AppUser>()
            .WithMany()
            .HasForeignKey(al => al.UserId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}