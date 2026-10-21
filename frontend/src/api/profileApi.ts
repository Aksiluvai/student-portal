import api from "./client";
import type { ProfileInfo } from "../types/profile";

export const getProfile = () =>
  api.get<ProfileInfo>("/profile").then((r) => r.data);

export const changePassword = (currentPassword: string, newPassword: string) =>
  api.put("/profile/password", { currentPassword, newPassword });