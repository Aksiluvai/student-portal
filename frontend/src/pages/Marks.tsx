import { useEffect, useState } from "react";
import type { Mark } from "../types/mark";
import type { Student } from "../types/student";
import type { Course } from "../types/course";
import { getMarks, addMark, updateMark, deleteMark } from "../api/markApi";
import { getStudents } from "../api/studentApi";
import { getCourses } from "../api/courseApi";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { downloadCsv } from "../utils/exportCsv";

const empty: Mark = {
  studentName: "",
  studentEmail: "",
  courseTitle: "",
  exam: "",
  score: 0,
  maxScore: 100,
};

const getGrade = (score: number, max: number) => {
  const p = (score / max) * 100;
  if (p >= 90) return "A+";
  if (p >= 80) return "A";
  if (p >= 70) return "B";
  if (p >= 60) return "C";
  if (p >= 50) return "D";
  return "F";
};

const percentOf = (m: Mark) => (m.score / m.maxScore) * 100;

export default function Marks() {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";

  const [marks, setMarks] = useState<Mark[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [form, setForm] = useState<Mark>(empty);
  const [editId, setEditId] = useState<string | null>(null);

  // Search / filter / sort
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [sortBy, setSortBy] = useState("default");

  const load = () => getMarks().then(setMarks);

  useEffect(() => {
    load();
    if (isAdmin) {
      getStudents().then(setStudents);
      getCourses().then(setCourses);
    }
    // eslint-disable-next-line
  }, []);

  const handleStudentChange = (email: string) => {
    const s = students.find((x) => x.email === email);
    setForm({ ...form, studentEmail: email, studentName: s?.name ?? "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.studentEmail || !form.courseTitle) {
      alert("Please select a student and a course.");
      return;
    }
    try {
      if (editId) {
        await updateMark(editId, form);
        setEditId(null);
      } else {
        await addMark(form);
      }
      setForm(empty);
      load();
    } catch {
      alert("Failed. Please logout and login again as Admin.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this mark?")) return;
    await deleteMark(id);
    load();
  };

  // ---- Filtered + sorted list ----
  const courseOptions = Array.from(new Set(marks.map((m) => m.courseTitle)));

  const visible = marks
    .filter(
      (m) =>
        (courseFilter === "" || m.courseTitle === courseFilter) &&
        `${m.studentName} ${m.courseTitle} ${m.exam}`
          .toLowerCase()
          .includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "high") return percentOf(b) - percentOf(a);
      if (sortBy === "low") return percentOf(a) - percentOf(b);
      if (sortBy === "name") return a.studentName.localeCompare(b.studentName);
      return 0;
    });

  const handleExport = () => {
    const rows: (string | number)[][] = [
      ["Student", "Email", "Course", "Exam", "Score", "Max Score", "Percentage", "Grade"],
    ];
    visible.forEach((m) =>
      rows.push([
        m.studentName,
        m.studentEmail,
        m.courseTitle,
        m.exam,
        m.score,
        m.maxScore,
        Math.round(percentOf(m)) + "%",
        getGrade(m.score, m.maxScore),
      ])
    );
    downloadCsv("marks.csv", rows);
  };

  const average =
    marks.length === 0
      ? 0
      : Math.round(marks.reduce((sum, m) => sum + percentOf(m), 0) / marks.length);

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="stats">
          <div className="stat">
            <div className="num">{marks.length}</div>
            <div className="label">{isAdmin ? "Total Records" : "My Records"}</div>
          </div>
          <div className="stat">
            <div className="num">{average}%</div>
            <div className="label">Average Score</div>
          </div>
        </div>

        {isAdmin && (
          <div className="card">
            <h2 className="section-title">
              {editId ? "✏️ Edit Marks" : "➕ Add Marks"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <select
                  value={form.studentEmail}
                  onChange={(e) => handleStudentChange(e.target.value)}
                  required
                >
                  <option value="">Select Student</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.email}>
                      {s.name} ({s.email})
                    </option>
                  ))}
                </select>

                <select
                  value={form.courseTitle}
                  onChange={(e) =>
                    setForm({ ...form, courseTitle: e.target.value })
                  }
                  required
                >
                  <option value="">Select Course</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.title}>
                      {c.code} - {c.title}
                    </option>
                  ))}
                </select>

                <input
                  placeholder="Exam (e.g. Midterm)"
                  value={form.exam}
                  onChange={(e) => setForm({ ...form, exam: e.target.value })}
                  required
                />
                <input
                  placeholder="Score"
                  type="number"
                  min={0}
                  value={form.score}
                  onChange={(e) =>
                    setForm({ ...form, score: Number(e.target.value) })
                  }
                  required
                />
                <input
                  placeholder="Max Score"
                  type="number"
                  min={1}
                  value={form.maxScore}
                  onChange={(e) =>
                    setForm({ ...form, maxScore: Number(e.target.value) })
                  }
                  required
                />
              </div>
              <div className="form-actions">
                <button className="btn" type="submit">
                  {editId ? "Update Marks" : "Add Marks"}
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

        <h2 className="section-title">📝 {isAdmin ? "All Marks" : "My Marks"}</h2>

        <div className="filters">
          <input
            placeholder="🔍 Search student, course, exam..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
          >
            <option value="">All Courses</option>
            {courseOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="default">Sort: Default</option>
            <option value="high">Score: High to Low</option>
            <option value="low">Score: Low to High</option>
            <option value="name">Name: A to Z</option>
          </select>
          <button
            className="btn btn-small btn-green"
            onClick={handleExport}
            disabled={visible.length === 0}
          >
            ⬇ Export CSV
          </button>
        </div>

        {visible.length === 0 ? (
          <div className="card empty">
            {marks.length === 0 ? "No marks found" : "No results match your filters"}
          </div>
        ) : (
          <div className="card table-wrap">
            <table>
              <thead>
                <tr>
                  {isAdmin && <th>Student</th>}
                  <th>Course</th>
                  <th>Exam</th>
                  <th>Score</th>
                  <th>Grade</th>
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {visible.map((m) => (
                  <tr key={m.id}>
                    {isAdmin && <td>{m.studentName}</td>}
                    <td>{m.courseTitle}</td>
                    <td>{m.exam}</td>
                    <td>
                      {m.score} / {m.maxScore}
                    </td>
                    <td>
                      <span
                        className={
                          "grade " +
                          (getGrade(m.score, m.maxScore) === "F" ? "fail" : "pass")
                        }
                      >
                        {getGrade(m.score, m.maxScore)}
                      </span>
                    </td>
                    {isAdmin && (
                      <td>
                        <div className="card-actions">
                          <button
                            className="btn btn-small"
                            onClick={() => {
                              setEditId(m.id!);
                              setForm(m);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-danger btn-small"
                            onClick={() => handleDelete(m.id!)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}