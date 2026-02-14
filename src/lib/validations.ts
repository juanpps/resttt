import { z } from 'zod';

// ── Categorias ──────────────────────────────────────────
export const categoriaSchema = z.object({
    nombre: z.string().min(1, 'El nombre es requerido').max(100),
    orden: z.number().int().min(0),
    visible: z.boolean(),
});

// ── Productos ──────────────────────────────────────────
export const productoSchema = z.object({
    nombre: z.string().min(1, 'El nombre es requerido').max(200),
    descripcion: z.string().max(1000).default(''),
    precio: z.number().positive('El precio debe ser positivo'),
    categoria_id: z.string().min(1, 'La categoría es requerida'),
    imagen_url: z.string().default(''),
    disponible: z.boolean().default(true),
    destacado: z.boolean().default(false),
    etiquetas: z.array(z.string()).default([]),
    stock: z.number().int().min(0).default(0),
    ingredientes: z.array(z.string()).default([]),
    opciones: z.string().default('[]'),
});

// ── Promociones ────────────────────────────────────────
export const promocionSchema = z.object({
    tipo: z.enum(['porcentaje', 'monto_fijo', '2x1']),
    valor: z.number().min(0),
    productos_aplicables: z.array(z.string()).default([]),
    fecha_inicio: z.string().min(1, 'Fecha inicio requerida'),
    fecha_fin: z.string().min(1, 'Fecha fin requerida'),
    activa: z.boolean().default(true),
});

// ── Pedidos ────────────────────────────────────────────
export const pedidoSchema = z.object({
    numero_pedido: z.string().min(1),
    cliente_id: z.string().min(1),
    subtotal: z.number().min(0),
    impuestos: z.number().min(0),
    envio: z.number().min(0),
    descuento: z.number().min(0),
    total: z.number().min(0),
    estado: z.enum([
        'nuevo',
        'confirmado',
        'en_preparacion',
        'en_camino',
        'entregado',
        'cancelado',
    ]),
    direccion_entrega: z.string().default(''),
    metodo_pago: z.string().min(1),
    fecha_creacion: z.string(),
    fecha_actualizacion: z.string(),
});

// ── Pedido Items ───────────────────────────────────────
export const pedidoItemSchema = z.object({
    pedido_id: z.string().min(1),
    producto_id: z.string().min(1),
    cantidad: z.number().int().positive(),
    precio_unitario: z.number().positive(),
    total_item: z.number().min(0),
});

// ── Favoritos ──────────────────────────────────────────
export const favoritoSchema = z.object({
    cliente_id: z.string().min(1),
    producto_id: z.string().min(1),
});

// ── Eventos ────────────────────────────────────────────
export const eventoSchema = z.object({
    nombre: z.string().min(1, 'El nombre es requerido').max(200),
    descripcion: z.string().max(1000).default(''),
    imagen: z.string().default(''),
    color_tema: z.string().default('#ff6b35'),
    fecha_inicio: z.string().min(1),
    fecha_fin: z.string().min(1),
    activo: z.boolean().default(false),
});

// ── Notificaciones ─────────────────────────────────────
export const notificacionSchema = z.object({
    usuario_id: z.string().min(1),
    tipo: z.string().min(1),
    titulo: z.string().min(1).max(200),
    mensaje: z.string().max(1000),
    leida: z.boolean().default(false),
    fecha: z.string(),
});

// ── Historial Estados ──────────────────────────────────
export const historialEstadoSchema = z.object({
    pedido_id: z.string().min(1),
    estado_anterior: z.string(),
    estado_nuevo: z.string().min(1),
    fecha: z.string(),
    cambiado_por: z.string().min(1),
});

// ── Checkout form ──────────────────────────────────────
export const checkoutSchema = z.object({
    nombre: z.string().min(1, 'El nombre es requerido'),
    telefono: z.string().min(7, 'Teléfono inválido'),
    direccion: z.string().optional(),
    metodo_pago: z.enum(['efectivo', 'transferencia', 'tarjeta']),
    notas: z.string().max(500).optional(),
});
// ── Auth ──────────────────────────────────────────────
export const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});
