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
      setError(err instanceof ApiError ? err.message : "Error al consultar el estado del 2FA");
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
      setFormError(err instanceof ApiError ? err.message : "No fue posible iniciar la configuracion");
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
      setFormSuccess("Autenticacion en dos pasos activada correctamente.");
      await cargarEstado();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Codigo invalido");
    } finally {
      setProcesando(false);
    }
  }

  async function desactivar() {
    if (!confirm("¿Desactivar la autenticacion en dos pasos?")) return;
    setFormError(null);
    setFormSuccess(null);
    setProcesando(true);
    try {
      await authApi.disableTwoFactor();
      setFormSuccess("Autenticacion en dos pasos desactivada.");
      await cargarEstado();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "No fue posible desactivar el 2FA");
    } finally {
      setProcesando(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Seguridad de la cuenta</h1>
      <p className="mt-1 text-sm text-slate-500">
        Activa la verificacion en dos pasos (TOTP) usando Google Authenticator, Microsoft Authenticator
        u otra app compatible.
      </p>

      {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="mt-6 max-w-lg rounded-xl border border-slate-200 bg-white p-6">
        {loading ? (
          <p className="text-sm text-slate-400">Cargando...</p>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">Verificacion en dos pasos</p>
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
                {procesando ? "Generando..." : "Activar verificacion en dos pasos"}
              </button>
            )}

            {setup && (
              <div className="mt-4 space-y-4">
                <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-600">
                  <li>Abre Google Authenticator, Microsoft Authenticator o similar en tu celular.</li>
                  <li>Escanea este codigo QR (o ingresa el codigo manual).</li>
                  <li>Escribe abajo el codigo de 6 digitos que te muestra la app.</li>
                </ol>

                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={setup.qrCodeImageBase64}
                  alt="Codigo QR para configurar la verificacion en dos pasos"
                  className="h-48 w-48 rounded-lg border border-slate-200"
                />

                <div>
                  <p className="text-xs font-medium text-slate-500">Codigo manual (si no puedes escanear el QR)</p>
                  <p className="mt-1 break-all rounded-lg bg-slate-50 px-3 py-2 font-mono text-sm text-slate-700">
                    {setup.secret}
                  </p>
                </div>

                <form onSubmit={confirmarActivacion} className="space-y-3">
                  <div>
                    <label htmlFor="setup-code" className="block text-sm font-medium text-slate-700">
                      Codigo de la app
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
