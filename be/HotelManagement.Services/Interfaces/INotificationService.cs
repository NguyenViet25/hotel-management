namespace HotelManagement.Services.Interfaces
{
    /// <summary>
    /// Interface for notification service operations
    /// </summary>
    public interface INotificationService
    {
        /// <summary>
        /// Gets all notifications for a user
        /// </summary>
        /// <param name="userId">The user ID</param>
        /// <returns>A list of notifications</returns>
        Task<IEnumerable<object>> GetUserNotificationsAsync(Guid userId);

        /// <summary>
        /// Gets a notification by ID for a specific user
        /// </summary>
        /// <param name="id">The notification ID</param>
        /// <param name="userId">The user ID</param>
        /// <returns>The notification if found and belongs to the user, or null if not found</returns>
        Task<object> GetNotificationByIdAsync(Guid id, Guid userId);

        /// <summary>
        /// Marks a notification as read
        /// </summary>
        /// <param name="id">The notification ID</param>
        /// <param name="userId">The user ID</param>
        /// <returns>The updated notification, or null if not found</returns>
        Task<object> MarkNotificationAsReadAsync(Guid id, Guid userId);

        /// <summary>
        /// Marks all notifications as read for a user
        /// </summary>
        /// <param name="userId">The user ID</param>
        /// <returns>A task representing the asynchronous operation</returns>
        Task MarkAllNotificationsAsReadAsync(Guid userId);

        /// <summary>
        /// Deletes a notification
        /// </summary>
        /// <param name="id">The notification ID</param>
        /// <param name="userId">The user ID</param>
        /// <returns>True if successful, false if not found</returns>
        Task<bool> DeleteNotificationAsync(Guid id, Guid userId);

        /// <summary>
        /// Gets unread notification count for a user
        /// </summary>
        /// <param name="userId">The user ID</param>
        /// <returns>The count of unread notifications</returns>
        Task<int> GetUnreadNotificationCountAsync(Guid userId);

        /// <summary>
        /// Creates a notification for a user
        /// </summary>
        /// <param name="userId">The user ID</param>
        /// <param name="title">The notification title</param>
        /// <param name="message">The notification message</param>
        /// <param name="type">The notification type (Info, Warning, Alert, etc.)</param>
        /// <param name="relatedEntityId">Optional related entity ID</param>
        /// <param name="relatedEntityType">Optional related entity type</param>
        /// <returns>The created notification</returns>
        Task<object> CreateNotificationAsync(
            Guid userId,
            string title,
            string message,
            string type,
            Guid? relatedEntityId = null,
            string relatedEntityType = null);

        /// <summary>
        /// Sends a notification to multiple users
        /// </summary>
        /// <param name="userIds">The list of user IDs</param>
        /// <param name="title">The notification title</param>
        /// <param name="message">The notification message</param>
        /// <param name="type">The notification type (Info, Warning, Alert, etc.)</param>
        /// <param name="relatedEntityId">Optional related entity ID</param>
        /// <param name="relatedEntityType">Optional related entity type</param>
        /// <returns>A task representing the asynchronous operation</returns>
        Task SendBulkNotificationsAsync(
            List<Guid> userIds,
            string title,
            string message,
            string type,
            Guid? relatedEntityId = null,
            string relatedEntityType = null);

        /// <summary>
        /// Updates notification preferences for a user
        /// </summary>
        /// <param name="userId">The user ID</param>
        /// <param name="preferences">The updated notification preferences</param>
        /// <returns>The updated preferences</returns>
        Task<object> UpdateNotificationPreferencesAsync(Guid userId, dynamic preferences);
    }
}