import { databases, DATABASE_ID, COLLECTION } from '@/lib/appwrite';
import { Query, ID } from 'appwrite';
import type { Promocion, TipoPromocion, CartItem } from '@/types';

export const promocionesService = {
    async list(): Promise<Promocion[]> {
        const res = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION.PROMOCIONES,
            [Query.limit(100)]
        );
        return res.documents as unknown as Promocion[];
    },

    async listActive(): Promise<Promocion[]> {
        const now = new Date().toISOString();
        const res = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION.PROMOCIONES,
            [
                Query.equal('activa', true),
                Query.lessThanEqual('fecha_inicio', now),
                Query.greaterThanEqual('fecha_fin', now),
                Query.limit(100),
            ]
        );
        return res.documents as unknown as Promocion[];
    },

    async get(id: string): Promise<Promocion> {
        const doc = await databases.getDocument(DATABASE_ID, COLLECTION.PROMOCIONES, id);
        return doc as unknown as Promocion;
    },

    async create(data: Omit<Promocion, '$id' | '$createdAt' | '$updatedAt'>): Promise<Promocion> {
        const doc = await databases.createDocument(
            DATABASE_ID,
            COLLECTION.PROMOCIONES,
            ID.unique(),
            data
        );
        return doc as unknown as Promocion;
    },

    async update(id: string, data: Partial<Promocion>): Promise<Promocion> {
        const doc = await databases.updateDocument(
            DATABASE_ID,
            COLLECTION.PROMOCIONES,
            id,
            data
        );
        return doc as unknown as Promocion;
    },

    async delete(id: string): Promise<void> {
        await databases.deleteDocument(DATABASE_ID, COLLECTION.PROMOCIONES, id);
    },

    async toggleActive(id: string, activa: boolean): Promise<Promocion> {
        return this.update(id, { activa });
    },

    /**
     * Calculate discount for a set of cart items based on active promotions
     */
    calculateDiscount(
        items: CartItem[],
        promotions: Promocion[]
    ): { discount: number; appliedPromotions: Promocion[] } {
        let totalDiscount = 0;
        const appliedPromotions: Promocion[] = [];

        for (const promo of promotions) {
            const now = new Date();
            const start = new Date(promo.fecha_inicio);
            const end = new Date(promo.fecha_fin);
            if (!promo.activa || now < start || now > end) continue;

            const applicableItems = items.filter(
                (item) =>
                    promo.productos_aplicables.length === 0 ||
                    promo.productos_aplicables.includes(item.producto.$id)
            );

            if (applicableItems.length === 0) continue;

            let discount = 0;
            switch (promo.tipo as TipoPromocion) {
                case 'porcentaje': {
                    const subtotal = applicableItems.reduce(
                        (acc, item) => acc + item.producto.precio * item.cantidad, 0
                    );
                    discount = subtotal * (promo.valor / 100);
                    break;
                }
                case 'monto_fijo': {
                    discount = promo.valor;
                    break;
                }
                case '2x1': {
                    for (const item of applicableItems) {
                        const freeItems = Math.floor(item.cantidad / 2);
                        discount += freeItems * item.producto.precio;
                    }
                    break;
                }
            }

            if (discount > 0) {
                totalDiscount += discount;
                appliedPromotions.push(promo);
            }
        }

        return { discount: totalDiscount, appliedPromotions };
    },
};
