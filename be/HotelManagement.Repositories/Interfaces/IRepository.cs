using HotelManagement.Domain.Common;
using System.Linq.Expressions;

namespace HotelManagement.Repositories.Interfaces
{
    public interface IRepository<T> where T : BaseEntity
    {
        // Get methods
        Task<T> GetByIdAsync(Guid id);
        Task<IReadOnlyList<T>> GetAllAsync();
        Task<IReadOnlyList<T>> GetAsync(Expression<Func<T, bool>> predicate);
        Task<IReadOnlyList<T>> GetEasyAsync(
            Expression<Func<T, bool>> predicate = null!,
            Func<IQueryable<T>, IOrderedQueryable<T>> orderBy = null!,
            string includeString = null!,
            bool disableTracking = true);
        Task<IReadOnlyList<T>> GetComplexAsync(
            Expression<Func<T, bool>> predicate = null!,
            Func<IQueryable<T>, IOrderedQueryable<T>> orderBy = null!,
            List<Expression<Func<T, object>>> includes = null!,
            bool disableTracking = true);
        Task<T> GetFirstOrDefaultAsync(
            Expression<Func<T, bool>> predicate = null!,
            Func<IQueryable<T>, IOrderedQueryable<T>> orderBy = null!,
            List<Expression<Func<T, object>>> includes = null!,
            bool disableTracking = true);
        Task<int> CountAsync(Expression<Func<T, bool>> predicate = null!);
        Task<bool> AnyAsync(Expression<Func<T, bool>> predicate = null!);

        // Add methods
        Task<T> AddAsync(T entity);
        Task<IEnumerable<T>> AddRangeAsync(IEnumerable<T> entities);

        // Update methods
        Task UpdateAsync(T entity);
        Task UpdateRangeAsync(IEnumerable<T> entities);

        // Delete methods
        Task DeleteAsync(T entity);
        Task DeleteRangeAsync(IEnumerable<T> entities);
        Task SoftDeleteAsync(T entity);
        Task SoftDeleteRangeAsync(IEnumerable<T> entities);
    }
}