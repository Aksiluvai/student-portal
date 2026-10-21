import api from "./client";
import type { Student } from "../types/student";

export const getStudents = () =>
  api.get<Student[]>("/students").then((r) => r.data);

export const addStudent = (s: Student) =>
  api.post<Student>("/students", s).then((r) => r.data);

export const updateStudent = (id: string, s: Student) =>
  api.put(`/students/${id}`, s);

export const deleteStudent = (id: string) => api.delete(`/students/${id}`);