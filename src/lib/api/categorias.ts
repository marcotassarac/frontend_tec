import { apiFetch } from "../http";
import { CATEGORY_URL } from "./urls";
import type { Categoria, CategoriaInput } from "../types";

export function listarCategorias() {
  return apiFetch<Categoria[]>(CATEGORY_URL, "/api/categorias");
}

export function obtenerCategoria(id: number) {
  return apiFetch<Categoria>(CATEGORY_URL, `/api/categorias/${id}`);
}

export function crearCategoria(input: CategoriaInput) {
  return apiFetch<Categoria>(CATEGORY_URL, "/api/categorias", { method: "POST", body: input });
}

export function actualizarCategoria(id: number, input: CategoriaInput) {
  return apiFetch<Categoria>(CATEGORY_URL, `/api/categorias/${id}`, { method: "PUT", body: input });
}

export function eliminarCategoria(id: number) {
  return apiFetch<void>(CATEGORY_URL, `/api/categorias/${id}`, { method: "DELETE" });
}
