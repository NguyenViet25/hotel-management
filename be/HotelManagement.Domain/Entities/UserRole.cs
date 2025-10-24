using System;
using HotelManagement.Domain.Common;

namespace HotelManagement.Domain.Entities
{
    public class UserRole : BaseEntity
    {
        public Guid UserId { get; set; }
        public Guid RoleId { get; set; }
        
        // Navigation properties
        public virtual User User { get; set; }
        public virtual Role Role { get; set; }
    }
}