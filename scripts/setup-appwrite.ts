/**
 * Idempotent Appwrite Setup Script
 * Creates database, collections, attributes, indexes, and storage buckets.
 * Safe to run multiple times — skips existing resources.
 */
import { Client, Databases, Storage, Permission, Role, IndexType } from 'node-appwrite';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const DATABASE_ID = 'jm_restaurant';
const BUCKET_ID = 'product-images';

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const storage = new Storage(client);

// ── Helpers ─────────────────────────────────────────────
async function ensureDatabase() {
    try {
        await databases.get(DATABASE_ID);
        console.log('✅ Database already exists');
    } catch {
        await databases.create(DATABASE_ID, 'JM Restaurant');
        console.log('✅ Database created');
    }
}

async function ensureCollection(
    id: string,
    name: string,
    permissions: string[] = [
        Permission.read(Role.any()),
        Permission.create(Role.any()), // Allow guests to create orders
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
    ]
) {
    try {
        await databases.getCollection(DATABASE_ID, id);
        console.log(`  ✅ Collection "${name}" already exists`);
    } catch {
        await databases.createCollection(DATABASE_ID, id, name, permissions, true);
        console.log(`  ✅ Collection "${name}" created`);
    }
}

type AttrType = 'string' | 'integer' | 'float' | 'boolean' | 'enum' | 'datetime';

interface AttrDef {
    key: string;
    type: AttrType;
    required?: boolean;
    size?: number;
    array?: boolean;
    elements?: string[];
    default?: unknown;
}

async function ensureAttribute(collectionId: string, attr: AttrDef) {
    try {
        await databases.getAttribute(DATABASE_ID, collectionId, attr.key);
        return; // already exists
    } catch {
        // create
    }

    const required = attr.required ?? false;
    const array = attr.array ?? false;

    switch (attr.type) {
        case 'string':
            await databases.createStringAttribute(
                DATABASE_ID,
                collectionId,
                attr.key,
                attr.size ?? 255,
                required,
                attr.default as string ?? undefined,
                array
            );
            break;
        case 'integer':
            await databases.createIntegerAttribute(
                DATABASE_ID,
                collectionId,
                attr.key,
                required,
                undefined,
                undefined,
                attr.default as number ?? undefined,
                array
            );
            break;
        case 'float':
            await databases.createFloatAttribute(
                DATABASE_ID,
                collectionId,
                attr.key,
                required,
                undefined,
                undefined,
                attr.default as number ?? undefined,
                array
            );
            break;
        case 'boolean':
            await databases.createBooleanAttribute(
                DATABASE_ID,
                collectionId,
                attr.key,
                required,
                attr.default as boolean ?? undefined,
                array
            );
            break;
        case 'enum':
            await databases.createEnumAttribute(
                DATABASE_ID,
                collectionId,
                attr.key,
                attr.elements ?? [],
                required,
                attr.default as string ?? undefined,
                array
            );
            break;
        case 'datetime':
            await databases.createDatetimeAttribute(
                DATABASE_ID,
                collectionId,
                attr.key,
                required,
                attr.default as string ?? undefined,
                array
            );
            break;
    }
    console.log(`    ✅ Attribute "${attr.key}" created`);
}

async function ensureIndex(
    collectionId: string,
    key: string,
    type: IndexType,
    attributes: string[],
    orders?: string[]
) {
    try {
        await databases.getIndex(DATABASE_ID, collectionId, key);
        return;
    } catch {
        await databases.createIndex(
            DATABASE_ID,
            collectionId,
            key,
            type,
            attributes,
            orders as any
        );
        console.log(`    ✅ Index "${key}" created`);
    }
}

async function ensureBucket() {
    try {
        await storage.getBucket(BUCKET_ID);
        console.log('✅ Bucket already exists');
    } catch {
        await storage.createBucket(
            BUCKET_ID,
            'Product Images',
            [
                Permission.read(Role.any()),
                Permission.create(Role.users()),
                Permission.update(Role.users()),
                Permission.delete(Role.users()),
            ],
            false,
            undefined,
            undefined,
            ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
        );
        console.log('✅ Bucket created');
    }
}

