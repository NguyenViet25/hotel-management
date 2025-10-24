namespace HotelManagement.Domain.Enums
{
    public enum BookingStatus
    {
        Reserved = 1,
        Confirmed = 2,
        CheckedIn = 3,
        CheckedOut = 4,
        Cancelled = 5,
        NoShow = 6
    }
    
    public enum BookingSource
    {
        Direct = 1,
        Website = 2,
        Phone = 3,
        Email = 4,
        WalkIn = 5,
        TravelAgent = 6,
        OTA = 7 // Online Travel Agency
    }
}