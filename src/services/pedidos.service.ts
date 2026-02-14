import { databases, DATABASE_ID, COLLECTION } from '@/lib/appwrite';
import { Query, ID } from 'appwrite';
import type { Pedido, PedidoItem, EstadoPedido, CartItem } from '@/types';
import { VALID_TRANSITIONS } from '@/types';

const TAX_RATE = 0.08; // 8% impuestos
const SHIPPING_FEE = 5000; // Fixed shipping

function generateOrderNumber(): string {
    const date = new Date();
    const prefix = `JM${date.getFullYear().toString().slice(2)}${String(date.getMonth() + 1).padStart(2, '0')}`;
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `${prefix}-${random}`;
}

export const pedidosService = {
    async list(filters?: {
        estado?: EstadoPedido;
        clienteId?: string;
        limit?: number;
    }): Promise<Pedido[]> {
        const queries: string[] = [
            Query.orderDesc('fecha_creacion'),
            Query.limit(filters?.limit ?? 100),
        ];

        if (filters?.estado) {
            queries.push(Query.equal('estado', filters.estado));
        }
        if (filters?.clienteId) {
            queries.push(Query.equal('cliente_id', filters.clienteId));
        }

        const res = await databases.listDocuments(DATABASE_ID, COLLECTION.PEDIDOS, queries);
        return res.documents as unknown as Pedido[];
    },

    async listByStatus(): Promise<Pedido[]> {
        const res = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION.PEDIDOS,
            [Query.orderDesc('fecha_creacion'), Query.limit(200)]
        );
        return res.documents as unknown as Pedido[];
    },

    async get(id: string): Promise<Pedido> {
        const doc = await databases.getDocument(DATABASE_ID, COLLECTION.PEDIDOS, id);
        return doc as unknown as Pedido;
    },

    async getItems(pedidoId: string): Promise<PedidoItem[]> {
        const res = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION.PEDIDO_ITEMS,
            [Query.equal('pedido_id', pedidoId), Query.limit(100)]
        );
        return res.documents as unknown as PedidoItem[];
    },

    calculateTotals(
        items: CartItem[],
        discount: number = 0,
        includeShipping: boolean = false
    ) {
        const subtotal = items.reduce(
            (acc, item) => acc + item.producto.precio * item.cantidad,
            0
        );
        const impuestos = Math.round((subtotal - discount) * TAX_RATE);
        const envio = includeShipping ? SHIPPING_FEE : 0;
        const total = subtotal - discount + impuestos + envio;

        return { subtotal, impuestos, envio, descuento: discount, total };
    },

    async createOrder(
        items: CartItem[],
        discount: number,
        direccion: string,
        metodoPago: string,
        clienteId?: string,
        includeShipping: boolean = false
    ): Promise<Pedido> {
        const now = new Date().toISOString();
        const totals = this.calculateTotals(items, discount, includeShipping);
        const numeroPedido = generateOrderNumber();

        // Create order
        const pedido = await databases.createDocument(
            DATABASE_ID,
            COLLECTION.PEDIDOS,
            ID.unique(),
            {
                numero_pedido: numeroPedido,
                cliente_id: clienteId,
                ...totals,
                estado: 'nuevo',
                direccion_entrega: direccion,
                metodo_pago: metodoPago,
                fecha_creacion: now,
                fecha_actualizacion: now,
            }
        );

        // Create order items
        await Promise.all(
            items.map((item) =>
                databases.createDocument(
                    DATABASE_ID,
                    COLLECTION.PEDIDO_ITEMS,
                    ID.unique(),
                    {
                        pedido_id: pedido.$id,
                        producto_id: item.producto.$id,
                        cantidad: item.cantidad,
                        precio_unitario: item.producto.precio,
                        total_item: item.producto.precio * item.cantidad,
                    }
                )
            )
        );

        // Create initial history entry
        await databases.createDocument(
            DATABASE_ID,
            COLLECTION.HISTORIAL_ESTADOS,
            ID.unique(),
            {
                pedido_id: pedido.$id,
                estado_anterior: '',
                estado_nuevo: 'nuevo',
                fecha: now,
                cambiado_por: clienteId || 'system',
            }
        );

        return pedido as unknown as Pedido;
    },

    async updateEstado(
        pedidoId: string,
        nuevoEstado: EstadoPedido,
        cambiadoPor: string
    ): Promise<Pedido> {
        const pedido = await this.get(pedidoId);
        const currentEstado = pedido.estado as EstadoPedido;

        // Validate transition
        const allowed = VALID_TRANSITIONS[currentEstado];
        if (!allowed.includes(nuevoEstado)) {
            throw new Error(
                `Transición inválida: ${currentEstado} → ${nuevoEstado}. Permitidas: ${allowed.join(', ')}`
            );
        }

        const now = new Date().toISOString();

        // Update order
        const updated = await databases.updateDocument(
            DATABASE_ID,
            COLLECTION.PEDIDOS,
            pedidoId,
            {
                estado: nuevoEstado,
                fecha_actualizacion: now,
            }
        );

        // Record history
        await databases.createDocument(
            DATABASE_ID,
            COLLECTION.HISTORIAL_ESTADOS,
            ID.unique(),
            {
                pedido_id: pedidoId,
                estado_anterior: currentEstado,
                estado_nuevo: nuevoEstado,
                fecha: now,
                cambiado_por: cambiadoPor,
            }
        );

        return updated as unknown as Pedido;
    },

    async getHistorial(pedidoId: string) {
        const res = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION.HISTORIAL_ESTADOS,
            [Query.equal('pedido_id', pedidoId), Query.orderAsc('fecha')]
        );
        return res.documents;
    },
};
