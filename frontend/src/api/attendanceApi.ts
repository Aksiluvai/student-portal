import api from "./client";
import type { AttendanceRecord } from "../types/attendance";

export const getAttendance = () =>
  api.get<AttendanceRecord[]>("/attendance").then((r) => r.data);

export const saveAttendance = (items: AttendanceRecord[]) =>
  api.post("/attendance/bulk", items);

export const deleteAttendance = (id: string) => api.delete(`/attendance/${id}`);