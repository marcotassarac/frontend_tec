"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/http";

export default function LoginPage() {
  const { usuario, loading, login, completeTwoFactor } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [pendingSessionId, setPendingSessionId] = useState<string | null>(null);
  const [code, setCode] = useState("");

  useEffect(() => {
    if (!loading && usuario) {
      router.replace("/menu");
    }
  }, [loading, usuario, router]);

  async function handleSubmitCredenciales(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const outcome = await login(username, password);
      if (outcome.requiresTwoFactor) {
        setPendingSessionId(outcome.pendingSessionId);
      } else {
        router.replace("/menu");
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No fue posible iniciar sesión");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmitCodigo(e: FormEvent) {
    e.preventDefault();
    if (!pendingSessionId) return;
    setError(null);
    setSubmitting(true);
    try {
      await completeTwoFactor(pendingSessionId, code);
      router.replace("/menu");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Código inválido");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Gestor de Inventario</h1>
          <p className="mt-1 text-sm text-slate-500">
            {pendingSessionId
              ? "Ingresa el código de tu aplicación autenticadora"
              : "Ingresa tus credenciales para continuar"}
          </p>
        </div>

        {!pendingSessionId ? (
          <form onSubmit={handleSubmitCredenciales} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-700">
                Usuario
              </label>
              <input
                id="username"
                type="text"
                required
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                placeholder="admin"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                placeholder="********"
              />
            </div>

            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-60"
            >
              {submitting ? "Ingresando..." : "Ingresar"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmitCodigo} className="space-y-4">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-slate-700">
                Código de verificación
              </label>
              <input
                id="code"
                type="text"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                required
                autoFocus
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-center text-lg tracking-[0.5em] focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                placeholder="000000"
              />
            </div>

            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

            <button
              type="submit"
              disabled={submitting || code.length !== 6}
              className="w-full rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-60"
            >
              {submitting ? "Verificando..." : "Verificar"}
            </button>

            <button
              type="button"
              onClick={() => {
                setPendingSessionId(null);
                setCode("");
                setError(null);
              }}
              className="w-full text-center text-xs font-medium text-slate-500 hover:text-slate-700"
            >
              Volver a ingresar usuario y contraseña
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
