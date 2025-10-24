namespace HotelManagement.Domain.Enums
{
    public enum MenuItemCategory
    {
        Appetizer = 1,
        Soup = 2,
        Salad = 3,
        MainCourse = 4,
        Dessert = 5,
        Beverage = 6,
        AlcoholicBeverage = 7,
        SideDish = 8,
        SpecialOffer = 9,
        KidsMenu = 10
    }
    
    public enum ReservationStatus
    {
        Pending = 1,
        Confirmed = 2,
        Seated = 3,
        Completed = 4,
        Cancelled = 5,
        NoShow = 6
    }
}