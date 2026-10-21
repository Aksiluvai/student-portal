import { useEffect, useState } from "react";
import type { Student } from "../types/student";
import type { Course } from "../types/course";
import type { Mark } from "../types/mark";
import type { AttendanceRecord } from "../types/attendance";
import { getStudents } from "../api/studentApi";
import { getCourses } from "../api/courseApi";
import { getMarks } from "../api/markApi";
import { getAttendance } from "../api/attendanceApi";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

interface BarItem {
  label: string;
  value: number;
}

function BarChart({
  data,
  max,
  suffix = "",
}: {
  data: BarItem[];
  max: number;
  suffix?: string;
}) {
  if (data.length === 0) return <p className="muted-text">No data yet</p>;
  return (
    <div className="bars">
      {data.map((d) => (
        <div className="bar-row" key={d.label}>
          <div className="bar-label">{d.label}</div>
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{ width: `${Math.min((d.value / max) * 100, 100)}%` }}
            />
          </div>
          <div className="bar-value">
            {d.value}
            {suffix}
          </div>
        </div>
      ))}
    </div>
  );
}

function Donut({ present, total }: { present: number; total: number }) {
  if (total === 0) return <p className="muted-text">No data yet</p>;
  const pct = Math.round((present / total) * 100);
  return (
    <div className="donut-wrap">
      <div
        className="donut"
        style={{
          background: `conic-gradient(#10b981 0 ${pct}%, #ef4444 ${pct}% 100%)`,
        }}
      >
        <div className="donut-hole">{pct}%</div>
      </div>
      <div className="legend">
        <div>
          <span className="dot green" /> Present: {present}
        </div>
        <div>
          <span className="dot red" /> Absent: {total - present}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";

  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    getCourses().then(setCourses);
    getMarks().then(setMarks);
    getAttendance().then(setAttendance);
    if (isAdmin) getStudents().then(setStudents);
  }, [isAdmin]);

  // ---- Calculations ----
  const percentOf = (m: Mark) => (m.score / m.maxScore) * 100;

  const avgScore =
    marks.length === 0
      ? 0
      : Math.round(marks.reduce((sum, m) => sum + percentOf(m), 0) / marks.length);

  const presentCount = attendance.filter((a) => a.status === "Present").length;
  const attendancePct =
    attendance.length === 0
      ? 0
      : Math.round((presentCount / attendance.length) * 100);

  // Students per department (Admin)
  const deptData: BarItem[] = Object.entries(
    students.reduce<Record<string, number>>((acc, s) => {
      acc[s.department] = (acc[s.department] || 0) + 1;
      return acc;
    }, {})
  ).map(([label, value]) => ({ label, value }));

  // Average score per course
  const courseData: BarItem[] = Object.entries(
    marks.reduce<Record<string, { sum: number; count: number }>>((acc, m) => {
      if (!acc[m.courseTitle]) acc[m.courseTitle] = { sum: 0, count: 0 };
      acc[m.courseTitle].sum += percentOf(m);
      acc[m.courseTitle].count += 1;
      return acc;
    }, {})
  ).map(([label, v]) => ({ label, value: Math.round(v.sum / v.count) }));

  const maxDept = Math.max(...deptData.map((d) => d.value), 1);

  return (
    <>
      <Navbar />
      <div className="container">
        <h2 className="section-title">👋 Welcome, {user?.name}</h2>

        <div className="stats">
          {isAdmin && (
            <div className="stat">
              <div className="num">{students.length}</div>
              <div className="label">Total Students</div>
            </div>
          )}
          <div className="stat">
            <div className="num">{courses.length}</div>
            <div className="label">Total Courses</div>
          </div>
          <div className="stat">
            <div className="num">{avgScore}%</div>
            <div className="label">{isAdmin ? "Average Score" : "My Average Score"}</div>
          </div>
          <div className="stat">
            <div className="num">{attendancePct}%</div>
            <div className="label">{isAdmin ? "Overall Attendance" : "My Attendance"}</div>
          </div>
        </div>

        <div className="chart-grid">
          {isAdmin && (
            <div className="card">
              <h3 className="chart-title">🏫 Students per Department</h3>
              <BarChart data={deptData} max={maxDept} />
            </div>
          )}

          <div className="card">
            <h3 className="chart-title">
              📝 {isAdmin ? "Average Score per Course" : "My Score per Course"}
            </h3>
            <BarChart data={courseData} max={100} suffix="%" />
          </div>

          <div className="card">
            <h3 className="chart-title">✅ Attendance</h3>
            <Donut present={presentCount} total={attendance.length} />
          </div>
        </div>
      </div>
    </>
  );
}