import { apiFetch } from "../http";
import { INVENTORY_URL } from "./urls";
import type { Movimiento, MovimientoInput } from "../types";

export function listarMovimientos(productoId?: number) {
  const query = productoId ? `?productoId=${productoId}` : "";
  return apiFetch<Movimiento[]>(INVENTORY_URL, `/api/movimientos${query}`);
}

export function registrarMovimiento(input: MovimientoInput) {
  return apiFetch<Movimiento>(INVENTORY_URL, "/api/movimientos", { method: "POST", body: input });
}
