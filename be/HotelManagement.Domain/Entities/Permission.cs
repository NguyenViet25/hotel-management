using System;
using System.Collections.Generic;
using HotelManagement.Domain.Common;

namespace HotelManagement.Domain.Entities
{
    public class Permission : BaseEntity
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public string Module { get; set; }
        
        // Navigation properties
        public virtual ICollection<RolePermission> RolePermissions { get; set; }
    }
}