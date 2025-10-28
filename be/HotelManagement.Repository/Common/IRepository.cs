using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Repository.Common;

public interface IRepository<T> where T : class
{
    DbSet<T> Set { get; }
    IQueryable<T> Query();
    Task<T?> FindAsync(params object[] keyValues);
    Task AddAsync(T entity);
    Task UpdateAsync(T entity);
    Task RemoveAsync(T entity);
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}