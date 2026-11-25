import { apiFetch } from "../http";
import { REPORT_URL } from "./urls";
import type { NotificacionItem } from "../types";

export function notificacionesAdmin() {
  return apiFetch<NotificacionItem[]>(REPORT_URL, "/api/notificaciones");
}

export function auditoriaCompleta() {
  return apiFetch<NotificacionItem[]>(REPORT_URL, "/api/auditoria");
}
