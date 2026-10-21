using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend.Models;
using backend.Services;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class StudentsController : ControllerBase
{
    private readonly StudentService _service;
    public StudentsController(StudentService service) => _service = service;

    [HttpGet]
    public async Task<List<Student>> GetAll() => await _service.GetAll();

    [HttpGet("{id}")]
    public async Task<ActionResult<Student>> Get(string id)
    {
        var s = await _service.Get(id);
        return s is null ? NotFound() : s;
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create(Student s)
    {
        await _service.Create(s);
        return CreatedAtAction(nameof(Get), new { id = s.Id }, s);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(string id, Student s)
    {
        s.Id = id;
        await _service.Update(id, s);
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