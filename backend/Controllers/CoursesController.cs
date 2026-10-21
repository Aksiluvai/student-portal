using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend.Models;
using backend.Services;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CoursesController : ControllerBase
{
    private readonly CourseService _service;
    public CoursesController(CourseService service) => _service = service;

    [HttpGet]
    public async Task<List<Course>> GetAll() => await _service.GetAll();

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create(Course c)
    {
        await _service.Create(c);
        return Ok(c);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(string id, Course c)
    {
        c.Id = id;
        await _service.Update(id, c);
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(string id)
    {
        await _service.Delete(id);
        return NoContent();
    }
}