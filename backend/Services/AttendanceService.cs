using MongoDB.Driver;
using backend.Models;

namespace backend.Services;

public class AttendanceService
{
    private readonly IMongoCollection<Attendance> _items;

    public AttendanceService(IConfiguration config)
    {
        var client = new MongoClient(config["MongoDb:ConnectionString"]);
        var db = client.GetDatabase(config["MongoDb:DatabaseName"]);
        _items = db.GetCollection<Attendance>("attendance");
    }

    public Task<List<Attendance>> GetAll() => _items.Find(_ => true).ToListAsync();

    public Task<List<Attendance>> GetByEmail(string email) =>
        _items.Find(a => a.StudentEmail == email).ToListAsync();

    // Oru date ku pazhaya records delete panni, puthusa save pannum
    public async Task ReplaceForDate(string date, List<Attendance> items)
    {
        await _items.DeleteManyAsync(a => a.Date == date);
        await _items.InsertManyAsync(items);
    }

    public Task Delete(string id) => _items.DeleteOneAsync(a => a.Id == id);
}