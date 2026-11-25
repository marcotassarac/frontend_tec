import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Los microservicios a los que el navegador llama directamente (ver src/lib/api/urls.ts).
const apis = [
  process.env.NEXT_PUBLIC_AUTH_URL ?? "http://localhost:8081",
  process.env.NEXT_PUBLIC_CATEGORY_URL ?? "http://localhost:8082",
  process.env.NEXT_PUBLIC_PRODUCT_URL ?? "http://localhost:8083",
  process.env.NEXT_PUBLIC_INVENTORY_URL ?? "http://localhost:8084",
  process.env.NEXT_PUBLIC_REPORT_URL ?? "http://localhost:8085",
].join(" ");

// Recomendacion del escaneo OWASP ZAP (TCY0101 Parcial 2), verificada en el UAT (CA-29).
// 'unsafe-eval' y ws: solo en desarrollo, para la recarga en caliente de Next.js.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data:",
  "font-src 'self'",
  `connect-src 'self' ${apis}${isDev ? " ws:" : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
