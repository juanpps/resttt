import { databases, DATABASE_ID, COLLECTION } from '@/lib/appwrite';
import { Query, ID } from 'appwrite';
import type { Favorito } from '@/types';

export const favoritosService = {
    async list(clienteId: string): Promise<Favorito[]> {
        const res = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION.FAVORITOS,
            [Query.equal('cliente_id', clienteId), Query.limit(100)]
        );
        return res.documents as unknown as Favorito[];
    },

    async toggle(clienteId: string, productoId: string): Promise<boolean> {
        // Check if already favorited
        const existing = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION.FAVORITOS,
            [
                Query.equal('cliente_id', clienteId),
                Query.equal('producto_id', productoId),
                Query.limit(1),
            ]
        );

        if (existing.documents.length > 0) {
            await databases.deleteDocument(
                DATABASE_ID,
                COLLECTION.FAVORITOS,
                existing.documents[0].$id
            );
            return false; // removed
        } else {
            await databases.createDocument(
                DATABASE_ID,
                COLLECTION.FAVORITOS,
                ID.unique(),
                { cliente_id: clienteId, producto_id: productoId }
            );
            return true; // added
        }
    },

    async isFavorite(clienteId: string, productoId: string): Promise<boolean> {
        const res = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION.FAVORITOS,
            [
                Query.equal('cliente_id', clienteId),
                Query.equal('producto_id', productoId),
                Query.limit(1),
            ]
        );
        return res.documents.length > 0;
    },
};
