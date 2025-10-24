using HotelManagement.Domain.Entities;
using HotelManagement.Repositories.Interfaces;
using HotelManagement.Services.Interfaces;

namespace HotelManagement.Services.Services
{
    public class HotelPropertyService : IHotelPropertyService
    {
        private readonly IUnitOfWork _unitOfWork;

        public HotelPropertyService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<HotelProperty>> GetAllPropertiesAsync()
        {
            return await _unitOfWork.Repository<HotelProperty>().GetComplexAsync(
                includes: new List<System.Linq.Expressions.Expression<Func<HotelProperty, object>>> { p => p.Amenities },
                disableTracking: true);
        }

        public async Task<HotelProperty> GetPropertyByIdAsync(Guid id)
        {
            return await _unitOfWork.Repository<HotelProperty>().GetFirstOrDefaultAsync(
                predicate: p => p.Id == id,
                includes: new List<System.Linq.Expressions.Expression<Func<HotelProperty, object>>> { p => p.Amenities });
        }

        public async Task<bool> CreatePropertyAsync(HotelProperty property)
        {
            property.CreatedAt = DateTime.UtcNow;
            await _unitOfWork.Repository<HotelProperty>().AddAsync(property);
            return true;
        }

        public async Task<bool> UpdatePropertyAsync(HotelProperty property)
        {
            property.UpdatedAt = DateTime.UtcNow;
            await _unitOfWork.Repository<HotelProperty>().UpdateAsync(property);
            return true;
        }

        public async Task<bool> DeletePropertyAsync(Guid id)
        {
            var property = await _unitOfWork.Repository<HotelProperty>().GetByIdAsync(id);
            if (property == null)
            {
                return false;
            }

            await _unitOfWork.Repository<HotelProperty>().SoftDeleteAsync(property);
            return true;
        }

        public async Task<IEnumerable<HotelProperty>> SearchPropertiesAsync(string searchTerm)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
            {
                return await GetAllPropertiesAsync();
            }

            searchTerm = searchTerm.ToLower();

            return await _unitOfWork.Repository<HotelProperty>().GetComplexAsync(
                predicate: p => p.Name.ToLower().Contains(searchTerm) ||
                                p.City.ToLower().Contains(searchTerm) ||
                                p.Country.ToLower().Contains(searchTerm),
                includes: new List<System.Linq.Expressions.Expression<Func<HotelProperty, object>>> { p => p.Amenities },
                disableTracking: true);
        }

        public async Task<IEnumerable<HotelProperty>> GetPropertiesByLocationAsync(string city, string country)
        {
            return await _unitOfWork.Repository<HotelProperty>().GetComplexAsync(
                predicate: p => (string.IsNullOrEmpty(city) || p.City.ToLower() == city.ToLower()) &&
                                (string.IsNullOrEmpty(country) || p.Country.ToLower() == country.ToLower()),
                includes: new List<System.Linq.Expressions.Expression<Func<HotelProperty, object>>> { p => p.Amenities },
                disableTracking: true);
        }

        public async Task<bool> AddAmenityToPropertyAsync(Guid propertyId, string amenityName, string amenityDescription)
        {
            var property = await _unitOfWork.Repository<HotelProperty>().GetFirstOrDefaultAsync(
                predicate: p => p.Id == propertyId,
                includes: new List<System.Linq.Expressions.Expression<Func<HotelProperty, object>>> { p => p.Amenities });

            if (property == null)
            {
                return false;
            }

            // Check if amenity with the same name already exists for this property
            if (property.Amenities.Any(a => a.Name.ToLower() == amenityName.ToLower()))
            {
                return false;
            }

            var amenity = new PropertyAmenity
            {
                PropertyId = propertyId,
                Name = amenityName,
                Description = amenityDescription,
                CreatedAt = DateTime.UtcNow
            };

            await _unitOfWork.Repository<PropertyAmenity>().AddAsync(amenity);
            return true;
        }

        public async Task<bool> RemoveAmenityFromPropertyAsync(Guid propertyId, Guid amenityId)
        {
            var amenity = await _unitOfWork.Repository<PropertyAmenity>().GetFirstOrDefaultAsync(
                predicate: a => a.Id == amenityId && a.PropertyId == propertyId);

            if (amenity == null)
            {
                return false;
            }

            await _unitOfWork.Repository<PropertyAmenity>().SoftDeleteAsync(amenity);
            return true;
        }

        public async Task<IEnumerable<PropertyAmenity>> GetPropertyAmenitiesAsync(Guid propertyId)
        {
            return await _unitOfWork.Repository<PropertyAmenity>().GetComplexAsync(
                predicate: a => a.PropertyId == propertyId,
                disableTracking: true);
        }
    }
}