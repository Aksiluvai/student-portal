import api from "./client";
import type { Course } from "../types/course";

export const getCourses = () =>
  api.get<Course[]>("/courses").then((r) => r.data);

export const addCourse = (c: Course) => api.post("/courses", c);

export const updateCourse = (id: string, c: Course) =>
  api.put(`/courses/${id}`, c);

export const deleteCourse = (id: string) => api.delete(`/courses/${id}`);