using System;
using System.Collections.Generic;

namespace HotelManagement.API.Models
{
    /// <summary>
    /// Request model for creating a notification
    /// </summary>
    public class NotificationRequest
    {
        public Guid UserId { get; set; }
        public string Title { get; set; }
        public string Message { get; set; }
        public string Type { get; set; } // Info, Warning, Alert, etc.
        public Guid? RelatedEntityId { get; set; }
        public string RelatedEntityType { get; set; } // Booking, Maintenance, etc.
    }

    /// <summary>
    /// Request model for sending bulk notifications
    /// </summary>
    public class BulkNotificationRequest
    {
        public List<Guid> UserIds { get; set; }
        public string Title { get; set; }
        public string Message { get; set; }
        public string Type { get; set; } // Info, Warning, Alert, etc.
        public Guid? RelatedEntityId { get; set; }
        public string RelatedEntityType { get; set; } // Booking, Maintenance, etc.
    }

    /// <summary>
    /// Request model for updating notification preferences
    /// </summary>
    public class NotificationPreferencesRequest
    {
        public bool EmailNotifications { get; set; }
        public bool PushNotifications { get; set; }
        public bool SmsNotifications { get; set; }
        public Dictionary<string, bool> NotificationTypePreferences { get; set; }
    }
}