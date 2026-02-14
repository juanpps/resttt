import { databases, DATABASE_ID, COLLECTION } from '@/lib/appwrite';
import { Query, ID } from 'appwrite';
import type { Categoria } from '@/types';

export const categoriasService = {
    async list(): Promise<Categoria[]> {
        const res = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION.CATEGORIAS,
            [Query.orderAsc('orden'), Query.limit(100)]
        );
        return res.documents as unknown as Categoria[];
    },

    async listVisible(): Promise<Categoria[]> {
        const res = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION.CATEGORIAS,
            [Query.equal('visible', true), Query.orderAsc('orden'), Query.limit(100)]
        );
        return res.documents as unknown as Categoria[];
    },

    async get(id: string): Promise<Categoria> {
        const doc = await databases.getDocument(DATABASE_ID, COLLECTION.CATEGORIAS, id);
        return doc as unknown as Categoria;
    },

    async create(data: Omit<Categoria, '$id' | '$createdAt' | '$updatedAt'>): Promise<Categoria> {
        const doc = await databases.createDocument(
            DATABASE_ID,
            COLLECTION.CATEGORIAS,
            ID.unique(),
            data
        );
        return doc as unknown as Categoria;
    },

    async update(id: string, data: Partial<Categoria>): Promise<Categoria> {
        const doc = await databases.updateDocument(
            DATABASE_ID,
            COLLECTION.CATEGORIAS,
            id,
            data
        );
        return doc as unknown as Categoria;
    },

    async delete(id: string): Promise<void> {
        await databases.deleteDocument(DATABASE_ID, COLLECTION.CATEGORIAS, id);
    },

    async reorder(items: { id: string; orden: number }[]): Promise<void> {
        await Promise.all(
            items.map((item) =>
                databases.updateDocument(DATABASE_ID, COLLECTION.CATEGORIAS, item.id, {
                    orden: item.orden,
                })
            )
        );
    },

    async toggleVisibility(id: string, visible: boolean): Promise<Categoria> {
        return this.update(id, { visible });
    },
};
