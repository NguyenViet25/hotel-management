namespace HotelManagement.Services.Admin.Dining.Dtos;
public record AssignWaiterRequest(Guid WaiterId, Guid SessionId);