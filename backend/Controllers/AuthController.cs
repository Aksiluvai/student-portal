using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using backend.Models;
using backend.Services;

namespace backend.Controllers;

public record RegisterDto(string Name, string Email, string Password);
public record LoginDto(string Email, string Password);

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserService _users;
    private readonly StudentService _students;
    private readonly IConfiguration _config;

    public AuthController(UserService users, StudentService students, IConfiguration config)
    {
        _users = users;
        _students = students;
        _config = config;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        var email = dto.Email.Trim().ToLower();

        if (await _users.GetByEmail(email) is not null)
            return BadRequest(new { message = "Email already exists" });

        // Mudhal user Admin, matravanga Student
        var role = await _users.Count() == 0 ? "Admin" : "Student";

        var user = new User
        {
            Name = dto.Name,
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = role
        };
        await _users.Create(user);

        // Student role na, students collection la um record create pannum
        if (role == "Student")
        {
            await _students.Create(new Student
            {
                Name = dto.Name,
                Email = email,
                Department = "Not set",
                Year = 1
            });
        }

        return Ok(new { token = CreateToken(user), name = user.Name, role = user.Role });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var user = await _users.GetByEmail(dto.Email.Trim().ToLower());
        if (user is null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return Unauthorized(new { message = "Invalid email or password" });

        return Ok(new { token = CreateToken(user), name = user.Name, role = user.Role });
    }

    private string CreateToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim("sub", user.Id!),
            new Claim("name", user.Name),
            new Claim("email", user.Email),
            new Claim("role", user.Role)
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}