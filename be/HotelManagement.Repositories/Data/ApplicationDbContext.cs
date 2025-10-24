using System;
using System.Threading;
using System.Threading.Tasks;
using HotelManagement.Domain.Common;
using HotelManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Repositories.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        // User Management
        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<UserRole> UserRoles { get; set; }
        public DbSet<Permission> Permissions { get; set; }
        public DbSet<RolePermission> RolePermissions { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }
        
        // Hotel Management
        public DbSet<HotelProperty> HotelProperties { get; set; }
        public DbSet<UserHotelProperty> UserHotelProperties { get; set; }
        
        // Room Management
        public DbSet<Room> Rooms { get; set; }
        public DbSet<RoomType> RoomTypes { get; set; }
        public DbSet<MaintenanceTicket> MaintenanceTickets { get; set; }
        
        // Booking Management
        public DbSet<Guest> Guests { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<RatePlan> RatePlans { get; set; }
        public DbSet<Payment> Payments { get; set; }
        
        // Restaurant Management
        public DbSet<Restaurant> Restaurants { get; set; }
        public DbSet<MenuItem> MenuItems { get; set; }
        public DbSet<Reservation> Reservations { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure relationships
            ConfigureUserManagementRelationships(modelBuilder);
            ConfigureHotelManagementRelationships(modelBuilder);
            ConfigureRoomManagementRelationships(modelBuilder);
            ConfigureBookingManagementRelationships(modelBuilder);
            ConfigureRestaurantManagementRelationships(modelBuilder);
            
            // Configure soft delete filter
            ConfigureSoftDeleteFilter(modelBuilder);
        }

        private void ConfigureUserManagementRelationships(ModelBuilder modelBuilder)
        {
            // User - UserRole relationship
            modelBuilder.Entity<UserRole>()
                .HasOne(ur => ur.User)
                .WithMany(u => u.UserRoles)
                .HasForeignKey(ur => ur.UserId);

            // Role - UserRole relationship
            modelBuilder.Entity<UserRole>()
                .HasOne(ur => ur.Role)
                .WithMany(r => r.UserRoles)
                .HasForeignKey(ur => ur.RoleId);

            // Role - RolePermission relationship
            modelBuilder.Entity<RolePermission>()
                .HasOne(rp => rp.Role)
                .WithMany(r => r.RolePermissions)
                .HasForeignKey(rp => rp.RoleId);

            // Permission - RolePermission relationship
            modelBuilder.Entity<RolePermission>()
                .HasOne(rp => rp.Permission)
                .WithMany(p => p.RolePermissions)
                .HasForeignKey(rp => rp.PermissionId);

            // User - AuditLog relationship
            modelBuilder.Entity<AuditLog>()
                .HasOne(al => al.User)
                .WithMany(u => u.AuditLogs)
                .HasForeignKey(al => al.UserId);
        }

        private void ConfigureHotelManagementRelationships(ModelBuilder modelBuilder)
        {
            // User - UserHotelProperty relationship
            modelBuilder.Entity<UserHotelProperty>()
                .HasOne(uhp => uhp.User)
                .WithMany(u => u.UserHotelProperties)
                .HasForeignKey(uhp => uhp.UserId);

            // HotelProperty - UserHotelProperty relationship
            modelBuilder.Entity<UserHotelProperty>()
                .HasOne(uhp => uhp.HotelProperty)
                .WithMany(hp => hp.UserHotelProperties)
                .HasForeignKey(uhp => uhp.HotelPropertyId);
        }

        private void ConfigureRoomManagementRelationships(ModelBuilder modelBuilder)
        {
            // HotelProperty - Room relationship
            modelBuilder.Entity<Room>()
                .HasOne(r => r.Property)
                .WithMany(hp => hp.Rooms)
                .HasForeignKey(r => r.PropertyId);

            // RoomType - Room relationship
            modelBuilder.Entity<Room>()
                .HasOne(r => r.RoomType)
                .WithMany(rt => rt.Rooms)
                .HasForeignKey(r => r.RoomTypeId);

            // HotelProperty - RoomType relationship
            modelBuilder.Entity<RoomType>()
                .HasOne(rt => rt.HotelProperty)
                .WithMany(hp => hp.RoomTypes)
                .HasForeignKey(rt => rt.HotelPropertyId);

            // Room - MaintenanceTicket relationship
            modelBuilder.Entity<MaintenanceTicket>()
                .HasOne(mt => mt.Room)
                .WithMany(r => r.MaintenanceTickets)
                .HasForeignKey(mt => mt.RoomId);

            // HotelProperty - MaintenanceTicket relationship
            modelBuilder.Entity<MaintenanceTicket>()
                .HasOne(mt => mt.HotelProperty)
                .WithMany()
                .HasForeignKey(mt => mt.HotelPropertyId);

            // User - MaintenanceTicket relationship
            modelBuilder.Entity<MaintenanceTicket>()
                .HasOne(mt => mt.AssignedToUser)
                .WithMany()
                .HasForeignKey(mt => mt.AssignedToUserId);
        }

        private void ConfigureBookingManagementRelationships(ModelBuilder modelBuilder)
        {
            // Guest - Booking relationship
            modelBuilder.Entity<Booking>()
                .HasOne(b => b.Guest)
                .WithMany(g => g.Bookings)
                .HasForeignKey(b => b.GuestId);

            // Room - Booking relationship
            modelBuilder.Entity<Booking>()
                .HasOne(b => b.Room)
                .WithMany(r => r.Bookings)
                .HasForeignKey(b => b.RoomId);

            // RatePlan - Booking relationship
            modelBuilder.Entity<Booking>()
                .HasOne(b => b.RatePlan)
                .WithMany(rp => rp.Bookings)
                .HasForeignKey(b => b.RatePlanId);

            // HotelProperty - Booking relationship
            modelBuilder.Entity<Booking>()
                .HasOne(b => b.HotelProperty)
                .WithMany(hp => hp.Bookings)
                .HasForeignKey(b => b.HotelPropertyId);

            // RoomType - RatePlan relationship
            modelBuilder.Entity<RatePlan>()
                .HasOne(rp => rp.RoomType)
                .WithMany(rt => rt.RatePlans)
                .HasForeignKey(rp => rp.RoomTypeId);

            // HotelProperty - RatePlan relationship
            modelBuilder.Entity<RatePlan>()
                .HasOne(rp => rp.HotelProperty)
                .WithMany(hp => hp.RatePlans)
                .HasForeignKey(rp => rp.HotelPropertyId);

            // Booking - Payment relationship
            modelBuilder.Entity<Payment>()
                .HasOne(p => p.Booking)
                .WithMany(b => b.Payments)
                .HasForeignKey(p => p.BookingId);

            // HotelProperty - Payment relationship
            modelBuilder.Entity<Payment>()
                .HasOne(p => p.HotelProperty)
                .WithMany()
                .HasForeignKey(p => p.HotelPropertyId);
        }

        private void ConfigureRestaurantManagementRelationships(ModelBuilder modelBuilder)
        {
            // HotelProperty - Restaurant relationship
            modelBuilder.Entity<Restaurant>()
                .HasOne(r => r.HotelProperty)
                .WithMany(hp => hp.Restaurants)
                .HasForeignKey(r => r.HotelPropertyId);

            // Restaurant - MenuItem relationship
            modelBuilder.Entity<MenuItem>()
                .HasOne(mi => mi.Restaurant)
                .WithMany(r => r.MenuItems)
                .HasForeignKey(mi => mi.RestaurantId);

            // Restaurant - Reservation relationship
            modelBuilder.Entity<Reservation>()
                .HasOne(r => r.Restaurant)
                .WithMany(rest => rest.Reservations)
                .HasForeignKey(r => r.RestaurantId);

            // Guest - Reservation relationship
            modelBuilder.Entity<Reservation>()
                .HasOne(r => r.Guest)
                .WithMany()
                .HasForeignKey(r => r.GuestId);

            // Booking - Reservation relationship
            modelBuilder.Entity<Reservation>()
                .HasOne(r => r.Booking)
                .WithMany()
                .HasForeignKey(r => r.BookingId);

            // Restaurant - Order relationship
            modelBuilder.Entity<Order>()
                .HasOne(o => o.Restaurant)
                .WithMany()
                .HasForeignKey(o => o.RestaurantId);

            // Reservation - Order relationship
            modelBuilder.Entity<Order>()
                .HasOne(o => o.Reservation)
                .WithMany()
                .HasForeignKey(o => o.ReservationId);

            // Booking - Order relationship
            modelBuilder.Entity<Order>()
                .HasOne(o => o.Booking)
                .WithMany()
                .HasForeignKey(o => o.BookingId);

            // Guest - Order relationship
            modelBuilder.Entity<Order>()
                .HasOne(o => o.Guest)
                .WithMany()
                .HasForeignKey(o => o.GuestId);

            // Order - OrderItem relationship
            modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.Order)
                .WithMany(o => o.OrderItems)
                .HasForeignKey(oi => oi.OrderId);

            // MenuItem - OrderItem relationship
            modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.MenuItem)
                .WithMany(mi => mi.OrderItems)
                .HasForeignKey(oi => oi.MenuItemId);
        }

        private void ConfigureSoftDeleteFilter(ModelBuilder modelBuilder)
        {
            // Apply global query filter for soft delete
            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                if (typeof(BaseEntity).IsAssignableFrom(entityType.ClrType))
                {
                    var parameter = System.Linq.Expressions.Expression.Parameter(entityType.ClrType, "e");
                    var property = System.Linq.Expressions.Expression.Property(parameter, "IsDeleted");
                    var falseConstant = System.Linq.Expressions.Expression.Constant(false);
                    var expression = System.Linq.Expressions.Expression.Equal(property, falseConstant);
                    var lambda = System.Linq.Expressions.Expression.Lambda(expression, parameter);

                    modelBuilder.Entity(entityType.ClrType).HasQueryFilter(lambda);
                }
            }
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            UpdateAuditFields();
            return base.SaveChangesAsync(cancellationToken);
        }

        public override int SaveChanges()
        {
            UpdateAuditFields();
            return base.SaveChanges();
        }

        private void UpdateAuditFields()
        {
            var now = DateTime.UtcNow;
            var userId = GetCurrentUserId();

            foreach (var entry in ChangeTracker.Entries<BaseEntity>())
            {
                switch (entry.State)
                {
                    case EntityState.Added:
                        entry.Entity.CreatedAt = now;
                        entry.Entity.CreatedBy = userId;
                        entry.Entity.IsDeleted = false;
                        break;
                    case EntityState.Modified:
                        entry.Entity.UpdatedAt = now;
                        entry.Entity.UpdatedBy = userId;
                        break;
                    case EntityState.Deleted:
                        entry.State = EntityState.Modified;
                        entry.Entity.IsDeleted = true;
                        entry.Entity.DeletedAt = now;
                        entry.Entity.DeletedBy = userId;
                        break;
                }
            }
        }

        private string GetCurrentUserId()
        {
            // This would be implemented to get the current user ID from the HTTP context
            // For now, return a placeholder value
            return "system";
        }
    }
}