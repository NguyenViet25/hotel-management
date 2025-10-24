using System;
using System.Collections.Generic;
using HotelManagement.Domain.Common;
using HotelManagement.Domain.Enums;

namespace HotelManagement.Domain.Entities
{
    public class MenuItem : BaseEntity
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public Guid RestaurantId { get; set; }
        public decimal Price { get; set; }
        public MenuItemCategory Category { get; set; }
        public bool IsAvailable { get; set; }
        public string Ingredients { get; set; }
        public string AllergenInfo { get; set; }
        public string NutritionalInfo { get; set; }
        public bool IsVegetarian { get; set; }
        public bool IsVegan { get; set; }
        public bool IsGlutenFree { get; set; }
        public string PreparationTime { get; set; }
        
        // Navigation properties
        public virtual Restaurant Restaurant { get; set; }
        public virtual ICollection<OrderItem> OrderItems { get; set; }
    }
}