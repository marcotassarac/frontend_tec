import { apiFetch } from "../http";
import { AUTH_URL } from "./urls";
import type { LoginResponse, TwoFactorSetupResponse, TwoFactorStatusResponse, Usuario } from "../types";

export function login(username: string, password: string) {
  return apiFetch<LoginResponse>(AUTH_URL, "/api/auth/login", {
    method: "POST",
    body: { username, password },
    auth: false,
  });
}

/** Segundo factor: codigo TOTP de 6 digitos generado por Google/Microsoft Authenticator. */
export function verifyTwoFactor(pendingSessionId: string, code: string) {
  return apiFetch<LoginResponse>(AUTH_URL, "/api/auth/2fa/verify", {
    method: "POST",
    body: { pendingSessionId, code },
    auth: false,
  });
}

export function me() {
  return apiFetch<Usuario>(AUTH_URL, "/api/auth/me");
}

/** Genera un secreto nuevo y el QR para escanear con la app autenticadora. Requiere sesion activa. */
export function setupTwoFactor() {
  return apiFetch<TwoFactorSetupResponse>(AUTH_URL, "/api/auth/2fa/setup", { method: "POST" });
}

/** Confirma el setup con el primer codigo generado por la app y activa el 2FA. */
export function enableTwoFactor(code: string) {
  return apiFetch<TwoFactorStatusResponse>(AUTH_URL, "/api/auth/2fa/enable", {
    method: "POST",
    body: { code },
  });
}

export function disableTwoFactor() {
  return apiFetch<TwoFactorStatusResponse>(AUTH_URL, "/api/auth/2fa/disable", { method: "POST" });
}

export function getTwoFactorStatus() {
  return apiFetch<TwoFactorStatusResponse>(AUTH_URL, "/api/auth/2fa/status");
}