// Small delay between attribute creation to let Appwrite process
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ── Collection Definitions ──────────────────────────────
async function setupCollections() {
    // ── categorias ──
    await ensureCollection('categorias', 'Categorías');
    const categoriaAttrs: AttrDef[] = [
        { key: 'nombre', type: 'string', required: true, size: 100 },
        { key: 'orden', type: 'integer', required: false, default: 0 },
        { key: 'visible', type: 'boolean', required: false, default: true },
    ];
    for (const attr of categoriaAttrs) {
        await ensureAttribute('categorias', attr);
        await delay(500);
    }
    await delay(2000);
    await ensureIndex('categorias', 'idx_orden', IndexType.Key, ['orden']);
    await ensureIndex('categorias', 'idx_visible', IndexType.Key, ['visible']);

    // ── productos ──
    await ensureCollection('productos', 'Productos');
    const productoAttrs: AttrDef[] = [
        { key: 'nombre', type: 'string', required: true, size: 200 },
        { key: 'descripcion', type: 'string', required: false, size: 1000 },
        { key: 'precio', type: 'float', required: true },
        { key: 'categoria_id', type: 'string', required: true, size: 36 },
        { key: 'imagen_url', type: 'string', required: false, size: 500 },
        { key: 'disponible', type: 'boolean', required: false, default: true },
        { key: 'destacado', type: 'boolean', required: false, default: false },
        { key: 'etiquetas', type: 'string', array: true, size: 50 },
        { key: 'stock', type: 'integer', required: false, default: 0 },
        { key: 'ingredientes', type: 'string', array: true, size: 100 },
        { key: 'opciones', type: 'string', required: false, size: 5000 }, // JSON for variants
    ];
    for (const attr of productoAttrs) {
        await ensureAttribute('productos', attr);
        await delay(500);
    }
    await delay(2000);
    await ensureIndex('productos', 'idx_categoria_id', IndexType.Key, ['categoria_id']);
    await ensureIndex('productos', 'idx_disponible', IndexType.Key, ['disponible']);
    await ensureIndex('productos', 'idx_destacado', IndexType.Key, ['destacado']);

    // ── promociones ──
    await ensureCollection('promociones', 'Promociones');
    const promocionAttrs: AttrDef[] = [
        { key: 'tipo', type: 'enum', required: true, elements: ['porcentaje', 'monto_fijo', '2x1'] },
        { key: 'valor', type: 'float', required: true },
        { key: 'productos_aplicables', type: 'string', array: true, size: 36 },
        { key: 'fecha_inicio', type: 'datetime', required: true },
        { key: 'fecha_fin', type: 'datetime', required: true },
        { key: 'activa', type: 'boolean', required: false, default: true },
    ];
    for (const attr of promocionAttrs) {
        await ensureAttribute('promociones', attr);
        await delay(500);
    }
    await delay(2000);
    await ensureIndex('promociones', 'idx_fecha_inicio', IndexType.Key, ['fecha_inicio']);
    await ensureIndex('promociones', 'idx_fecha_fin', IndexType.Key, ['fecha_fin']);
    await ensureIndex('promociones', 'idx_activa', IndexType.Key, ['activa']);

    // ── pedidos ──
    await ensureCollection('pedidos', 'Pedidos');
    const pedidoAttrs: AttrDef[] = [
        { key: 'numero_pedido', type: 'string', required: true, size: 50 },
        { key: 'cliente_id', type: 'string', required: false, size: 36 },
        { key: 'subtotal', type: 'float', required: true },
        { key: 'impuestos', type: 'float', required: false, default: 0 },
        { key: 'envio', type: 'float', required: false, default: 0 },
        { key: 'descuento', type: 'float', required: false, default: 0 },
        { key: 'total', type: 'float', required: true },
        { key: 'estado', type: 'enum', required: true, elements: ['nuevo', 'confirmado', 'en_preparacion', 'en_camino', 'entregado', 'cancelado'] },
        { key: 'direccion_entrega', type: 'string', required: false, size: 500 },
        { key: 'metodo_pago', type: 'string', required: false, size: 50 },
        { key: 'fecha_creacion', type: 'datetime', required: true },
        { key: 'fecha_actualizacion', type: 'datetime', required: false },
    ];
    for (const attr of pedidoAttrs) {
        await ensureAttribute('pedidos', attr);
        await delay(500);
    }
    await delay(2000);
    await ensureIndex('pedidos', 'idx_estado', IndexType.Key, ['estado']);
    await ensureIndex('pedidos', 'idx_fecha_creacion', IndexType.Key, ['fecha_creacion']);
    await ensureIndex('pedidos', 'idx_numero_pedido', IndexType.Unique, ['numero_pedido']);

    // ── pedido_items ──
    await ensureCollection('pedido_items', 'Pedido Items');
    const pedidoItemAttrs: AttrDef[] = [
        { key: 'pedido_id', type: 'string', required: true, size: 36 },
        { key: 'producto_id', type: 'string', required: true, size: 36 },
        { key: 'cantidad', type: 'integer', required: true },
        { key: 'precio_unitario', type: 'float', required: true },
        { key: 'total_item', type: 'float', required: true },
    ];
    for (const attr of pedidoItemAttrs) {
        await ensureAttribute('pedido_items', attr);
        await delay(500);
    }
    await delay(2000);
    await ensureIndex('pedido_items', 'idx_pedido_id', IndexType.Key, ['pedido_id']);

    // ── favoritos ──
    await ensureCollection('favoritos', 'Favoritos');
    const favoritoAttrs: AttrDef[] = [
        { key: 'cliente_id', type: 'string', required: true, size: 36 },
        { key: 'producto_id', type: 'string', required: true, size: 36 },
    ];
    for (const attr of favoritoAttrs) {
        await ensureAttribute('favoritos', attr);
        await delay(500);
    }
    await delay(2000);
    await ensureIndex('favoritos', 'idx_cliente_id', IndexType.Key, ['cliente_id']);

    // ── eventos ──
    await ensureCollection('eventos', 'Eventos');
    const eventoAttrs: AttrDef[] = [
        { key: 'nombre', type: 'string', required: true, size: 200 },
        { key: 'descripcion', type: 'string', required: false, size: 1000 },
        { key: 'imagen', type: 'string', required: false, size: 500 },
        { key: 'color_tema', type: 'string', required: false, size: 7 },
        { key: 'fecha_inicio', type: 'datetime', required: true },
        { key: 'fecha_fin', type: 'datetime', required: true },
        { key: 'activo', type: 'boolean', required: false, default: false },
    ];
    for (const attr of eventoAttrs) {
        await ensureAttribute('eventos', attr);
        await delay(500);
    }
    await delay(2000);
    await ensureIndex('eventos', 'idx_activo', IndexType.Key, ['activo']);

    // ── notificaciones ──
    await ensureCollection('notificaciones', 'Notificaciones');
    const notificacionAttrs: AttrDef[] = [
        { key: 'usuario_id', type: 'string', required: true, size: 36 },
        { key: 'tipo', type: 'string', required: true, size: 50 },
        { key: 'titulo', type: 'string', required: true, size: 200 },
        { key: 'mensaje', type: 'string', required: false, size: 1000 },
        { key: 'leida', type: 'boolean', required: false, default: false },
        { key: 'fecha', type: 'datetime', required: true },
    ];
    for (const attr of notificacionAttrs) {
        await ensureAttribute('notificaciones', attr);
        await delay(500);
    }
    await delay(2000);
    await ensureIndex('notificaciones', 'idx_usuario_id', IndexType.Key, ['usuario_id']);

    // ── historial_estados ──
    await ensureCollection('historial_estados', 'Historial Estados');
    const historialAttrs: AttrDef[] = [
        { key: 'pedido_id', type: 'string', required: true, size: 36 },
        { key: 'estado_anterior', type: 'string', required: false, size: 50 },
        { key: 'estado_nuevo', type: 'string', required: true, size: 50 },
        { key: 'fecha', type: 'datetime', required: true },
        { key: 'cambiado_por', type: 'string', required: true, size: 36 },
    ];
    for (const attr of historialAttrs) {
        await ensureAttribute('historial_estados', attr);
        await delay(500);
    }
    await delay(2000);
    await ensureIndex('historial_estados', 'idx_pedido_id', IndexType.Key, ['pedido_id']);

    // ── configuracion ──
    await ensureCollection('configuracion', 'Configuración del Restaurante', [
        Permission.read(Role.any()),
        Permission.update(Role.users()), // Only admins/users update
    ]);
    const configAttrs: AttrDef[] = [
        { key: 'nombre', type: 'string', required: true, size: 100 },
        { key: 'direccion', type: 'string', required: false, size: 200 },
        { key: 'telefono', type: 'string', required: false, size: 20 },
        { key: 'email', type: 'string', required: false, size: 100 },
        { key: 'logo_url', type: 'string', required: false, size: 500 },
        { key: 'horarios', type: 'string', required: false, size: 1000 }, // JSON
        { key: 'redes_sociales', type: 'string', required: false, size: 1000 }, // JSON
    ];
    for (const attr of configAttrs) {
        await ensureAttribute('configuracion', attr);
        await delay(500);
    }
}

// ── Main ────────────────────────────────────────────────
async function main() {
    console.log('\n🚀 JM Restaurant — Appwrite Setup\n');

    if (!process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ||
        !process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ||
        !process.env.APPWRITE_API_KEY) {
        console.error('❌ Missing environment variables. Check .env.local');
        process.exit(1);
    }

    console.log(`Endpoint: ${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}`);
    console.log(`Project:  ${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}\n`);

    try {
        await ensureDatabase();
        await setupCollections();
        await ensureBucket();
        console.log('\n✅ Setup complete!\n');
    } catch (error) {
        console.error('\n❌ Setup failed:', error);
        process.exit(1);
    }
}

main();
