namespace HotelManagement.Domain.Enums
{
    public enum RatePlanType
    {
        Standard = 1,
        Seasonal = 2,
        Package = 3,
        Promotional = 4,
        Corporate = 5
    }
    
    public enum CancellationPolicy
    {
        FreeCancellation = 1,
        NonRefundable = 2,
        PartialRefund = 3
    }
}