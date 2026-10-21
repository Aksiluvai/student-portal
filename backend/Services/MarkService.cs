using MongoDB.Driver;
using backend.Models;

namespace backend.Services;

public class MarkService
{
    private readonly IMongoCollection<Mark> _marks;

    public MarkService(IConfiguration config)
    {
        var client = new MongoClient(config["MongoDb:ConnectionString"]);
        var db = client.GetDatabase(config["MongoDb:DatabaseName"]);
        _marks = db.GetCollection<Mark>("marks");
    }

    public Task<List<Mark>> GetAll() => _marks.Find(_ => true).ToListAsync();

    public Task<List<Mark>> GetByEmail(string email) =>
        _marks.Find(m => m.StudentEmail == email).ToListAsync();

    public Task Create(Mark m) => _marks.InsertOneAsync(m);
    public Task Update(string id, Mark m) => _marks.ReplaceOneAsync(x => x.Id == id, m);
    public Task Delete(string id) => _marks.DeleteOneAsync(x => x.Id == id);
}