"use client";

import { FormEvent, useEffect, useState } from "react";
import * as productosApi from "@/lib/api/productos";
import * as movimientosApi from "@/lib/api/movimientos";
import { ApiError } from "@/lib/http";
import type { Movimiento, Producto, TipoMovimiento } from "@/lib/types";

const FORM_INICIAL = {
  productoId: 0,
  tipoMovimiento: "ENTRADA" as TipoMovimiento,
  cantidad: "1", // DEF-10: texto mientras se edita; se convierte a numero al registrar
  motivo: "",
};

export default function MovimientosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState(FORM_INICIAL);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [registrando, setRegistrando] = useState(false);

  async function cargar() {
    try {
      const [productosData, movimientosData] = await Promise.all([
        productosApi.listarProductos(),
        movimientosApi.listarMovimientos(),
      ]);
      setProductos(productosData.filter((p) => p.activo));
      setMovimientos(movimientosData);
      setForm((prev) => (prev.productoId ? prev : { ...prev, productoId: productosData[0]?.id ?? 0 }));
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error al cargar el módulo de movimientos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    queueMicrotask(cargar);
  }, []);

  const productoSeleccionado = productos.find((p) => p.id === form.productoId);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setRegistrando(true);
    try {
      const movimiento = await movimientosApi.registrarMovimiento({ ...form, cantidad: Number(form.cantidad) });
      setFormSuccess(
        `Movimiento registrado. Nuevo stock de ${movimiento.productoNombre}: ${movimiento.stockResultante}`
      );
      setForm({ ...FORM_INICIAL, productoId: form.productoId });
      await cargar();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "No fue posible registrar el movimiento");
    } finally {
      setRegistrando(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Movimientos de Inventario</h1>
      <p className="mt-1 text-sm text-slate-500">
        Proceso para registrar entradas y salidas de stock. El stock del producto se actualiza automáticamente.
      </p>

      {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-800">Registrar movimiento</h2>

            {productos.length === 0 && !loading ? (
              <p className="mt-3 text-sm text-slate-500">No hay productos activos disponibles.</p>
            ) : (
              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Producto</label>
                  <select
                    required
                    value={form.productoId}
                    onChange={(e) => setForm({ ...form, productoId: Number(e.target.value) })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                  >
                    {productos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.codigo} - {p.nombre}
                      </option>
                    ))}
                  </select>
                  {productoSeleccionado && (
                    <p className="mt-1 text-xs text-slate-400">
                      Stock actual: <span className="font-medium text-slate-600">{productoSeleccionado.stock}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Tipo de movimiento</label>
                  <div className="mt-1 flex gap-2">
                    {(["ENTRADA", "SALIDA"] as TipoMovimiento[]).map((tipo) => (
                      <button
                        type="button"
                        key={tipo}
                        onClick={() => setForm({ ...form, tipoMovimiento: tipo })}
                        className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                          form.tipoMovimiento === tipo
                            ? tipo === "ENTRADA"
                              ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                              : "border-red-600 bg-red-50 text-red-700"
                            : "border-slate-300 text-slate-500 hover:bg-slate-50"
                        }`}
                      >
                        {tipo === "ENTRADA" ? "Entrada" : "Salida"}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Cantidad</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={form.cantidad}
                    onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Motivo</label>
                  <input
                    required
                    value={form.motivo}
                    onChange={(e) => setForm({ ...form, motivo: e.target.value })}
                    placeholder="Ej: Compra a proveedor, venta, ajuste por merma..."
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                  />
                </div>

                {formError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>}
                {formSuccess && (
                  <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{formSuccess}</p>
                )}

                <button
                  type="submit"
                  disabled={registrando}
                  className="w-full rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-60"
                >
                  {registrando ? "Registrando..." : "Registrar movimiento"}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Fecha</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Producto</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Tipo</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-500">Cantidad</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-500">Stock resultante</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Usuario</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-slate-400">Cargando...</td>
                  </tr>
                )}
                {!loading && movimientos.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-slate-400">Sin movimientos registrados</td>
                  </tr>
                )}
                {movimientos.map((m) => (
                  <tr key={m.id}>
                    <td className="px-4 py-3 text-slate-500">{new Date(m.fecha).toLocaleString("es-CL")}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{m.productoNombre}</td>
                    <td className="px-4 py-3">
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
                    <td className="px-4 py-3 text-right text-slate-700">{m.cantidad}</td>
                    <td className="px-4 py-3 text-right text-slate-700">{m.stockResultante}</td>
                    <td className="px-4 py-3 text-slate-500">{m.usuario}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
