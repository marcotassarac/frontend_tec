"use client";

import { useCallback, useEffect, useState } from "react";
import * as notificacionesApi from "@/lib/api/notificaciones";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/http";
import type { NotificacionItem } from "@/lib/types";

type Pestania = "notificaciones" | "auditoria";

export default function NotificacionesPage() {
  const { usuario } = useAuth();
  const [pestania, setPestania] = useState<Pestania>("notificaciones");
  const [items, setItems] = useState<NotificacionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async (tab: Pestania) => {
    setLoading(true);
    setError(null);
    try {
      const data = tab === "notificaciones"
        ? await notificacionesApi.notificacionesAdmin()
        : await notificacionesApi.auditoriaCompleta();
      setItems(data);
    } catch (err) {
      setItems([]);
      setError(err instanceof ApiError ? err.message : "Error al consultar la cola de mensajeria");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => cargar(pestania));
  }, [pestania, cargar]);

  if (usuario?.rol !== "ADMIN") {
    return (
      <div className="mt-6 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">
        Esta seccion es solo para el rol ADMIN.
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Notificaciones (RabbitMQ)</h1>
          <p className="mt-1 text-sm text-slate-500">
            Lo que llega de forma asincrona desde <code className="font-mono text-xs">inventory-service</code> por
            la cola de mensajeria cada vez que alguien registra un movimiento.
          </p>
        </div>
        <button
          onClick={() => cargar(pestania)}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
        >
          Refrescar
        </button>
      </div>

      <div className="mt-5 flex gap-1 border-b border-slate-200">
        <button
          onClick={() => setPestania("notificaciones")}
          className={`rounded-t-md px-4 py-2 text-sm font-medium transition ${
            pestania === "notificaciones"
              ? "border-b-2 border-slate-900 text-slate-900"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Buzon ADMIN (solo operador)
        </button>
        <button
          onClick={() => setPestania("auditoria")}
          className={`rounded-t-md px-4 py-2 text-sm font-medium transition ${
            pestania === "auditoria"
              ? "border-b-2 border-slate-900 text-slate-900"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Auditoria completa (todos)
        </button>
      </div>

      <p className="mt-3 text-xs text-slate-400">
        {pestania === "notificaciones"
          ? "Cola \"cola.notificaciones-admin\" — solo movimientos registrados por un OPERADOR (expiran a las 24 h y, si fallan o expiran, pasan a su DLQ)."
          : "Cola \"cola.auditoria-movimientos\" — TODOS los movimientos, de operador y de admin (con DLQ si un mensaje falla)."}
      </p>

      {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Recibido</th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Usuario</th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Rol</th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Tipo</th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Producto</th>
              <th className="px-4 py-3 text-right font-medium text-slate-500">Cantidad</th>
              <th className="px-4 py-3 text-right font-medium text-slate-500">Stock resultante</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-slate-400">Cargando...</td>
              </tr>
            )}
            {!loading && items.length === 0 && !error && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                  Todavia no llega ningun mensaje por la cola. Registra un movimiento y dale a &quot;Refrescar&quot;.
                </td>
              </tr>
            )}
            {items.map((item, idx) => (
              <tr key={`${item.usuario}-${item.recibidoEn}-${idx}`}>
                <td className="px-4 py-3 text-slate-500">{new Date(item.recibidoEn).toLocaleString("es-CL")}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{item.usuario}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      item.rolUsuario === "ADMIN"
                        ? "bg-slate-200 text-slate-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {item.rolUsuario}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      item.tipoMovimiento === "ENTRADA"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {item.tipoMovimiento}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {item.productoNombre}
                  <span className="ml-1 font-mono text-xs text-slate-400">({item.productoCodigo})</span>
                </td>
                <td className="px-4 py-3 text-right text-slate-700">{item.cantidad}</td>
                <td className="px-4 py-3 text-right text-slate-700">{item.stockResultante}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
