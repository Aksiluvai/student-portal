using MongoDB.Driver;
using backend.Models;

namespace backend.Services;

public class StudentService
{
    private readonly IMongoCollection<Student> _students;

    public StudentService(IConfiguration config)
    {
        var client = new MongoClient(config["MongoDb:ConnectionString"]);
        var db = client.GetDatabase(config["MongoDb:DatabaseName"]);
        _students = db.GetCollection<Student>("students");
    }

    public Task<List<Student>> GetAll() => _students.Find(_ => true).ToListAsync();
    public Task<Student?> Get(string id) => _students.Find(s => s.Id == id).FirstOrDefaultAsync()!;
    public Task<Student?> GetByEmail(string email) => _students.Find(s => s.Email == email).FirstOrDefaultAsync()!;
    public Task Create(Student s) => _students.InsertOneAsync(s);
    public Task Update(string id, Student s) => _students.ReplaceOneAsync(x => x.Id == id, s);
    public Task Delete(string id) => _students.DeleteOneAsync(x => x.Id == id);
}