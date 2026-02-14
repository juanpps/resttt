import { Client, Account, Databases, Storage } from 'appwrite';

const client = new Client();

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export const DATABASE_ID = 'jm_restaurant';
export const BUCKET_PRODUCT_IMAGES = 'product-images';

export const COLLECTION = {
  CATEGORIAS: 'categorias',
  PRODUCTOS: 'productos',
  PROMOCIONES: 'promociones',
  PEDIDOS: 'pedidos',
  PEDIDO_ITEMS: 'pedido_items',
  FAVORITOS: 'favoritos',
  EVENTOS: 'eventos',
  NOTIFICACIONES: 'notificaciones',
  HISTORIAL_ESTADOS: 'historial_estados',
  CONFIGURACION: 'configuracion',
} as const;

export const appwriteService = {
  getCurrentUser: async () => {
    try {
      return await account.get();
    } catch {
      return null;
    }
  },
  login: async (email: string, password: string) => {
    return await account.createEmailPasswordSession(email, password);
  },
  logout: async () => {
    await account.deleteSession('current');
  },
};

export { client };
