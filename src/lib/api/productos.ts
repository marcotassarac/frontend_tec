import { apiFetch } from "../http";
import { PRODUCT_URL } from "./urls";
import type { Producto, ProductoInput } from "../types";

export function listarProductos() {
  return apiFetch<Producto[]>(PRODUCT_URL, "/api/productos");
}

export function obtenerProducto(id: number) {
  return apiFetch<Producto>(PRODUCT_URL, `/api/productos/${id}`);
}

export function crearProducto(input: ProductoInput) {
  return apiFetch<Producto>(PRODUCT_URL, "/api/productos", { method: "POST", body: input });
}

export function actualizarProducto(id: number, input: ProductoInput) {
  return apiFetch<Producto>(PRODUCT_URL, `/api/productos/${id}`, { method: "PUT", body: input });
}

export function eliminarProducto(id: number) {
  return apiFetch<void>(PRODUCT_URL, `/api/productos/${id}`, { method: "DELETE" });
}
