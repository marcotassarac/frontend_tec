"use client";

import { useEffect, useState } from "react";
import * as reportesApi from "@/lib/api/reportes";
import { ApiError } from "@/lib/http";
import type { KardexResponse, ReporteStockResponse } from "@/lib/types";

const formatoMoneda = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" });

export default function ReportesPage() {
  const [reporte, setReporte] = useState<ReporteStockResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [productoId, setProductoId] = useState<number | null>(null);
  const [kardex, setKardex] = useState<KardexResponse | null>(null);
  const [kardexError, setKardexError] = useState<string | null>(null);
  const [kardexLoading, setKardexLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        setReporte(await reportesApi.reporteStockActual());
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Error al cargar el reporte de stock");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function consultarKardex(id: number) {
    setProductoId(id);
    setKardexLoading(true);
    setKardexError(null);
    try {
      setKardex(await reportesApi.kardexPorProducto(id));
    } catch (err) {
      setKardex(null);
      setKardexError(err instanceof ApiError ? err.message : "Error al consultar el kardex");
    } finally {
      setKardexLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Reportes e Inventario</h1>
      <p className="mt-1 text-sm text-slate-500">
        Consulta agregada del stock actual y el historial (kardex) de movimientos por producto.
      </p>

      {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {reporte && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-medium uppercase text-slate-400">Total de productos</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{reporte.totalProductos}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-medium uppercase text-slate-400">Con stock bajo</p>
            <p className="mt-1 text-2xl font-semibold text-red-600">{reporte.productosBajoStock}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-medium uppercase text-slate-400">Valor total inventario</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">
              {formatoMoneda.format(reporte.valorTotalInventario)}
            </p>
          </div>
        </div>
      )}

      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Código</th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Nombre</th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Categoría</th>
              <th className="px-4 py-3 text-right font-medium text-slate-500">Precio</th>
              <th className="px-4 py-3 text-right font-medium text-slate-500">Stock</th>
              <th className="px-4 py-3 text-right font-medium text-slate-500">Valor total</th>
              <th className="px-4 py-3 text-right font-medium text-slate-500">Kardex</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-slate-400">Cargando...</td>
              </tr>
            )}
            {!loading && reporte?.items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-slate-400">No hay productos para reportar</td>
              </tr>
            )}
            {reporte?.items.map((item) => (
              <tr key={item.productoId} className={productoId === item.productoId ? "bg-slate-50" : undefined}>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{item.codigo}</td>
                <td className="px-4 py-3 font-medium text-slate-800">
                  {item.nombre}
                  {item.stockBajo && (
                    <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                      Stock bajo
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-500">{item.categoriaNombre ?? "-"}</td>
                <td className="px-4 py-3 text-right text-slate-700">{formatoMoneda.format(item.precio)}</td>
                <td className="px-4 py-3 text-right text-slate-700">{item.stock}</td>
                <td className="px-4 py-3 text-right text-slate-700">{formatoMoneda.format(item.valorTotal)}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => consultarKardex(item.productoId)}
                    className="text-sm font-medium text-slate-600 hover:text-slate-900"
                  >
                    Ver historial
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {productoId && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-800">
            Kardex {kardex ? `- ${kardex.producto.nombre}` : ""}
          </h2>

          {kardexLoading && <p className="mt-3 text-sm text-slate-400">Cargando historial...</p>}
          {kardexError && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{kardexError}</p>}

          {kardex && (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead>
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-slate-500">Fecha</th>
                    <th className="px-3 py-2 text-left font-medium text-slate-500">Tipo</th>
                    <th className="px-3 py-2 text-right font-medium text-slate-500">Cantidad</th>
                    <th className="px-3 py-2 text-right font-medium text-slate-500">Stock resultante</th>
                    <th className="px-3 py-2 text-left font-medium text-slate-500">Motivo</th>
                    <th className="px-3 py-2 text-left font-medium text-slate-500">Usuario</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {kardex.movimientos.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-3 py-4 text-center text-slate-400">
                        Este producto aún no registra movimientos
                      </td>
                    </tr>
                  )}
                  {kardex.movimientos.map((m) => (
                    <tr key={m.id}>
                      <td className="px-3 py-2 text-slate-500">{new Date(m.fecha).toLocaleString("es-CL")}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            m.tipoMovimiento === "ENTRADA"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {m.tipoMovimiento}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right text-slate-700">{m.cantidad}</td>
                      <td className="px-3 py-2 text-right text-slate-700">{m.stockResultante}</td>
                      <td className="px-3 py-2 text-slate-500">{m.motivo}</td>
                      <td className="px-3 py-2 text-slate-500">{m.usuario}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
