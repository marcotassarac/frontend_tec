"use client";

import { FormEvent, useEffect, useState } from "react";
import * as productosApi from "@/lib/api/productos";
import * as categoriasApi from "@/lib/api/categorias";
import { ApiError } from "@/lib/http";
import type { Categoria, Producto, ProductoInput } from "@/lib/types";
import Modal from "@/components/Modal";
import { useAuth } from "@/context/AuthContext";

// DEF-10: los campos numericos se guardan como texto mientras se editan, para que al
// borrar el campo quede vacio (y no "0" que luego se convierte en "07").
type FormProducto = Omit<ProductoInput, "precio" | "stock" | "stockMinimo"> & {
  precio: string;
  stock: string;
  stockMinimo: string;
};

const FORM_INICIAL: FormProducto = {
  codigo: "",
  nombre: "",
  descripcion: "",
  categoriaId: 0,
  precio: "0",
  stock: "0",
  stockMinimo: "0",
  activo: true,
};

const formatoMoneda = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" });

export default function ProductosPage() {
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol === "ADMIN";
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<Producto | null>(null);
  const [form, setForm] = useState<FormProducto>(FORM_INICIAL);
  const [formError, setFormError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function cargar() {
    try {
      const [productosData, categoriasData] = await Promise.all([
        productosApi.listarProductos(),
        categoriasApi.listarCategorias(),
      ]);
      setProductos(productosData);
      setCategorias(categoriasData);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error al cargar productos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    queueMicrotask(cargar);
  }, []);

  function abrirNuevo() {
    setEditando(null);
    setForm({ ...FORM_INICIAL, categoriaId: categorias[0]?.id ?? 0 });
    setFormError(null);
    setModalAbierto(true);
  }

  function abrirEditar(producto: Producto) {
    setEditando(producto);
    setForm({
      codigo: producto.codigo,
      nombre: producto.nombre,
      descripcion: producto.descripcion ?? "",
      categoriaId: producto.categoriaId,
      precio: String(producto.precio),
      stock: String(producto.stock),
      stockMinimo: String(producto.stockMinimo),
      activo: producto.activo,
    });
    setFormError(null);
    setModalAbierto(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setFormError(null);
    const datos: ProductoInput = {
      ...form,
      precio: Number(form.precio),
      stock: Number(form.stock),
      stockMinimo: Number(form.stockMinimo),
    };
    try {
      if (editando) {
        await productosApi.actualizarProducto(editando.id, datos);
      } else {
        await productosApi.crearProducto(datos);
      }
      setModalAbierto(false);
      await cargar();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "No fue posible guardar el producto");
    } finally {
      setGuardando(false);
    }
  }

  async function handleEliminar(producto: Producto) {
    if (!confirm(`¿Eliminar el producto "${producto.nombre}"? Quedará inactivo y se conservará su historial de movimientos.`)) return;
    try {
      await productosApi.eliminarProducto(producto.id);
      await cargar();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "No fue posible eliminar el producto");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Mantenedor de Productos</h1>
          <p className="mt-1 text-sm text-slate-500">Administra los productos del catálogo y su inventario base.</p>
        </div>
        <button
          onClick={abrirNuevo}
          disabled={categorias.length === 0}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-60"
        >
          + Nuevo producto
        </button>
      </div>

      {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {!loading && categorias.length === 0 && (
        <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
          Debes crear al menos una categoría antes de registrar productos.
        </p>
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
              <th className="px-4 py-3 text-left font-medium text-slate-500">Estado</th>
              <th className="px-4 py-3 text-right font-medium text-slate-500">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-slate-400">Cargando...</td>
              </tr>
            )}
            {!loading && productos.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-slate-400">No hay productos registrados</td>
              </tr>
            )}
            {productos.map((producto) => (
              <tr key={producto.id}>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{producto.codigo}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{producto.nombre}</td>
                <td className="px-4 py-3 text-slate-500">
                  {producto.categoriaNombre ?? categorias.find((c) => c.id === producto.categoriaId)?.nombre ?? "-"}
                </td>
                <td className="px-4 py-3 text-right text-slate-700">{formatoMoneda.format(producto.precio)}</td>
                <td className="px-4 py-3 text-right">
                  <span className={producto.stockBajo ? "font-semibold text-red-600" : "text-slate-700"}>
                    {producto.stock}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <span
                      className={`w-fit rounded-full px-2 py-0.5 text-xs font-medium ${
                        producto.activo ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {producto.activo ? "Activo" : "Inactivo"}
                    </span>
                    {producto.stockBajo && (
                      <span className="w-fit rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                        Stock bajo
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => abrirEditar(producto)}
                    className="mr-3 text-sm font-medium text-slate-600 hover:text-slate-900"
                  >
                    Editar
                  </button>
                  {esAdmin && producto.activo && (
                    <button
                      onClick={() => handleEliminar(producto)}
                      className="text-sm font-medium text-red-500 hover:text-red-700"
                    >
                      Eliminar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalAbierto && (
        <Modal title={editando ? "Editar producto" : "Nuevo producto"} onClose={() => setModalAbierto(false)}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700">Código</label>
                <input
                  required
                  value={form.codigo}
                  onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Categoría</label>
                <select
                  required
                  value={form.categoriaId}
                  onChange={(e) => setForm({ ...form, categoriaId: Number(e.target.value) })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                >
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Nombre</label>
              <input
                required
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Descripción</label>
              <textarea
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                rows={2}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700">Precio</label>
                <input
                  type="number"
                  min={0}
                  required
                  value={form.precio}
                  onChange={(e) => setForm({ ...form, precio: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Stock inicial</label>
                <input
                  type="number"
                  min={0}
                  required
                  disabled={!!editando}
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Stock mínimo</label>
                <input
                  type="number"
                  min={0}
                  required
                  value={form.stockMinimo}
                  onChange={(e) => setForm({ ...form, stockMinimo: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                />
              </div>
            </div>
            {editando && (
              <p className="text-xs text-slate-400">
                El stock se ajusta desde el módulo de Movimientos de Inventario.
              </p>
            )}

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.activo}
                onChange={(e) => setForm({ ...form, activo: e.target.checked })}
              />
              Producto activo
            </label>

            {formError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalAbierto(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardando}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
              >
                {guardando ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
