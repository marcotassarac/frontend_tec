import { apiFetch } from "../http";
import { AUTH_URL } from "./urls";
import type { LoginResponse, Usuario } from "../types";

export function login(username: string, password: string) {
  return apiFetch<LoginResponse>(AUTH_URL, "/api/auth/login", {
    method: "POST",
    body: { username, password },
    auth: false,
  });
}

export function me() {
  return apiFetch<Usuario>(AUTH_URL, "/api/auth/me");
}
