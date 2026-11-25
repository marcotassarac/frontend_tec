"use client";

import { FormEvent, useEffect, useState } from "react";
import * as categoriasApi from "@/lib/api/categorias";
import { ApiError } from "@/lib/http";
import type { Categoria } from "@/lib/types";
import Modal from "@/components/Modal";
import { useAuth } from "@/context/AuthContext";

const FORM_INICIAL = { nombre: "", descripcion: "", activo: true };

export default function CategoriasPage() {
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol === "ADMIN";
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<Categoria | null>(null);
  const [form, setForm] = useState(FORM_INICIAL);
  const [formError, setFormError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function cargar() {
    try {
      const data = await categoriasApi.listarCategorias();
      setCategorias(data);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error al cargar las categorías");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    queueMicrotask(cargar);
  }, []);

  function abrirNueva() {
    setEditando(null);
    setForm(FORM_INICIAL);
    setFormError(null);
    setModalAbierto(true);
  }

  function abrirEditar(categoria: Categoria) {
    setEditando(categoria);
    setForm({ nombre: categoria.nombre, descripcion: categoria.descripcion ?? "", activo: categoria.activo });
    setFormError(null);
    setModalAbierto(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setFormError(null);
    try {
      if (editando) {
        await categoriasApi.actualizarCategoria(editando.id, form);
      } else {
        await categoriasApi.crearCategoria(form);
      }
      setModalAbierto(false);
      await cargar();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "No fue posible guardar la categoría");
    } finally {
      setGuardando(false);
    }
  }

  async function handleEliminar(categoria: Categoria) {
    if (!confirm(`¿Eliminar la categoría "${categoria.nombre}"?`)) return;
    try {
      await categoriasApi.eliminarCategoria(categoria.id);
      await cargar();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "No fue posible eliminar la categoría");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Mantenedor de Categorías</h1>
          <p className="mt-1 text-sm text-slate-500">Administra las categorías del catálogo de productos.</p>
        </div>
        <button
          onClick={abrirNueva}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          + Nueva categoría
        </button>
      </div>

      {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Nombre</th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Descripción</th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Estado</th>
              <th className="px-4 py-3 text-right font-medium text-slate-500">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400">Cargando...</td>
              </tr>
            )}
            {!loading && categorias.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400">No hay categorías registradas</td>
              </tr>
            )}
            {categorias.map((categoria) => (
              <tr key={categoria.id}>
                <td className="px-4 py-3 font-medium text-slate-800">{categoria.nombre}</td>
                <td className="px-4 py-3 text-slate-500">{categoria.descripcion || "-"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      categoria.activo ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {categoria.activo ? "Activa" : "Inactiva"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => abrirEditar(categoria)}
                    className="mr-3 text-sm font-medium text-slate-600 hover:text-slate-900"
                  >
                    Editar
                  </button>
                  {esAdmin && (
                    <button
                      onClick={() => handleEliminar(categoria)}
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
        <Modal title={editando ? "Editar categoría" : "Nueva categoría"} onClose={() => setModalAbierto(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                rows={3}
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.activo}
                onChange={(e) => setForm({ ...form, activo: e.target.checked })}
              />
              Categoría activa
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
