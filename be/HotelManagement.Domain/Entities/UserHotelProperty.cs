using System;
using HotelManagement.Domain.Common;

namespace HotelManagement.Domain.Entities
{
    public class UserHotelProperty : BaseEntity
    {
        public Guid UserId { get; set; }
        public Guid HotelPropertyId { get; set; }
        
        // Navigation properties
        public virtual User User { get; set; }
        public virtual HotelProperty HotelProperty { get; set; }
    }
}