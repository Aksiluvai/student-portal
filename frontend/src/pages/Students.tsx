import { useEffect, useState } from "react";
import type { Student } from "../types/student";
import {
  getStudents,
  addStudent,
  updateStudent,
  deleteStudent,
} from "../api/studentApi";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

const empty: Student = { name: "", email: "", department: "", year: 1 };

export default function Students() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "Admin";

  const [students, setStudents] = useState<Student[]>([]);
  const [form, setForm] = useState<Student>(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const load = () =>
    getStudents()
      .then(setStudents)
      .catch(() => logout());

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, []);

  const showError = (err: any) => {
    const status = err?.response?.status;
    alert(
      status === 403
        ? "You don't have permission. Please logout and login again as Admin."
        : status === 401
        ? "Session expired. Please login again."
        : "Failed: " + (err?.message || "Unknown error")
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateStudent(editId, form);
        setEditId(null);
      } else {
        await addStudent(form);
      }
      setForm(empty);
      load();
    } catch (err) {
      showError(err);
    }
  };

  const handleEdit = (s: Student) => {
    setEditId(s.id!);
    setForm(s);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this student?")) return;
    try {
      await deleteStudent(id);
      load();
    } catch (err) {
      showError(err);
    }
  };

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.department.toLowerCase().includes(search.toLowerCase())
  );

  const departments = new Set(students.map((s) => s.department)).size;

  return (
    <>
      <Navbar />

      <div className="container">
        <div className="stats">
          <div className="stat">
            <div className="num">{students.length}</div>
            <div className="label">Total Students</div>
          </div>
          <div className="stat">
            <div className="num">{departments}</div>
            <div className="label">Departments</div>
          </div>
          <div className="stat">
            <div className="num">{user?.role}</div>
            <div className="label">Your Role</div>
          </div>
        </div>

        {isAdmin && (
          <div className="card">
            <h2 className="section-title">
              {editId ? "✏️ Edit Student" : "➕ Add New Student"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <input
                  placeholder="Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
                <input
                  placeholder="Email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
                <input
                  placeholder="Department"
                  value={form.department}
                  onChange={(e) =>
                    setForm({ ...form, department: e.target.value })
                  }
                  required
                />
                <input
                  placeholder="Year"
                  type="number"
                  min={1}
                  max={4}
                  value={form.year}
                  onChange={(e) =>
                    setForm({ ...form, year: Number(e.target.value) })
                  }
                  required
                />
              </div>
              <div className="form-actions">
                <button className="btn" type="submit">
                  {editId ? "Update Student" : "Add Student"}
                </button>
                {editId && (
                  <button
                    className="btn btn-gray"
                    type="button"
                    onClick={() => {
                      setEditId(null);
                      setForm(empty);
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        <div className="toolbar">
          <h2 className="section-title">📋 Students List</h2>
          <input
            className="search"
            placeholder="🔍 Search by name or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filtered.length === 0 ? (
          <div className="card empty">No students found</div>
        ) : (
          <div className="grid">
            {filtered.map((s) => (
              <div className="student-card" key={s.id}>
                <div className="avatar">{s.name.charAt(0).toUpperCase()}</div>
                <h3>{s.name}</h3>
                <p className="email">{s.email}</p>
                <div className="tags">
                  <span className="tag">{s.department}</span>
                  <span className="tag">Year {s.year}</span>
                </div>
                {isAdmin && (
                  <div className="card-actions">
                    <button
                      className="btn btn-small"
                      onClick={() => handleEdit(s)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-small"
                      onClick={() => handleDelete(s.id!)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}