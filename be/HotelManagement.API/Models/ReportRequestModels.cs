using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace HotelManagement.API.Models
{
    /// <summary>
    /// Request model for scheduling a report
    /// </summary>
    public class ReportScheduleRequest
    {
        /// <summary>
        /// The type of report to schedule (Revenue, Occupancy, FBSales, etc.)
        /// </summary>
        [Required]
        public string ReportType { get; set; }

        /// <summary>
        /// The ID of the property for which to generate the report
        /// </summary>
        [Required]
        public Guid PropertyId { get; set; }

        /// <summary>
        /// The frequency of the report (Daily, Weekly, Monthly)
        /// </summary>
        [Required]
        public string Frequency { get; set; }

        /// <summary>
        /// List of email addresses to receive the report
        /// </summary>
        [Required]
        public List<string> Recipients { get; set; }

        /// <summary>
        /// The format of the report (PDF, Excel, CSV)
        /// </summary>
        [Required]
        public string Format { get; set; }

        /// <summary>
        /// The date from which to start sending the report
        /// </summary>
        [Required]
        public DateTime StartDate { get; set; }
    }
}