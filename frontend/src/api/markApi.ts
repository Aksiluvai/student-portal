import api from "./client";
import type { Mark } from "../types/mark";

export const getMarks = () => api.get<Mark[]>("/marks").then((r) => r.data);

export const addMark = (m: Mark) => api.post("/marks", m);

export const updateMark = (id: string, m: Mark) => api.put(`/marks/${id}`, m);

export const deleteMark = (id: string) => api.delete(`/marks/${id}`);