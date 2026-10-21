using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend.Models;
using backend.Services;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MarksController : ControllerBase
{
    private readonly MarkService _service;
    public MarksController(MarkService service) => _service = service;

    // Admin = ellam, Student = avanga marks mattum
    [HttpGet]
    public async Task<List<Mark>> GetAll()
    {
        if (User.IsInRole("Admin"))
            return await _service.GetAll();

        var email = (User.FindFirst("email")?.Value ?? "").ToLower();
        return await _service.GetByEmail(email);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create(Mark m)
    {
        m.StudentEmail = m.StudentEmail.ToLower();
        await _service.Create(m);
        return Ok(m);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(string id, Mark m)
    {
        m.Id = id;
        m.StudentEmail = m.StudentEmail.ToLower();
        await _service.Update(id, m);
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