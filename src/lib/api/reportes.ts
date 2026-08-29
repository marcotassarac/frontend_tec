import { apiFetch } from "../http";
import { REPORT_URL } from "./urls";
import type { KardexResponse, ReporteStockResponse } from "../types";

export function reporteStockActual() {
  return apiFetch<ReporteStockResponse>(REPORT_URL, "/api/reportes/stock-actual");
}

export function kardexPorProducto(productoId: number) {
  return apiFetch<KardexResponse>(REPORT_URL, `/api/reportes/kardex/${productoId}`);
}
