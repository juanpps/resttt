
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { productosService } from '@/services/productos.service';
import { categoriasService } from '@/services/categorias.service';
import type { Producto, Categoria } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/Spinner';
import toast from 'react-hot-toast';

export default function ProductosAdminPage() {
    const [products, setProducts] = useState<Producto[]>([]);
    const [categories, setCategories] = useState<Categoria[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            const [prods, cats] = await Promise.all([
                productosService.list(),
                categoriasService.list(),
            ]);
            setProducts(prods);
            setCategories(cats);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('¿Eliminar este producto?')) return;
        try {
            await productosService.delete(id);
            toast.success('Producto eliminado');
            loadData();
        } catch {
            toast.error('Error al eliminar');
        }
    };

    const handleToggle = async (id: string, field: 'disponible' | 'destacado', value: boolean) => {
        try {
            if (field === 'disponible') {
                await productosService.toggleAvailability(id, value);
            } else {
                await productosService.toggleFeatured(id, value);
            }
            loadData();
        } catch {
            toast.error('Error al actualizar');
        }
    };

    if (loading) return <PageLoader />;

    const catMap = Object.fromEntries(categories.map((c) => [c.$id, c.nombre]));

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-secondary-900)]">Productos</h1>
                    <p className="text-sm text-[var(--color-secondary-500)]">{products.length} productos</p>
                </div>
                <Link href="/admin/productos/nuevo">
                    <Button>+ Nuevo Producto</Button>
                </Link>
            </div>

            {/* Table */}
            <Card padding="none">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-[var(--color-secondary-100)] bg-[var(--color-secondary-50)]">
                                <th className="text-left p-3 font-medium text-[var(--color-secondary-500)]">Nombre</th>
                                <th className="text-left p-3 font-medium text-[var(--color-secondary-500)]">Categoría</th>
                                <th className="text-right p-3 font-medium text-[var(--color-secondary-500)]">Precio</th>
                                <th className="text-right p-3 font-medium text-[var(--color-secondary-500)]">Stock</th>
                                <th className="text-center p-3 font-medium text-[var(--color-secondary-500)]">Estado</th>
                                <th className="text-center p-3 font-medium text-[var(--color-secondary-500)]">Destacado</th>
                                <th className="text-right p-3 font-medium text-[var(--color-secondary-500)]">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-secondary-50)]">
                            {products.map((prod) => (
                                <tr key={prod.$id} className="hover:bg-[var(--color-secondary-50)] transition-colors">
                                    <td className="p-3 font-medium text-[var(--color-secondary-900)]">{prod.nombre}</td>
                                    <td className="p-3 text-[var(--color-secondary-500)]">{catMap[prod.categoria_id] || '—'}</td>
                                    <td className="p-3 text-right font-medium">${prod.precio.toLocaleString()}</td>
                                    <td className="p-3 text-right">
                                        <span className={prod.stock <= 5 ? 'text-[var(--color-warning)] font-bold' : ''}>
                                            {prod.stock}
                                        </span>
                                    </td>
                                    <td className="p-3 text-center">
                                        <button onClick={() => handleToggle(prod.$id, 'disponible', !prod.disponible)}>
                                            <Badge variant={prod.disponible ? 'success' : 'error'}>
                                                {prod.disponible ? 'Activo' : 'Inactivo'}
                                            </Badge>
                                        </button>
                                    </td>
                                    <td className="p-3 text-center">
                                        <button onClick={() => handleToggle(prod.$id, 'destacado', !prod.destacado)}>
                                            {prod.destacado ? '⭐' : '☆'}
                                        </button>
                                    </td>
                                    <td className="p-3 text-right">
                                        <div className="flex gap-1 justify-end">
                                            <Link href={`/admin/productos/${prod.$id}`}>
                                                <Button size="sm" variant="ghost">Editar</Button>
                                            </Link>
                                            <Button size="sm" variant="danger" onClick={() => handleDelete(prod.$id)}>Eliminar</Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
