using MongoDB.Driver;
using backend.Models;

namespace backend.Services;

public class UserService
{
    private readonly IMongoCollection<User> _users;

    public UserService(IConfiguration config)
    {
        var client = new MongoClient(config["MongoDb:ConnectionString"]);
        var db = client.GetDatabase(config["MongoDb:DatabaseName"]);
        _users = db.GetCollection<User>("users");
    }

    public async Task<User?> GetByEmail(string email) =>
        await _users.Find(u => u.Email == email).FirstOrDefaultAsync();

    public async Task<User?> GetById(string id) =>
        await _users.Find(u => u.Id == id).FirstOrDefaultAsync();

    public Task<long> Count() => _users.CountDocumentsAsync(_ => true);

    public Task Create(User u) => _users.InsertOneAsync(u);

    public Task UpdatePassword(string id, string passwordHash) =>
        _users.UpdateOneAsync(
            u => u.Id == id,
            Builders<User>.Update.Set(u => u.PasswordHash, passwordHash));
}