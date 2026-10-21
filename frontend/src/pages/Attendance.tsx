import { useEffect, useState } from "react";
import type { AttendanceRecord } from "../types/attendance";
import type { Student } from "../types/student";
import {
  getAttendance,
  saveAttendance,
  deleteAttendance,
} from "../api/attendanceApi";
import { getStudents } from "../api/studentApi";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { downloadCsv } from "../utils/exportCsv";

type Status = "Present" | "Absent";

const percent = (present: number, total: number) =>
  total === 0 ? 0 : Math.round((present / total) * 100);

export default function Attendance() {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [date, setDate] = useState(new Date().toLocaleDateString("en-CA"));
  const [statusMap, setStatusMap] = useState<Record<string, Status>>({});

  // Search / filter
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [filterDate, setFilterDate] = useState("");

  const load = () => getAttendance().then(setRecords);

  useEffect(() => {
    load();
    if (isAdmin) getStudents().then(setStudents);
    // eslint-disable-next-line
  }, []);

  // Date / records maarumbodhu, andha date ku already save panna status ah prefill pannum
  useEffect(() => {
    const map: Record<string, Status> = {};
    students.forEach((s) => {
      const found = records.find(
        (r) => r.date === date && r.studentEmail === s.email.toLowerCase()
      );
      map[s.email] = found ? found.status : "Present";
    });
    setStatusMap(map);
  }, [students, records, date]);

  const handleSave = async () => {
    if (students.length === 0) {
      alert("No students found. Please add students first.");
      return;
    }
    const items: AttendanceRecord[] = students.map((s) => ({
      studentName: s.name,
      studentEmail: s.email,
      date,
      status: statusMap[s.email] ?? "Present",
    }));
    try {
      await saveAttendance(items);
      alert("Attendance saved for " + date);
      load();
    } catch {
      alert("Failed. Please logout and login again as Admin.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    await deleteAttendance(id);
    load();
  };

  const totalPresent = records.filter((r) => r.status === "Present").length;
  const overall = percent(totalPresent, records.length);
  const daysRecorded = new Set(records.map((r) => r.date)).size;

  // Per student summary (Admin ku)
  const summary = Object.values(
    records.reduce<
      Record<string, { name: string; present: number; total: number }>
    >((acc, r) => {
      const key = r.studentEmail;
      if (!acc[key]) acc[key] = { name: r.studentName, present: 0, total: 0 };
      acc[key].total += 1;
      if (r.status === "Present") acc[key].present += 1;
      return acc;
    }, {})
  );

  // ---- Filtered records (newest first) ----
  const visible = [...records]
    .filter(
      (r) =>
        (statusFilter === "" || r.status === statusFilter) &&
        (filterDate === "" || r.date === filterDate) &&
        r.studentName.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => b.date.localeCompare(a.date));

  const handleExport = () => {
    const rows: (string | number)[][] = [["Date", "Student", "Email", "Status"]];
    visible.forEach((r) =>
      rows.push([r.date, r.studentName, r.studentEmail, r.status])
    );
    downloadCsv("attendance.csv", rows);
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
    setFilterDate("");
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="stats">
          <div className="stat">
            <div className="num">{overall}%</div>
            <div className="label">
              {isAdmin ? "Overall Attendance" : "My Attendance"}
            </div>
          </div>
          <div className="stat">
            <div className="num">{isAdmin ? daysRecorded : records.length}</div>
            <div className="label">Days Recorded</div>
          </div>
          <div className="stat">
            <div className="num">{totalPresent}</div>
            <div className="label">Present Count</div>
          </div>
        </div>

        {isAdmin && (
          <div className="card">
            <h2 className="section-title">✅ Mark Attendance</h2>

            <div className="date-row">
              <label>Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            {students.length === 0 ? (
              <p className="muted-text">No students found.</p>
            ) : (
              <div className="mark-list">
                {students.map((s) => (
                  <div className="mark-row" key={s.id}>
                    <div>
                      <strong>{s.name}</strong>
                      <div className="muted-text">{s.email}</div>
                    </div>
                    <div className="toggle">
                      <button
                        type="button"
                        className={
                          "status-btn present " +
                          (statusMap[s.email] === "Present" ? "active" : "")
                        }
                        onClick={() =>
                          setStatusMap({ ...statusMap, [s.email]: "Present" })
                        }
                      >
                        Present
                      </button>
                      <button
                        type="button"
                        className={
                          "status-btn absent " +
                          (statusMap[s.email] === "Absent" ? "active" : "")
                        }
                        onClick={() =>
                          setStatusMap({ ...statusMap, [s.email]: "Absent" })
                        }
                      >
                        Absent
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="form-actions">
              <button className="btn" onClick={handleSave}>
                Save Attendance
              </button>
            </div>
          </div>
        )}

        {isAdmin && summary.length > 0 && (
          <>
            <h2 className="section-title">📊 Student Summary</h2>
            <div className="card table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Present</th>
                    <th>Total Days</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.map((s) => {
                    const p = percent(s.present, s.total);
                    return (
                      <tr key={s.name}>
                        <td>{s.name}</td>
                        <td>{s.present}</td>
                        <td>{s.total}</td>
                        <td>
                          <span className={"grade " + (p >= 75 ? "pass" : "fail")}>
                            {p}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        <h2 className="section-title">
          🗓️ {isAdmin ? "All Records" : "My Records"}
        </h2>

        <div className="filters">
          {isAdmin && (
            <input
              placeholder="🔍 Search student..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          )}
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
          </select>
          <button className="btn btn-small btn-gray" onClick={clearFilters}>
            Clear
          </button>
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
            {records.length === 0
              ? "No attendance records found"
              : "No results match your filters"}
          </div>
        ) : (
          <div className="card table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  {isAdmin && <th>Student</th>}
                  <th>Status</th>
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {visible.map((r) => (
                  <tr key={r.id}>
                    <td>{r.date}</td>
                    {isAdmin && <td>{r.studentName}</td>}
                    <td>
                      <span
                        className={
                          "grade " + (r.status === "Present" ? "pass" : "fail")
                        }
                      >
                        {r.status}
                      </span>
                    </td>
                    {isAdmin && (
                      <td>
                        <button
                          className="btn btn-danger btn-small"
                          onClick={() => handleDelete(r.id!)}
                        >
                          Delete
                        </button>
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