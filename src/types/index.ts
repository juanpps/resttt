// ── Categorias ──────────────────────────────────────────
export interface Categoria {
    $id: string;
    $createdAt: string;
    $updatedAt: string;
    nombre: string;
    orden: number;
    visible: boolean;
}

// ── Productos ──────────────────────────────────────────
export interface Producto {
    $id: string;
    $createdAt: string;
    $updatedAt: string;
    nombre: string;
    descripcion: string;
    precio: number;
    categoria_id: string;
    imagen_url: string;
    disponible: boolean;
    destacado: boolean;
    etiquetas: string[];
    stock: number;
    ingredientes?: string[];
    opciones?: string; // JSON string for variants/extras
}

// ── Promociones ────────────────────────────────────────
export type TipoPromocion = 'porcentaje' | 'monto_fijo' | '2x1';

export interface Promocion {
    $id: string;
    $createdAt: string;
    $updatedAt: string;
    tipo: TipoPromocion;
    valor: number;
    productos_aplicables: string[];
    fecha_inicio: string;
    fecha_fin: string;
    activa: boolean;
}

// ── Pedidos ────────────────────────────────────────────
export type EstadoPedido =
    | 'nuevo'
    | 'confirmado'
    | 'en_preparacion'
    | 'en_camino'
    | 'entregado'
    | 'cancelado';

export interface Pedido {
    $id: string;
    $createdAt: string;
    $updatedAt: string;
    numero_pedido: string;
    cliente_id: string;
    subtotal: number;
    impuestos: number;
    envio: number;
    descuento: number;
    total: number;
    estado: EstadoPedido;
    direccion_entrega: string;
    metodo_pago: string;
    fecha_creacion: string;
    fecha_actualizacion: string;
}

// ── Pedido Items ───────────────────────────────────────
export interface PedidoItem {
    $id: string;
    $createdAt: string;
    $updatedAt: string;
    pedido_id: string;
    producto_id: string;
    cantidad: number;
    precio_unitario: number;
    total_item: number;
}

// ── Favoritos ──────────────────────────────────────────
export interface Favorito {
    $id: string;
    $createdAt: string;
    $updatedAt: string;
    cliente_id: string;
    producto_id: string;
}

// ── Eventos ────────────────────────────────────────────
export interface Evento {
    $id: string;
    $createdAt: string;
    $updatedAt: string;
    nombre: string;
    descripcion: string;
    imagen: string;
    color_tema: string;
    fecha_inicio: string;
    fecha_fin: string;
    activo: boolean;
}

// ── Notificaciones ─────────────────────────────────────
export interface Notificacion {
    $id: string;
    $createdAt: string;
    $updatedAt: string;
    usuario_id: string;
    tipo: string;
    titulo: string;
    mensaje: string;
    leida: boolean;
    fecha: string;
}

// ── Historial Estados ──────────────────────────────────
export interface HistorialEstado {
    $id: string;
    $createdAt: string;
    $updatedAt: string;
    pedido_id: string;
    estado_anterior: string;
    estado_nuevo: string;
    fecha: string;
    cambiado_por: string;
}

// ── Cart (frontend-only) ───────────────────────────────
export interface CartItem {
    producto: Producto;
    cantidad: number;
}

// ── Valid state transitions ────────────────────────────
export const VALID_TRANSITIONS: Record<EstadoPedido, EstadoPedido[]> = {
    nuevo: ['confirmado', 'cancelado'],
    confirmado: ['en_preparacion', 'cancelado'],
    en_preparacion: ['en_camino', 'cancelado'],
    en_camino: ['entregado'],
    entregado: [],
    cancelado: [],
};

export const ESTADO_LABELS: Record<EstadoPedido, string> = {
    nuevo: 'Nuevo',
    confirmado: 'Confirmado',
    en_preparacion: 'En Preparación',
    en_camino: 'En Camino',
    entregado: 'Entregado',
    cancelado: 'Cancelado',
};

export const ESTADO_COLORS: Record<EstadoPedido, string> = {
    nuevo: '#3b82f6',
    confirmado: '#8b5cf6',
    en_preparacion: '#f59e0b',
    en_camino: '#06b6d4',
    entregado: '#10b981',
    cancelado: '#ef4444',
};
