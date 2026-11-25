"use client";

import { FormEvent, useEffect, useState } from "react";
import * as authApi from "@/lib/api/auth";
import { ApiError } from "@/lib/http";
import type { TwoFactorSetupResponse } from "@/lib/types";

export default function SeguridadPage() {
  const [totpEnabled, setTotpEnabled] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [setup, setSetup] = useState<TwoFactorSetupResponse | null>(null);
  const [code, setCode] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [procesando, setProcesando] = useState(false);

  async function cargarEstado() {
    try {
      const estado = await authApi.getTwoFactorStatus();
      setTotpEnabled(estado.totpEnabled);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error al consultar el estado de la verificación en dos pasos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    queueMicrotask(cargarEstado);
  }, []);

  async function iniciarConfiguracion() {
    setFormError(null);
    setFormSuccess(null);
    setProcesando(true);
    try {
      const respuesta = await authApi.setupTwoFactor();
      setSetup(respuesta);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "No fue posible iniciar la configuración");
    } finally {
      setProcesando(false);
    }
  }

  async function confirmarActivacion(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setProcesando(true);
    try {
      await authApi.enableTwoFactor(code);
      setSetup(null);
      setCode("");
      setFormSuccess("Verificación en dos pasos activada correctamente.");
      await cargarEstado();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Código inválido");
    } finally {
      setProcesando(false);
    }
  }

  async function desactivar() {
    if (!confirm("¿Desactivar la verificación en dos pasos?")) return;
    setFormError(null);
    setFormSuccess(null);
    setProcesando(true);
    try {
      await authApi.disableTwoFactor();
      setFormSuccess("Verificación en dos pasos desactivada.");
      await cargarEstado();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "No fue posible desactivar la verificación en dos pasos");
    } finally {
      setProcesando(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Seguridad de la cuenta</h1>
      <p className="mt-1 text-sm text-slate-500">
        Activa la verificación en dos pasos usando Google Authenticator, Microsoft Authenticator
        u otra aplicación compatible.
      </p>

      {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="mt-6 max-w-lg rounded-xl border border-slate-200 bg-white p-6">
        {loading ? (
          <p className="text-sm text-slate-400">Cargando...</p>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">Verificación en dos pasos</p>
                <p className="text-sm text-slate-500">
                  Estado actual:{" "}
                  <span className={totpEnabled ? "font-medium text-emerald-600" : "font-medium text-slate-500"}>
                    {totpEnabled ? "Activada" : "Desactivada"}
                  </span>
                </p>
              </div>
              {totpEnabled && (
                <button
                  onClick={desactivar}
                  disabled={procesando}
                  className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                >
                  Desactivar
                </button>
              )}
            </div>

            {formSuccess && (
              <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{formSuccess}</p>
            )}

            {!totpEnabled && !setup && (
              <button
                onClick={iniciarConfiguracion}
                disabled={procesando}
                className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
              >
                {procesando ? "Generando..." : "Activar verificación en dos pasos"}
              </button>
            )}

            {setup && (
              <div className="mt-4 space-y-4">
                <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-600">
                  <li>Abre Google Authenticator, Microsoft Authenticator o similar en tu celular.</li>
                  <li>Escanea este código QR (o ingresa el código manual).</li>
                  <li>Escribe abajo el código de 6 dígitos que te muestra la aplicación.</li>
                </ol>

                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={setup.qrCodeImageBase64}
                  alt="Código QR para configurar la verificación en dos pasos"
                  className="h-48 w-48 rounded-lg border border-slate-200"
                />

                <div>
                  <p className="text-xs font-medium text-slate-500">Código manual (si no puedes escanear el QR)</p>
                  <p className="mt-1 break-all rounded-lg bg-slate-50 px-3 py-2 font-mono text-sm text-slate-700">
                    {setup.secret}
                  </p>
                </div>

                <form onSubmit={confirmarActivacion} className="space-y-3">
                  <div>
                    <label htmlFor="setup-code" className="block text-sm font-medium text-slate-700">
                      Código de la aplicación
                    </label>
                    <input
                      id="setup-code"
                      type="text"
                      inputMode="numeric"
                      pattern="\d{6}"
                      maxLength={6}
                      required
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                      className="mt-1 w-40 rounded-lg border border-slate-300 px-3 py-2 text-center text-lg tracking-[0.5em] focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                      placeholder="000000"
                    />
                  </div>

                  {formError && (
                    <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={procesando || code.length !== 6}
                      className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
                    >
                      {procesando ? "Verificando..." : "Confirmar y activar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSetup(null);
                        setCode("");
                        setFormError(null);
                      }}
                      className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
