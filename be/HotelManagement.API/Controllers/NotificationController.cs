using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HotelManagement.Services.Interfaces;
using HotelManagement.API.Models;

namespace HotelManagement.API.Controllers
{
    /// <summary>
    /// Controller for managing notifications
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class NotificationController : ControllerBase
    {
        private readonly INotificationService _notificationService;

        public NotificationController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        /// <summary>
        /// Gets all notifications for the current user
        /// </summary>
        /// <returns>A list of notifications</returns>
        [HttpGet]
        public async Task<ActionResult<object>> GetUserNotifications()
        {
            var userId = User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
            {
                return Unauthorized();
            }

            var notifications = await _notificationService.GetUserNotificationsAsync(userGuid);
            return Ok(notifications);
        }

        /// <summary>
        /// Gets a notification by ID
        /// </summary>
        /// <param name="id">The notification ID</param>
        /// <returns>The notification if found, or NotFound if not found</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetNotificationById(Guid id)
        {
            var userId = User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
            {
                return Unauthorized();
            }

            var notification = await _notificationService.GetNotificationByIdAsync(id, userGuid);
            if (notification == null)
            {
                return NotFound();
            }

            return Ok(notification);
        }

        /// <summary>
        /// Marks a notification as read
        /// </summary>
        /// <param name="id">The notification ID</param>
        /// <returns>The updated notification</returns>
        [HttpPut("{id}/read")]
        public async Task<ActionResult<object>> MarkNotificationAsRead(Guid id)
        {
            var userId = User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
            {
                return Unauthorized();
            }

            var notification = await _notificationService.MarkNotificationAsReadAsync(id, userGuid);
            if (notification == null)
            {
                return NotFound();
            }

            return Ok(notification);
        }

        /// <summary>
        /// Marks all notifications as read for the current user
        /// </summary>
        /// <returns>Success status</returns>
        [HttpPut("mark-all-read")]
        public async Task<ActionResult> MarkAllNotificationsAsRead()
        {
            var userId = User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
            {
                return Unauthorized();
            }

            await _notificationService.MarkAllNotificationsAsReadAsync(userGuid);
            return Ok(new { success = true });
        }

        /// <summary>
        /// Deletes a notification
        /// </summary>
        /// <param name="id">The notification ID</param>
        /// <returns>Success status</returns>
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteNotification(Guid id)
        {
            var userId = User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
            {
                return Unauthorized();
            }

            var result = await _notificationService.DeleteNotificationAsync(id, userGuid);
            if (!result)
            {
                return NotFound();
            }

            return Ok(new { success = true });
        }

        /// <summary>
        /// Gets unread notification count for the current user
        /// </summary>
        /// <returns>The count of unread notifications</returns>
        [HttpGet("unread-count")]
        public async Task<ActionResult<object>> GetUnreadNotificationCount()
        {
            var userId = User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
            {
                return Unauthorized();
            }

            var count = await _notificationService.GetUnreadNotificationCountAsync(userGuid);
            return Ok(new { count });
        }

        /// <summary>
        /// Creates a notification for a user (Admin only)
        /// </summary>
        /// <param name="request">The notification details</param>
        /// <returns>The created notification</returns>
        [HttpPost]
        [Authorize(Roles = "Administrator,PropertyManager")]
        public async Task<ActionResult<object>> CreateNotification([FromBody] dynamic request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var notification = await _notificationService.CreateNotificationAsync(
                request.UserId,
                request.Title,
                request.Message,
                request.Type,
                request.RelatedEntityId,
                request.RelatedEntityType);

            return CreatedAtAction(nameof(GetNotificationById), new { id = notification.Id }, notification);
        }

        /// <summary>
        /// Sends a notification to multiple users (Admin only)
        /// </summary>
        /// <param name="request">The bulk notification details</param>
        /// <returns>Success status</returns>
        [HttpPost("bulk")]
        [Authorize(Roles = "Administrator,PropertyManager")]
        public async Task<ActionResult> SendBulkNotifications([FromBody] BulkNotificationRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            await _notificationService.SendBulkNotificationsAsync(
                request.UserIds,
                request.Title,
                request.Message,
                request.Type,
                request.RelatedEntityId,
                request.RelatedEntityType);

            return Ok(new { success = true });
        }

        /// <summary>
        /// Updates notification preferences for the current user
        /// </summary>
        /// <param name="preferences">The updated notification preferences</param>
        /// <returns>The updated preferences</returns>
        [HttpPut("preferences")]
        public async Task<ActionResult<object>> UpdateNotificationPreferences([FromBody] NotificationPreferencesRequest preferences)
        {
            var userId = User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
            {
                return Unauthorized();
            }

            var updatedPreferences = await _notificationService.UpdateNotificationPreferencesAsync(userGuid, preferences);
            return Ok(updatedPreferences);
        }
    }
}