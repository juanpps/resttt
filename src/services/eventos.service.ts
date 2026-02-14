import { databases, DATABASE_ID, COLLECTION } from '@/lib/appwrite';
import { Query, ID } from 'appwrite';
import type { Evento } from '@/types';

export const eventosService = {
    async list(): Promise<Evento[]> {
        const res = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION.EVENTOS,
            [Query.limit(100)]
        );
        return res.documents as unknown as Evento[];
    },

    async getActive(): Promise<Evento | null> {
        const now = new Date().toISOString();
        const res = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION.EVENTOS,
            [
                Query.equal('activo', true),
                Query.lessThanEqual('fecha_inicio', now),
                Query.greaterThanEqual('fecha_fin', now),
                Query.limit(1),
            ]
        );
        return res.documents.length > 0
            ? (res.documents[0] as unknown as Evento)
            : null;
    },

    async get(id: string): Promise<Evento> {
        const doc = await databases.getDocument(DATABASE_ID, COLLECTION.EVENTOS, id);
        return doc as unknown as Evento;
    },

    async create(data: Omit<Evento, '$id' | '$createdAt' | '$updatedAt'>): Promise<Evento> {
        const doc = await databases.createDocument(
            DATABASE_ID,
            COLLECTION.EVENTOS,
            ID.unique(),
            data
        );
        return doc as unknown as Evento;
    },

    async update(id: string, data: Partial<Evento>): Promise<Evento> {
        const doc = await databases.updateDocument(
            DATABASE_ID,
            COLLECTION.EVENTOS,
            id,
            data
        );
        return doc as unknown as Evento;
    },

    async delete(id: string): Promise<void> {
        await databases.deleteDocument(DATABASE_ID, COLLECTION.EVENTOS, id);
    },

    async toggleActive(id: string, activo: boolean): Promise<Evento> {
        return this.update(id, { activo });
    },
};
