import { databases, DATABASE_ID, COLLECTION } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';

export interface Configuracion {
    $id: string;
    nombre: string;
    direccion?: string;
    telefono?: string;
    email?: string;
    logo_url?: string;
    horarios?: string; // JSON
    redes_sociales?: string; // JSON
}

export const configuracionService = {
    async get(): Promise<Configuracion | null> {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION.CONFIGURACION,
                [Query.limit(1)]
            );
            return (response.documents[0] as unknown as Configuracion) || null;
        } catch (error) {
            console.error('Error fetching config:', error);
            return null;
        }
    },

    async update(data: Partial<Omit<Configuracion, '$id'>>) {
        const current = await this.get();
        if (current) {
            return await databases.updateDocument(
                DATABASE_ID,
                COLLECTION.CONFIGURACION,
                current.$id,
                data
            );
        } else {
            return await databases.createDocument(
                DATABASE_ID,
                COLLECTION.CONFIGURACION,
                ID.unique(),
                data
            );
        }
    }
};
