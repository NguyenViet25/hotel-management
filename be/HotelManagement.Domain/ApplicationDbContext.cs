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
    public DbSet<HotelRoom> Rooms => Set<HotelRoom>();
    public DbSet<SurchargeRule> SurchargeRules => Set<SurchargeRule>();
    public DbSet<Guest> Guests => Set<Guest>();
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<BookingGuest> BookingGuests => Set<BookingGuest>();
    public DbSet<BookingRoomType> BookingRoomTypes => Set<BookingRoomType>();
    public DbSet<BookingRoom> BookingRooms => Set<BookingRoom>();
    public DbSet<CallLog> CallLogs => Set<CallLog>();
    public DbSet<HousekeepingTask> HousekeepingTasks => Set<HousekeepingTask>();
    public DbSet<RoomStatusLog> RoomStatusLogs => Set<RoomStatusLog>();
    public DbSet<MenuItem> MenuItems => Set<MenuItem>();
    public DbSet<Table> Tables => Set<Table>();
    public DbSet<DiningSession> DiningSessions => Set<DiningSession>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Invoice> Invoices => Set<Invoice>();
    public DbSet<InvoiceLine> InvoiceLines => Set<InvoiceLine>();
    public DbSet<UserPropertyRole> UserPropertyRoles => Set<UserPropertyRole>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<ShoppingItem> ShoppingItems => Set<ShoppingItem>();
    public DbSet<ShoppingOrder> ShoppingOrders => Set<ShoppingOrder>();
    public DbSet<Promotion> Promotions => Set<Promotion>();
    public DbSet<Minibar> Minibars => Set<Minibar>();
    public DbSet<MinibarBooking> MinibarBookings => Set<MinibarBooking>();
    public DbSet<Media> Media => Set<Media>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<BookingGuest>().HasKey(x =>x.BookingGuestId);

        builder.Entity<Hotel>().HasIndex(h => h.Code).IsUnique();
        builder.Entity<HotelRoom>().HasIndex(r => new { r.HotelId, r.RoomTypeId, r.Id }).IsUnique();

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

        builder.Entity<Promotion>()
            .HasIndex(p => new { p.HotelId, p.Code })
            .IsUnique();

        builder.Entity<ShoppingItem>()
          .HasOne(r => r.ShoppingOrder)
          .WithMany(h => h.Items)
          .HasForeignKey(r => r.ShoppingOrderId)
          .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<RoomType>()
            .HasOne(rt => rt.Hotel)
            .WithMany(h => h.RoomTypes)
            .HasForeignKey(rt => rt.HotelId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<OrderItem>()
            .HasOne<Order>()
            .WithMany(o => o.Items)
            .HasForeignKey(oi => oi.OrderId);

 
        // Rules relations
        builder.Entity<SurchargeRule>()
            .HasOne<Hotel>()
            .WithMany()
            .HasForeignKey(sr => sr.HotelId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<SurchargeRule>()
            .Property(s => s.Amount)
            .HasPrecision(18, 2);


        // Booking relations
        builder.Entity<Booking>()
            .HasOne<Hotel>()
            .WithMany()
            .HasForeignKey(b => b.HotelId)
            .OnDelete(DeleteBehavior.Restrict);

        var booking = builder.Entity<Booking>();

        booking.Property(s => s.TotalAmount).HasPrecision(18, 2);
        booking.Property(s => s.DepositAmount).HasPrecision(18, 2);
        booking.Property(s => s.DiscountAmount).HasPrecision(18, 2);
        booking.Property(s => s.LeftAmount).HasPrecision(18, 2);

        var bookingRoomType = builder.Entity<BookingRoomType>();
        bookingRoomType.Property(s => s.Price).HasPrecision(18, 2);

        var invoice = builder.Entity<Invoice>();
        invoice.Property(s => s.PaidAmount).HasPrecision(18, 2);
        invoice.Property(s => s.DiscountAmount).HasPrecision(18, 2);
        invoice.Property(s => s.SubTotal).HasPrecision(18, 2);
        invoice.Property(s => s.TaxAmount).HasPrecision(18, 2);
        invoice.Property(s => s.TotalAmount).HasPrecision(18, 2);

        var roomType = builder.Entity<RoomType>();
        roomType.Property(s => s.BasePriceFrom).HasPrecision(18, 2);
        roomType.Property(s => s.BasePriceTo).HasPrecision(18, 2);

        var menuItem = builder.Entity<MenuItem>();
        menuItem.Property(s => s.UnitPrice).HasPrecision(18, 2);

        var promotion = builder.Entity<Promotion>();
        promotion.Property(s => s.Value).HasPrecision(18, 2);

        var orderItem = builder.Entity<OrderItem>();
        orderItem.Property(s => s.UnitPrice).HasPrecision(18, 2);

        var invoiceLine = builder.Entity<InvoiceLine>();
        invoiceLine.Property(s => s.Amount).HasPrecision(18, 2);

        var minibar = builder.Entity<Minibar>();
        minibar.Property(s => s.Price).HasPrecision(18, 2);

        builder.Entity<MinibarBooking>()
            .HasOne<Booking>()
            .WithMany()
            .HasForeignKey(mb => mb.BookingId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<MinibarBooking>()
            .HasOne<Minibar>()
            .WithMany()
            .HasForeignKey(mb => mb.MinibarId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<BookingRoomType>()
            .HasOne<Booking>()
            .WithMany()
            .HasForeignKey(b => b.BookingId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<BookingRoom>()
            .HasOne<BookingRoomType>()
            .WithMany()
            .HasForeignKey(b => b.BookingRoomTypeId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<BookingRoom>()
            .HasOne<HotelRoom>()
            .WithMany()
            .HasForeignKey(b => b.RoomId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<Booking>()
            .HasOne(b => b.PrimaryGuest)
            .WithMany()
            .HasForeignKey(b => b.PrimaryGuestId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Entity<BookingGuest>()
            .HasOne(bg => bg.BookingRoom)
            .WithMany(b => b.Guests)
            .HasForeignKey(bg => bg.BookingRoomId)
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