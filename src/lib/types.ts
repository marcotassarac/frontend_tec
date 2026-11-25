export interface Usuario {
  id: number;
  username: string;
  nombreCompleto: string;
  email?: string;
  rol: "ADMIN" | "OPERADOR";
  activo?: boolean;
}

export interface LoginResponse {
  requiresTwoFactor: boolean;
  pendingSessionId?: string | null;
  token?: string | null;
  tokenType?: string | null;
  id?: number | null;
  username?: string | null;
  nombreCompleto?: string | null;
  rol?: "ADMIN" | "OPERADOR" | null;
  expiresInMs?: number;
}

export interface TwoFactorSetupResponse {
  secret: string;
  otpAuthUrl: string;
  qrCodeImageBase64: string;
}

export interface TwoFactorStatusResponse {
  totpEnabled: boolean;
}

export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  fechaCreacion?: string;
}

export interface CategoriaInput {
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

export interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  categoriaId: number;
  categoriaNombre?: string | null;
  precio: number;
  stock: number;
  stockMinimo: number;
  stockBajo: boolean;
  activo: boolean;
  fechaCreacion?: string;
  fechaActualizacion?: string;
}

export interface ProductoInput {
  codigo: string;
  nombre: string;
  descripcion?: string;
  categoriaId: number;
  precio: number;
  stock: number;
  stockMinimo: number;
  activo?: boolean;
}

export type TipoMovimiento = "ENTRADA" | "SALIDA";

export interface Movimiento {
  id: number;
  productoId: number;
  productoCodigo: string;
  productoNombre: string;
  tipoMovimiento: TipoMovimiento;
  cantidad: number;
  motivo: string;
  usuario: string;
  stockResultante: number;
  fecha: string;
}

export interface MovimientoInput {
  productoId: number;
  tipoMovimiento: TipoMovimiento;
  cantidad: number;
  motivo: string;
}

export interface ReporteStockItem {
  productoId: number;
  codigo: string;
  nombre: string;
  categoriaNombre?: string | null;
  precio: number;
  stock: number;
  stockMinimo: number;
  stockBajo: boolean;
  valorTotal: number;
}

export interface ReporteStockResponse {
  items: ReporteStockItem[];
  totalProductos: number;
  productosBajoStock: number;
  valorTotalInventario: number;
}

export interface KardexResponse {
  producto: Producto;
  movimientos: Movimiento[];
}

export interface ApiErrorBody {
  timestamp?: string;
  status?: number;
  error?: string;
  message?: string;
  path?: string;
}

export interface NotificacionItem {
  usuario: string;
  rolUsuario: string;
  tipoMovimiento: TipoMovimiento;
  productoCodigo: string;
  productoNombre: string;
  cantidad: number;
  stockResultante: number;
  fechaMovimiento: string;
  recibidoEn: string;
}
