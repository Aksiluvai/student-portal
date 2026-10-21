using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend.Models;
using backend.Services;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AttendanceController : ControllerBase
{
    private readonly AttendanceService _service;
    public AttendanceController(AttendanceService service) => _service = service;

    // Admin = ellam, Student = avanga attendance mattum
    [HttpGet]
    public async Task<List<Attendance>> GetAll()
    {
        if (User.IsInRole("Admin"))
            return await _service.GetAll();

        var email = (User.FindFirst("email")?.Value ?? "").ToLower();
        return await _service.GetByEmail(email);
    }

    [HttpPost("bulk")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Save(List<Attendance> items)
    {
        if (items.Count == 0)
            return BadRequest(new { message = "No records" });

        foreach (var i in items)
        {
            i.Id = null;
            i.StudentEmail = i.StudentEmail.ToLower();
        }

        await _service.ReplaceForDate(items[0].Date, items);
        return Ok();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(string id)
    {
        await _service.Delete(id);
        return NoContent();
    }
}