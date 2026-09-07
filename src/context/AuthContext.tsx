"use client";

import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import * as authApi from "@/lib/api/auth";
import { clearToken, setToken, getToken } from "@/lib/http";
import type { LoginResponse, Usuario } from "@/lib/types";

export type LoginOutcome =
  | { requiresTwoFactor: true; pendingSessionId: string }
  | { requiresTwoFactor: false };

interface AuthContextValue {
  usuario: Usuario | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<LoginOutcome>;
  completeTwoFactor: (pendingSessionId: string, code: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const USER_KEY = "inventario.usuario";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function restaurarSesion() {
      await Promise.resolve();
      const token = getToken();
      const storedUser = window.localStorage.getItem(USER_KEY);
      if (token && storedUser) {
        try {
          setUsuario(JSON.parse(storedUser) as Usuario);
        } catch {
          clearToken();
        }
      }
      setLoading(false);
    }
    restaurarSesion();
  }, []);

  const aplicarSesion = useCallback((response: LoginResponse) => {
    setToken(response.token as string);
    const usuarioLogeado: Usuario = {
      id: response.id as number,
      username: response.username as string,
      nombreCompleto: response.nombreCompleto as string,
      rol: response.rol as "ADMIN" | "OPERADOR",
    };
    window.localStorage.setItem(USER_KEY, JSON.stringify(usuarioLogeado));
    setUsuario(usuarioLogeado);
  }, []);

  const login = useCallback(
    async (username: string, password: string): Promise<LoginOutcome> => {
      const response = await authApi.login(username, password);
      if (response.requiresTwoFactor) {
        return { requiresTwoFactor: true, pendingSessionId: response.pendingSessionId as string };
      }
      aplicarSesion(response);
      return { requiresTwoFactor: false };
    },
    [aplicarSesion]
  );

  const completeTwoFactor = useCallback(
    async (pendingSessionId: string, code: string) => {
      const response = await authApi.verifyTwoFactor(pendingSessionId, code);
      aplicarSesion(response);
    },
    [aplicarSesion]
  );

  const logout = useCallback(() => {
    clearToken();
    window.localStorage.removeItem(USER_KEY);
    setUsuario(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ usuario, loading, login, completeTwoFactor, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}
