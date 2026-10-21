import { useEffect, useState } from "react";
import type { Course } from "../types/course";
import {
  getCourses,
  addCourse,
  updateCourse,
  deleteCourse,
} from "../api/courseApi";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

const empty: Course = { code: "", title: "", credits: 3 };

export default function Courses() {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";

  const [courses, setCourses] = useState<Course[]>([]);
  const [form, setForm] = useState<Course>(empty);
  const [editId, setEditId] = useState<string | null>(null);

  const load = () => getCourses().then(setCourses);

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateCourse(editId, form);
        setEditId(null);
      } else {
        await addCourse(form);
      }
      setForm(empty);
      load();
    } catch {
      alert("Failed. Please logout and login again as Admin.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    await deleteCourse(id);
    load();
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="stats">
          <div className="stat">
            <div className="num">{courses.length}</div>
            <div className="label">Total Courses</div>
          </div>
          <div className="stat">
            <div className="num">
              {courses.reduce((sum, c) => sum + c.credits, 0)}
            </div>
            <div className="label">Total Credits</div>
          </div>
        </div>

        {isAdmin && (
          <div className="card">
            <h2 className="section-title">
              {editId ? "✏️ Edit Course" : "➕ Add New Course"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <input
                  placeholder="Course Code (e.g. CS101)"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  required
                />
                <input
                  placeholder="Course Title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
                <input
                  placeholder="Credits"
                  type="number"
                  min={1}
                  max={10}
                  value={form.credits}
                  onChange={(e) =>
                    setForm({ ...form, credits: Number(e.target.value) })
                  }
                  required
                />
              </div>
              <div className="form-actions">
                <button className="btn" type="submit">
                  {editId ? "Update Course" : "Add Course"}
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

        <h2 className="section-title">📚 Courses List</h2>

        {courses.length === 0 ? (
          <div className="card empty">No courses found</div>
        ) : (
          <div className="grid">
            {courses.map((c) => (
              <div className="student-card" key={c.id}>
                <div className="avatar">📘</div>
                <h3>{c.title}</h3>
                <div className="tags">
                  <span className="tag">{c.code}</span>
                  <span className="tag">{c.credits} Credits</span>
                </div>
                {isAdmin && (
                  <div className="card-actions">
                    <button
                      className="btn btn-small"
                      onClick={() => {
                        setEditId(c.id!);
                        setForm(c);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-small"
                      onClick={() => handleDelete(c.id!)}
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