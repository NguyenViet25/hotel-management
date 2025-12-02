namespace HotelManagement.Domain;

public enum UserRole
{
    Admin = 1,
    Manager = 2,
    FrontDesk = 3,
    Housekeeper = 4,
    Kitchen = 5,
    Waiter = 6,
    Guest = 7
}

public enum RoomStatus
{
    Available = 0,
    Occupied = 1,
    Cleaning = 2,
    OutOfService = 3,
    Dirty = 4,
    Clean = 5,
    Maintenance = 6,
}

public enum BookingRoomStatus
{
    Pending = 0,
    Confirmed = 1,
    CheckedIn = 2,
    CheckedOut = 3,
    Cancelled = 4
}

public enum BookingStatus
{
    Pending = 0,
    Confirmed = 1,
    Completed = 3,
    Cancelled = 4
}

public enum OrderStatus
{
    Draft = 0,
    InProgress = 1,
    Completed = 2,
    Cancelled = 3
}

public enum OrderItemStatus
{
    Pending = 0,
    Cooking = 1,
    Served = 2,
    Voided = 3,
    Ready = 4
}

public enum InvoiceStatus
{
    Draft = 0,
    Issued = 1,
    Paid = 2,
    Cancelled = 3
}

public enum PaymentStatus
{
    Pending = 0,
    Completed = 1,
    Refunded = 2,
    Failed = 3
}

public enum PaymentMethod
{
    Cash = 0,
    CreditCard = 1,
    DebitCard = 2,
    BankTransfer = 3,
    MobilePayment = 4
}



public enum PaymentType
{
    Cash = 0,
    Card = 1,
    Transfer = 2,
    EWallet = 3,
    Refund = 4,
}

public enum DiningSessionStatus
{
    Open = 0,
    Closed = 1
}

public enum CallResult
{
    NotAnswered = 0,
    Confirmed = 1,
    Cancelled = 2,
    Reschedule = 3
}

public enum SurchargeType
{
    EarlyCheckIn = 0,
    LateCheckOut = 1,
    ExtraGuest = 2
}