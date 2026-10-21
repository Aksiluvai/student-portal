using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace backend.Models;

public class Mark
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }
    public string StudentName { get; set; } = "";
    public string StudentEmail { get; set; } = "";
    public string CourseTitle { get; set; } = "";
    public string Exam { get; set; } = "";
    public int Score { get; set; }
    public int MaxScore { get; set; } = 100;
}