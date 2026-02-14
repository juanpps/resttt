import { databases, DATABASE_ID, COLLECTION } from '@/lib/appwrite';
import { Query, ID } from 'appwrite';
import type { Notificacion } from '@/types';

export type NotificationChannel = 'internal' | 'email' | 'push';

export const notificacionesService = {
    async list(usuarioId: string): Promise<Notificacion[]> {
        const res = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION.NOTIFICACIONES,
            [
                Query.equal('usuario_id', usuarioId),
                Query.orderDesc('fecha'),
                Query.limit(50),
            ]
        );
        return res.documents as unknown as Notificacion[];
    },

    async listUnread(usuarioId: string): Promise<Notificacion[]> {
        const res = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION.NOTIFICACIONES,
            [
                Query.equal('usuario_id', usuarioId),
                Query.equal('leida', false),
                Query.orderDesc('fecha'),
                Query.limit(50),
            ]
        );
        return res.documents as unknown as Notificacion[];
    },

    async markAsRead(id: string): Promise<void> {
        await databases.updateDocument(DATABASE_ID, COLLECTION.NOTIFICACIONES, id, {
            leida: true,
        });
    },

    async markAllAsRead(usuarioId: string): Promise<void> {
        const unread = await this.listUnread(usuarioId);
        await Promise.all(
            unread.map((n) =>
                databases.updateDocument(DATABASE_ID, COLLECTION.NOTIFICACIONES, n.$id, {
                    leida: true,
                })
            )
        );
    },

    /**
     * Send notification via specified channels.
     * Internal notifications are always stored in the database.
     * Email and Push are logged but would need external service integration.
     */
    async send(
        data: {
            usuarioId: string;
            tipo: string;
            titulo: string;
            mensaje: string;
        },
        channels: NotificationChannel[] = ['internal']
    ): Promise<Notificacion> {
        const now = new Date().toISOString();

        // Always create internal notification
        const doc = await databases.createDocument(
            DATABASE_ID,
            COLLECTION.NOTIFICACIONES,
            ID.unique(),
            {
                usuario_id: data.usuarioId,
                tipo: data.tipo,
                titulo: data.titulo,
                mensaje: data.mensaje,
                leida: false,
                fecha: now,
            }
        );

        // Log additional channels (integration points for email/push)
        if (channels.includes('email')) {
            console.log(`[EMAIL] To: ${data.usuarioId} | ${data.titulo}: ${data.mensaje}`);
        }
        if (channels.includes('push')) {
            console.log(`[PUSH] To: ${data.usuarioId} | ${data.titulo}: ${data.mensaje}`);
        }

        return doc as unknown as Notificacion;
    },

    // ── Pre-built notification events ──
    async notifyNewOrder(adminId: string, numeroPedido: string) {
        return this.send(
            {
                usuarioId: adminId,
                tipo: 'pedido_nuevo',
                titulo: 'Nuevo Pedido',
                mensaje: `Se ha recibido el pedido #${numeroPedido}`,
            },
            ['internal', 'push']
        );
    },

    async notifyOrderStatusChange(
        clienteId: string,
        numeroPedido: string,
        nuevoEstado: string
    ) {
        return this.send({
            usuarioId: clienteId,
            tipo: 'estado_pedido',
            titulo: 'Actualización de Pedido',
            mensaje: `Tu pedido #${numeroPedido} ha cambiado a: ${nuevoEstado}`,
        });
    },

    async notifyLowStock(adminId: string, productoNombre: string, stock: number) {
        return this.send(
            {
                usuarioId: adminId,
                tipo: 'stock_bajo',
                titulo: 'Stock Bajo',
                mensaje: `${productoNombre} tiene solo ${stock} unidades restantes`,
            },
            ['internal', 'email']
        );
    },
};
