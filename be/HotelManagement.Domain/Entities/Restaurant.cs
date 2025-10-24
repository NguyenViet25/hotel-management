using System;
using System.Collections.Generic;
using HotelManagement.Domain.Common;

namespace HotelManagement.Domain.Entities
{
    public class Restaurant : BaseEntity
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public Guid HotelPropertyId { get; set; }
        public string Location { get; set; }
        public int Capacity { get; set; }
        public string OpeningHours { get; set; }
        public string Cuisine { get; set; }
        public bool IsActive { get; set; }
        public string ContactNumber { get; set; }
        public string Email { get; set; }
        
        // Navigation properties
        public virtual HotelProperty HotelProperty { get; set; }
        public virtual ICollection<MenuItem> MenuItems { get; set; }
        public virtual ICollection<Reservation> Reservations { get; set; }
    }
}