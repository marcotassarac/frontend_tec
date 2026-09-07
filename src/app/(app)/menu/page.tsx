"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const OPCIONES = [
  {
    href: "/categorias",
    titulo: "Mantenedor de Categorias",
    descripcion: "Crear, consultar, actualizar y eliminar categorias de productos.",
    icono: "🏷️",
  },
  {
    href: "/productos",
    titulo: "Mantenedor de Productos",
    descripcion: "CRUD completo del catalogo de productos e inventario base.",
    icono: "📦",
  },
  {
    href: "/movimientos",
    titulo: "Movimientos de Inventario",
    descripcion: "Proceso de registro de entradas y salidas de stock.",
    icono: "🔄",
  },
  {
    href: "/reportes",
    titulo: "Reportes e Inventario",
    descripcion: "Consulta de stock actual, alertas y kardex por producto.",
    icono: "📊",
  },
  {
    href: "/seguridad",
    titulo: "Seguridad de la cuenta",
    descripcion: "Activa la verificacion en dos pasos (TOTP) con tu app autenticadora.",
    icono: "🔐",
  },
];

export default function MenuPage() {
  const { usuario } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">
        Bienvenido, {usuario?.nombreCompleto}
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Selecciona un modulo para comenzar a trabajar en el sistema de gestion de inventario.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {OPCIONES.map((op) => (
          <Link
            key={op.href}
            href={op.href}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="text-3xl">{op.icono}</div>
            <h2 className="mt-3 text-base font-semibold text-slate-900">{op.titulo}</h2>
            <p className="mt-1 text-sm text-slate-500">{op.descripcion}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
