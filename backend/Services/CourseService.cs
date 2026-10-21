using MongoDB.Driver;
using backend.Models;

namespace backend.Services;

public class CourseService
{
    private readonly IMongoCollection<Course> _courses;

    public CourseService(IConfiguration config)
    {
        var client = new MongoClient(config["MongoDb:ConnectionString"]);
        var db = client.GetDatabase(config["MongoDb:DatabaseName"]);
        _courses = db.GetCollection<Course>("courses");
    }

    public Task<List<Course>> GetAll() => _courses.Find(_ => true).ToListAsync();
    public Task Create(Course c) => _courses.InsertOneAsync(c);
    public Task Update(string id, Course c) => _courses.ReplaceOneAsync(x => x.Id == id, c);
    public Task Delete(string id) => _courses.DeleteOneAsync(x => x.Id == id);
}