"use client";

import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import * as authApi from "@/lib/api/auth";
import { clearToken, setToken, getToken } from "@/lib/http";
import type { Usuario } from "@/lib/types";

interface AuthContextValue {
  usuario: Usuario | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
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

  const login = useCallback(async (username: string, password: string) => {
    const response = await authApi.login(username, password);
    setToken(response.token);
    const usuarioLogeado: Usuario = {
      id: response.id,
      username: response.username,
      nombreCompleto: response.nombreCompleto,
      rol: response.rol,
    };
    window.localStorage.setItem(USER_KEY, JSON.stringify(usuarioLogeado));
    setUsuario(usuarioLogeado);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    window.localStorage.removeItem(USER_KEY);
    setUsuario(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ usuario, loading, login, logout }}>
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
