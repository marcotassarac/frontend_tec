# Gestor de Inventario — Frontend

Frontend en **Next.js 16** (App Router, TypeScript, Tailwind) del sistema de Gestion de Inventario. Consume 5 microservicios Spring Boot (repositorio separado) via REST, autenticados con JWT.

Repositorio del backend: `Backend_tec` (5 microservicios independientes).

## Pantallas

- `/login` — autenticacion (usuario y contrasena).
- `/menu` — menu principal tras iniciar sesion.
- `/categorias` — mantenedor CRUD de categorias.
- `/productos` — mantenedor CRUD de productos (principal).
- `/movimientos` — proceso de entradas/salidas de inventario.
- `/reportes` — stock actual valorizado, alertas de stock bajo y kardex por producto.

## Requisitos previos

- Node.js 20.9+ y npm.
- Los 5 microservicios del backend corriendo (puertos 8081 a 8085). Ver el repositorio del backend para levantarlos.

## Configuracion

Copia `.env.example` a `.env.local` (ya viene con los valores por defecto para desarrollo local):

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_AUTH_URL=http://localhost:8081
NEXT_PUBLIC_CATEGORY_URL=http://localhost:8082
NEXT_PUBLIC_PRODUCT_URL=http://localhost:8083
NEXT_PUBLIC_INVENTORY_URL=http://localhost:8084
NEXT_PUBLIC_REPORT_URL=http://localhost:8085
```

## Como ejecutar

```bash
npm install
npm run dev
```

Abrir `http://localhost:3000`.

## Usuarios de prueba

| Usuario | Contrasena | Rol |
|---|---|---|
| `admin` | `admin123` | ADMIN |
| `operador` | `operador123` | OPERADOR |

## Notas tecnicas

- El token JWT se guarda en `localStorage` y se envia como `Authorization: Bearer <token>` en cada request.
- Las rutas autenticadas (`/menu`, `/categorias`, `/productos`, `/movimientos`, `/reportes`) redirigen a `/login` si no hay sesion activa.
- `npm run build` y `npm run lint` deben ejecutarse sin errores.
