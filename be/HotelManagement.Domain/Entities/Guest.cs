using System;
using System.Collections.Generic;
using HotelManagement.Domain.Common;

namespace HotelManagement.Domain.Entities
{
    public class Guest : BaseEntity
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public string Address { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public string Country { get; set; }
        public string PostalCode { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string Nationality { get; set; }
        public string IdType { get; set; }
        public string IdNumber { get; set; }
        public string Notes { get; set; }
        public bool IsVIP { get; set; }
        public bool IsBlacklisted { get; set; }
        public string BlacklistReason { get; set; }
        public string LoyaltyMemberId { get; set; }
        public int? LoyaltyPoints { get; set; }
        
        // Navigation properties
        public virtual ICollection<Booking> Bookings { get; set; }
    }
}