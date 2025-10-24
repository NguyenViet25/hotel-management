using System;
using System.ComponentModel.DataAnnotations;

namespace HotelManagement.API.Models
{
    /// <summary>
    /// Request model for creating or updating a guest
    /// </summary>
    public class GuestRequest
    {
        /// <summary>
        /// The first name of the guest
        /// </summary>
        [Required]
        public string FirstName { get; set; }

        /// <summary>
        /// The last name of the guest
        /// </summary>
        [Required]
        public string LastName { get; set; }

        /// <summary>
        /// The email address of the guest
        /// </summary>
        [Required]
        [EmailAddress]
        public string Email { get; set; }

        /// <summary>
        /// The phone number of the guest
        /// </summary>
        [Required]
        public string Phone { get; set; }

        /// <summary>
        /// The address of the guest
        /// </summary>
        public string Address { get; set; }

        /// <summary>
        /// The city of the guest's address
        /// </summary>
        public string City { get; set; }

        /// <summary>
        /// The state/province of the guest's address
        /// </summary>
        public string State { get; set; }

        /// <summary>
        /// The country of the guest's address
        /// </summary>
        public string Country { get; set; }

        /// <summary>
        /// The postal code of the guest's address
        /// </summary>
        public string PostalCode { get; set; }

        /// <summary>
        /// The type of identification document (Passport, ID Card, Driver's License, etc.)
        /// </summary>
        public string IdType { get; set; }

        /// <summary>
        /// The identification document number
        /// </summary>
        public string IdNumber { get; set; }

        /// <summary>
        /// The date of birth of the guest
        /// </summary>
        public DateTime? DateOfBirth { get; set; }

        /// <summary>
        /// The nationality of the guest
        /// </summary>
        public string Nationality { get; set; }

        /// <summary>
        /// Additional notes about the guest
        /// </summary>
        public string Notes { get; set; }
    }
}