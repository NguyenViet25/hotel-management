using System;
using System.Collections.Generic;
using HotelManagement.Domain.Common;
using HotelManagement.Domain.Enums;

namespace HotelManagement.Domain.Entities
{
    /// <summary>
    /// Represents a hotel property in the system
    /// </summary>
    public class HotelProperty : BaseEntity
    {
        /// <summary>
        /// Gets or sets the name of the hotel property
        /// </summary>
        public string Name { get; set; }
        
        /// <summary>
        /// Gets or sets the street address of the hotel property
        /// </summary>
        /// </summary>
        public string Address { get; set; }
        
        /// <summary>
        /// Gets or sets the city where the hotel property is located
        /// </summary>
        /// </summary>
        public string City { get; set; }
        
        /// <summary>
        /// Gets or sets the state/province where the hotel property is located
        /// </summary>
        public string State { get; set; }
        
        /// <summary>
        /// Gets or sets the country where the hotel property is located
        /// </summary>
        public string Country { get; set; }
        
        /// <summary>
        /// Gets or sets the postal/zip code of the hotel property
        /// </summary>
        public string PostalCode { get; set; }
        
        /// <summary>
        /// Gets or sets the contact phone number for the hotel property
        /// </summary>
        public string PhoneNumber { get; set; }
        
        /// <summary>
        /// Gets or sets the contact email address for the hotel property
        /// </summary>
        public string Email { get; set; }
        
        /// <summary>
        /// Gets or sets the website URL for the hotel property
        /// </summary>
        public string Website { get; set; }
        
        /// <summary>
        /// Gets or sets the time zone identifier for the hotel property's location
        /// </summary>
        public string TimeZone { get; set; }
        
        /// <summary>
        /// Gets or sets the tax rate applied to bookings at this hotel property
        /// </summary>
        public decimal TaxRate { get; set; }
        
        /// <summary>
        /// Gets or sets the currency code used for pricing at this hotel property
        /// </summary>
        public string Currency { get; set; }
        
        /// <summary>
        /// Gets or sets the current operational status of the hotel property
        /// </summary>
        public PropertyStatus Status { get; set; }
        
        /// <summary>
        /// Gets or sets the collection of amenities available at this hotel property
        /// </summary>
        public virtual ICollection<PropertyAmenity> Amenities { get; set; }
        
        // Navigation properties
        /// <summary>
        /// Gets or sets the collection of user-property associations
        /// </summary>
        public virtual ICollection<UserHotelProperty> UserHotelProperties { get; set; }
        
        /// <summary>
        /// Gets or sets the collection of rooms in this hotel property
        /// </summary>
        public virtual ICollection<Room> Rooms { get; set; }
        
        /// <summary>
        /// Gets or sets the collection of room types available in this hotel property
        /// </summary>
        public virtual ICollection<RoomType> RoomTypes { get; set; }
        
        /// <summary>
        /// Gets or sets the collection of rate plans available for this hotel property
        /// </summary>
        public virtual ICollection<RatePlan> RatePlans { get; set; }
        
        /// <summary>
        /// Gets or sets the collection of bookings made for this hotel property
        /// </summary>
        public virtual ICollection<Booking> Bookings { get; set; }
        
        /// <summary>
        /// Gets or sets the collection of restaurants in this hotel property
        /// </summary>
        public virtual ICollection<Restaurant> Restaurants { get; set; }
    }
}