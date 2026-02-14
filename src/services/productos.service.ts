import { databases, storage, DATABASE_ID, COLLECTION, BUCKET_PRODUCT_IMAGES } from '@/lib/appwrite';
import { Query, ID } from 'appwrite';
import type { Producto } from '@/types';

export const productosService = {
    async list(filters?: {
        categoriaId?: string;
        disponible?: boolean;
        destacado?: boolean;
        search?: string;
    }): Promise<Producto[]> {
        const queries: string[] = [Query.limit(100)];

        if (filters?.categoriaId) {
            queries.push(Query.equal('categoria_id', filters.categoriaId));
        }
        if (filters?.disponible !== undefined) {
            queries.push(Query.equal('disponible', filters.disponible));
        }
        if (filters?.destacado !== undefined) {
            queries.push(Query.equal('destacado', filters.destacado));
        }
        if (filters?.search) {
            queries.push(Query.search('nombre', filters.search));
        }

        const res = await databases.listDocuments(DATABASE_ID, COLLECTION.PRODUCTOS, queries);
        return res.documents as unknown as Producto[];
    },

    async listAvailable(): Promise<Producto[]> {
        return this.list({ disponible: true });
    },

    async listFeatured(): Promise<Producto[]> {
        return this.list({ disponible: true, destacado: true });
    },

    async get(id: string): Promise<Producto> {
        const doc = await databases.getDocument(DATABASE_ID, COLLECTION.PRODUCTOS, id);
        return doc as unknown as Producto;
    },

    async create(data: Omit<Producto, '$id' | '$createdAt' | '$updatedAt'>): Promise<Producto> {
        const doc = await databases.createDocument(
            DATABASE_ID,
            COLLECTION.PRODUCTOS,
            ID.unique(),
            data
        );
        return doc as unknown as Producto;
    },

    async update(id: string, data: Partial<Producto>): Promise<Producto> {
        const doc = await databases.updateDocument(
            DATABASE_ID,
            COLLECTION.PRODUCTOS,
            id,
            data
        );
        return doc as unknown as Producto;
    },

    async delete(id: string): Promise<void> {
        await databases.deleteDocument(DATABASE_ID, COLLECTION.PRODUCTOS, id);
    },

    async uploadImage(file: File): Promise<string> {
        const result = await storage.createFile(BUCKET_PRODUCT_IMAGES, ID.unique(), file);
        const url = storage.getFilePreview(BUCKET_PRODUCT_IMAGES, result.$id, 800, 600);
        return url.toString();
    },

    async toggleAvailability(id: string, disponible: boolean): Promise<Producto> {
        return this.update(id, { disponible });
    },

    async toggleFeatured(id: string, destacado: boolean): Promise<Producto> {
        return this.update(id, { destacado });
    },

    async updateStock(id: string, stock: number): Promise<Producto> {
        return this.update(id, { stock, disponible: stock > 0 });
    },
};
