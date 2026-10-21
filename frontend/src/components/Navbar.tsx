import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <div className="navbar">
      <h1>🎓 Student Portal</h1>

      <div className="nav-links">
        <NavLink to="/" end>Dashboard</NavLink>
        <NavLink to="/students">Students</NavLink>
        <NavLink to="/courses">Courses</NavLink>
        <NavLink to="/marks">Marks</NavLink>
        <NavLink to="/attendance">Attendance</NavLink>
      </div>

      <div className="nav-right">
        <Link to="/profile" className="profile-link" title="My Profile">
          👋 {user?.name}
        </Link>
        <span className="badge">{user?.role}</span>
        <button className="btn btn-light btn-small" onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  );
}