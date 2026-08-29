"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { usuario, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    router.replace(usuario ? "/menu" : "/login");
  }, [loading, usuario, router]);

  return (
    <div className="flex flex-1 items-center justify-center">
      <p className="text-slate-500">Cargando...</p>
    </div>
  );
}
