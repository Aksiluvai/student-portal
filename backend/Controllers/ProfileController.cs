using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend.Services;

namespace backend.Controllers;

public record ChangePasswordDto(string CurrentPassword, string NewPassword);

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly UserService _users;
    private readonly StudentService _students;

    public ProfileController(UserService users, StudentService students)
    {
        _users = users;
        _students = students;
    }

    // Login panna user oda details
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var id = User.FindFirst("sub")?.Value;
        if (id is null) return Unauthorized();

        var user = await _users.GetById(id);
        if (user is null) return NotFound();

        var student = await _students.GetByEmail(user.Email);

        return Ok(new
        {
            name = user.Name,
            email = user.Email,
            role = user.Role,
            department = student?.Department,
            year = student?.Year
        });
    }

    // Password maathu
    [HttpPut("password")]
    public async Task<IActionResult> ChangePassword(ChangePasswordDto dto)
    {
        var id = User.FindFirst("sub")?.Value;
        if (id is null) return Unauthorized();

        var user = await _users.GetById(id);
        if (user is null) return NotFound();

        if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
            return BadRequest(new { message = "Current password is wrong" });

        if (dto.NewPassword.Length < 6)
            return BadRequest(new { message = "New password must be at least 6 characters" });

        await _users.UpdatePassword(id, BCrypt.Net.BCrypt.HashPassword(dto.NewPassword));
        return Ok(new { message = "Password changed" });
    }
}