using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Repository.Common;

public class EfRepository<T> : IRepository<T> where T : class
{
    private readonly DbContext _db;
    public DbSet<T> Set => _db.Set<T>();

    public EfRepository(DbContext db)
    {
        _db = db;
    }

    public IQueryable<T> Query() => Set.AsQueryable();

    public async Task<T?> FindAsync(params object[] keyValues) => await Set.FindAsync(keyValues);

    public async Task AddAsync(T entity)
    {
        await Set.AddAsync(entity);
    }

    public Task UpdateAsync(T entity)
    {
        Set.Update(entity);
        return Task.CompletedTask;
    }

    public Task RemoveAsync(T entity)
    {
        Set.Remove(entity);
        return Task.CompletedTask;
    }

    public Task<int> SaveChangesAsync(CancellationToken ct = default) => _db.SaveChangesAsync(ct);
}