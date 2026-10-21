export interface AttendanceRecord {
  id?: string;
  studentName: string;
  studentEmail: string;
  date: string;
  status: "Present" | "Absent";
}