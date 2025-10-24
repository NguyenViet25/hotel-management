using System;
using HotelManagement.Domain.Common;

namespace HotelManagement.Domain.Entities
{
    public class OrderItem : BaseEntity
    {
        public Guid OrderId { get; set; }
        public Guid MenuItemId { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal Subtotal { get; set; }
        public string SpecialInstructions { get; set; }
        public bool IsComplimentary { get; set; }
        public string ComplimentaryReason { get; set; }
        
        // Navigation properties
        public virtual Order Order { get; set; }
        public virtual MenuItem MenuItem { get; set; }
    }
}