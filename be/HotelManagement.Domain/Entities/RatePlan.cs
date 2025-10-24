using System;
using System.Collections.Generic;
using HotelManagement.Domain.Common;
using HotelManagement.Domain.Enums;

namespace HotelManagement.Domain.Entities
{
    public class RatePlan : BaseEntity
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public Guid RoomTypeId { get; set; }
        public Guid HotelPropertyId { get; set; }
        public decimal BasePrice { get; set; }
        public decimal? ExtraAdultPrice { get; set; }
        public decimal? ExtraChildPrice { get; set; }
        public int? MinStay { get; set; }
        public int? MaxStay { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool IsActive { get; set; }
        public RatePlanType Type { get; set; }
        public decimal? DepositAmount { get; set; }
        public CancellationPolicy CancellationPolicy { get; set; }
        public int? CancellationDays { get; set; }
        public decimal? CancellationFee { get; set; }
        
        // Navigation properties
        public virtual RoomType RoomType { get; set; }
        public virtual HotelProperty HotelProperty { get; set; }
        public virtual ICollection<Booking> Bookings { get; set; }
    }
}