import { databases, DATABASE_ID, COLLECTION } from '@/lib/appwrite';
import { Query } from 'appwrite';
import type { Pedido, PedidoItem } from '@/types';

export const analyticsService = {
    async getSalesToday(): Promise<number> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const res = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION.PEDIDOS,
            [
                Query.greaterThanEqual('fecha_creacion', today.toISOString()),
                Query.notEqual('estado', 'cancelado'),
                Query.limit(500),
            ]
        );

        const pedidos = res.documents as unknown as Pedido[];
        return pedidos.reduce((acc, p) => acc + p.total, 0);
    },

    async getSalesMonth(): Promise<number> {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);

        const res = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION.PEDIDOS,
            [
                Query.greaterThanEqual('fecha_creacion', firstDay.toISOString()),
                Query.notEqual('estado', 'cancelado'),
                Query.limit(1000),
            ]
        );

        const pedidos = res.documents as unknown as Pedido[];
        return pedidos.reduce((acc, p) => acc + p.total, 0);
    },

    async getAverageTicket(): Promise<number> {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);

        const res = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION.PEDIDOS,
            [
                Query.greaterThanEqual('fecha_creacion', firstDay.toISOString()),
                Query.notEqual('estado', 'cancelado'),
                Query.limit(1000),
            ]
        );

        const pedidos = res.documents as unknown as Pedido[];
        if (pedidos.length === 0) return 0;
        const total = pedidos.reduce((acc, p) => acc + p.total, 0);
        return Math.round(total / pedidos.length);
    },

    async getTotalOrders(): Promise<number> {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);

        const res = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION.PEDIDOS,
            [
                Query.greaterThanEqual('fecha_creacion', firstDay.toISOString()),
                Query.limit(1),
            ]
        );

        return res.total;
    },

    async getTopProduct(): Promise<{ nombre: string; count: number } | null> {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);

        // Get recent orders
        const ordersRes = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION.PEDIDOS,
            [
                Query.greaterThanEqual('fecha_creacion', firstDay.toISOString()),
                Query.notEqual('estado', 'cancelado'),
                Query.limit(500),
            ]
        );

        const pedidos = ordersRes.documents as unknown as Pedido[];
        if (pedidos.length === 0) return null;

        // Get all items for these orders
        const itemPromises = pedidos.map((p) =>
            databases.listDocuments(DATABASE_ID, COLLECTION.PEDIDO_ITEMS, [
                Query.equal('pedido_id', p.$id),
                Query.limit(100),
            ])
        );

        const itemsResults = await Promise.all(itemPromises);
        const allItems = itemsResults.flatMap(
            (r) => r.documents as unknown as PedidoItem[]
        );

        // Count by product
        const counts: Record<string, number> = {};
        for (const item of allItems) {
            counts[item.producto_id] = (counts[item.producto_id] || 0) + item.cantidad;
        }

        const topId = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
        if (!topId) return null;

        // Get product name
        try {
            const product = await databases.getDocument(
                DATABASE_ID,
                COLLECTION.PRODUCTOS,
                topId[0]
            );
            return { nombre: product.nombre as string, count: topId[1] };
        } catch {
            return { nombre: 'Desconocido', count: topId[1] };
        }
    },

    async getPeakHours(): Promise<{ hour: number; count: number }[]> {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const res = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION.PEDIDOS,
            [
                Query.greaterThanEqual('fecha_creacion', thirtyDaysAgo.toISOString()),
                Query.notEqual('estado', 'cancelado'),
                Query.limit(1000),
            ]
        );

        const pedidos = res.documents as unknown as Pedido[];
        const hourCounts: Record<number, number> = {};

        for (const p of pedidos) {
            const hour = new Date(p.fecha_creacion).getHours();
            hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        }

        return Array.from({ length: 24 }, (_, i) => ({
            hour: i,
            count: hourCounts[i] || 0,
        }));
    },

    async getDailySales(days: number = 30): Promise<{ date: string; total: number; count: number }[]> {
        const now = new Date();
        const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

        const res = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION.PEDIDOS,
            [
                Query.greaterThanEqual('fecha_creacion', startDate.toISOString()),
                Query.notEqual('estado', 'cancelado'),
                Query.orderAsc('fecha_creacion'),
                Query.limit(1000),
            ]
        );

        const pedidos = res.documents as unknown as Pedido[];
        const dailyMap: Record<string, { total: number; count: number }> = {};

        for (const p of pedidos) {
            const date = new Date(p.fecha_creacion).toISOString().split('T')[0];
            if (!dailyMap[date]) dailyMap[date] = { total: 0, count: 0 };
            dailyMap[date].total += p.total;
            dailyMap[date].count += 1;
        }

        return Object.entries(dailyMap).map(([date, data]) => ({
            date,
            ...data,
        }));
    },

    async getOrdersByStatus(): Promise<{ estado: string; count: number }[]> {
        const states = ['nuevo', 'confirmado', 'en_preparacion', 'en_camino', 'entregado', 'cancelado'];
        const results = await Promise.all(
            states.map(async (estado) => {
                const res = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTION.PEDIDOS,
                    [Query.equal('estado', estado), Query.limit(1)]
                );
                return { estado, count: res.total };
            })
        );
        return results;
    },

    async getAllKPIs() {
        const [salesToday, salesMonth, avgTicket, totalOrders, topProduct, peakHours] =
            await Promise.all([
                this.getSalesToday(),
                this.getSalesMonth(),
                this.getAverageTicket(),
                this.getTotalOrders(),
                this.getTopProduct(),
                this.getPeakHours(),
            ]);

        const peakHour = peakHours.reduce(
            (max, h) => (h.count > max.count ? h : max),
            { hour: 0, count: 0 }
        );

        return {
            salesToday,
            salesMonth,
            avgTicket,
            totalOrders,
            topProduct,
            peakHour: `${peakHour.hour}:00`,
        };
    },
};
