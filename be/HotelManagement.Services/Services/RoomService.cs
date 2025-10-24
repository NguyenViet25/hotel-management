using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HotelManagement.Domain.Entities;
using HotelManagement.Domain.Enums;
using HotelManagement.Repositories.Interfaces;
using HotelManagement.Services.Interfaces;

namespace HotelManagement.Services.Services
{
    public class RoomService : IRoomService
    {
        private readonly IUnitOfWork _unitOfWork;

        public RoomService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<Room>> GetAllRoomsAsync()
        {
            return await _unitOfWork.Repository<Room>().GetComplexAsync(
                includes: new List<System.Linq.Expressions.Expression<Func<Room, object>>> { r => r.RoomType, r => r.Property },
                disableTracking: true);
        }

        public async Task<Room> GetRoomByIdAsync(Guid id)
        {
            return await _unitOfWork.Repository<Room>().GetFirstOrDefaultAsync(
                predicate: r => r.Id == id,
                includes: new List<System.Linq.Expressions.Expression<Func<Room, object>>> { r => r.RoomType, r => r.Property });
        }

        public async Task<IEnumerable<Room>> GetRoomsByPropertyIdAsync(Guid propertyId)
        {
            return await _unitOfWork.Repository<Room>().GetComplexAsync(
                predicate: r => r.PropertyId == propertyId,
                includes: new List<System.Linq.Expressions.Expression<Func<Room, object>>> { r => r.RoomType },
                disableTracking: true);
        }

        public async Task<IEnumerable<Room>> GetAvailableRoomsAsync(Guid propertyId, DateTime checkIn, DateTime checkOut)
        {
            // Get all rooms for the property
            var rooms = await _unitOfWork.Repository<Room>().GetComplexAsync(
                predicate: r => r.PropertyId == propertyId && r.Status == RoomStatus.Available,
                includes: new List<System.Linq.Expressions.Expression<Func<Room, object>>> { r => r.RoomType },
                disableTracking: true);

            // Get all bookings that overlap with the requested dates
            var bookings = await _unitOfWork.Repository<Booking>().GetComplexAsync(
                predicate: b => b.CheckInDate < checkOut && b.CheckOutDate > checkIn && 
                                 (b.Status == BookingStatus.Confirmed || b.Status == BookingStatus.CheckedIn),
                disableTracking: true);

            // Get the room IDs that are booked during the requested period
            var bookedRoomIds = bookings.Select(b => b.RoomId).ToList();

            // Filter out the booked rooms
            return rooms.Where(r => !bookedRoomIds.Contains(r.Id)).ToList();
        }

        public async Task<bool> CreateRoomAsync(Room room)
        {
            room.CreatedAt = DateTime.UtcNow;
            await _unitOfWork.Repository<Room>().AddAsync(room);
            return true;
        }

        public async Task<bool> UpdateRoomAsync(Room room)
        {
            room.UpdatedAt = DateTime.UtcNow;
            await _unitOfWork.Repository<Room>().UpdateAsync(room);
            return true;
        }

        public async Task<bool> DeleteRoomAsync(Guid id)
        {
            var room = await _unitOfWork.Repository<Room>().GetByIdAsync(id);
            if (room == null)
            {
                return false;
            }

            await _unitOfWork.Repository<Room>().SoftDeleteAsync(room);
            return true;
        }

        public async Task<bool> UpdateRoomStatusAsync(Guid id, RoomStatus status)
        {
            var room = await _unitOfWork.Repository<Room>().GetByIdAsync(id);
            if (room == null)
            {
                return false;
            }

            room.Status = status;
            room.UpdatedAt = DateTime.UtcNow;
            await _unitOfWork.Repository<Room>().UpdateAsync(room);
            return true;
        }

        public async Task<bool> AddRoomTypeAsync(RoomType roomType)
        {
            roomType.CreatedAt = DateTime.UtcNow;
            await _unitOfWork.Repository<RoomType>().AddAsync(roomType);
            return true;
        }

        public async Task<bool> UpdateRoomTypeAsync(RoomType roomType)
        {
            roomType.UpdatedAt = DateTime.UtcNow;
            await _unitOfWork.Repository<RoomType>().UpdateAsync(roomType);
            return true;
        }

        public async Task<bool> DeleteRoomTypeAsync(Guid id)
        {
            // Check if there are any rooms using this room type
            var roomsWithType = await _unitOfWork.Repository<Room>().GetComplexAsync(
                predicate: r => r.RoomTypeId == id,
                disableTracking: true);

            if (roomsWithType.Any())
            {
                return false; // Cannot delete a room type that is in use
            }

            var roomType = await _unitOfWork.Repository<RoomType>().GetByIdAsync(id);
            if (roomType == null)
            {
                return false;
            }

            await _unitOfWork.Repository<RoomType>().SoftDeleteAsync(roomType);
            return true;
        }

        public async Task<IEnumerable<RoomType>> GetAllRoomTypesAsync()
        {
            return await _unitOfWork.Repository<RoomType>().GetComplexAsync(disableTracking: true);
        }

        public async Task<RoomType> GetRoomTypeByIdAsync(Guid id)
        {
            return await _unitOfWork.Repository<RoomType>().GetByIdAsync(id);
        }
    }
}