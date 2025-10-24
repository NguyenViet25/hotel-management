namespace HotelManagement.Domain.Enums
{
    public enum PaymentMethod
    {
        CreditCard = 1,
        DebitCard = 2,
        Cash = 3,
        BankTransfer = 4,
        MobilePayment = 5,
        OnlinePayment = 6,
        GiftCard = 7
    }
    
    public enum PaymentStatus
    {
        Pending = 1,
        Authorized = 2,
        Completed = 3,
        Failed = 4,
        Refunded = 5,
        PartiallyRefunded = 6,
        Voided = 7
    }
    
    public enum PaymentType
    {
        Deposit = 1,
        FullPayment = 2,
        PartialPayment = 3,
        Refund = 4,
        ExtraCharge = 5
    }
}