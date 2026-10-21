import api from "./client";

export interface AuthResponse {
  token: string;
  name: string;
  role: string;
}

export const loginApi = (email: string, password: string) =>
  api.post<AuthResponse>("/auth/login", { email, password }).then((r) => r.data);

export const registerApi = (name: string, email: string, password: string) =>
  api
    .post<AuthResponse>("/auth/register", { name, email, password })
    .then((r) => r.data);