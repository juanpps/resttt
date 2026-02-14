'use client';

import { useEffect, useState } from 'react';
import { categoriasService } from '@/services/categorias.service';
import type { Categoria } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/Spinner';
import { categoriaSchema } from '@/lib/validations';
import toast from 'react-hot-toast';

export default function CategoriasAdminPage() {
    const [categories, setCategories] = useState<Categoria[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState<Categoria | null>(null);
    const [form, setForm] = useState({ nombre: '', orden: '0', visible: true });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const loadData = async () => {
        try {
            const cats = await categoriasService.list();
            setCategories(cats);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const openCreate = () => {
        setEditing(null);
        setForm({ nombre: '', orden: String(categories.length), visible: true });
        setErrors({});
        setShowModal(true);
    };

    const openEdit = (c: Categoria) => {
        setEditing(c);
        setForm({ nombre: c.nombre, orden: String(c.orden), visible: c.visible });
        setErrors({});
        setShowModal(true);
    };

    const handleSave = async () => {
        const data = { nombre: form.nombre, orden: Number(form.orden), visible: form.visible };
        const result = categoriaSchema.safeParse(data);
        if (!result.success) {
            const errs: Record<string, string> = {};
            result.error.issues.forEach((e) => { if (e.path[0]) errs[String(e.path[0])] = e.message; });
            setErrors(errs);
            return;
        }

        setSaving(true);
        try {
            if (editing) {
                await categoriasService.update(editing.$id, result.data);
                toast.success('Categoría actualizada');
            } else {
                await categoriasService.create(result.data);
                toast.success('Categoría creada');
            }
            setShowModal(false);
            loadData();
        } catch {
            toast.error('Error al guardar');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Eliminar esta categoría?')) return;
        try {
            await categoriasService.delete(id);
            toast.success('Categoría eliminada');
            loadData();
        } catch {
            toast.error('Error al eliminar');
        }
    };

    const handleToggleVisible = async (id: string, visible: boolean) => {
        try {
            await categoriasService.toggleVisibility(id, visible);
            loadData();
        } catch {
            toast.error('Error');
        }
    };

    const moveCategory = async (index: number, direction: 'up' | 'down') => {
        const newOrder = [...categories];
        const swapIdx = direction === 'up' ? index - 1 : index + 1;
        if (swapIdx < 0 || swapIdx >= newOrder.length) return;
        [newOrder[index], newOrder[swapIdx]] = [newOrder[swapIdx], newOrder[index]];
        const reorderItems = newOrder.map((c, i) => ({ id: c.$id, orden: i }));
        try {
            await categoriasService.reorder(reorderItems);
            loadData();
        } catch {
            toast.error('Error al reordenar');
        }
    };

    if (loading) return <PageLoader />;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-secondary-900)]">Categorías</h1>
                    <p className="text-sm text-[var(--color-secondary-500)]">{categories.length} categorías</p>
                </div>
                <Button onClick={openCreate}>+ Nueva Categoría</Button>
            </div>

            <Card padding="none">
                <div className="divide-y divide-[var(--color-secondary-50)]">
                    {categories.map((cat, idx) => (
                        <div key={cat.$id} className="px-4 py-3 flex items-center justify-between hover:bg-[var(--color-secondary-50)] transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="flex flex-col gap-0.5">
                                    <button onClick={() => moveCategory(idx, 'up')} disabled={idx === 0} className="text-xs text-[var(--color-secondary-400)] hover:text-[var(--color-secondary-700)] disabled:opacity-30">▲</button>
                                    <button onClick={() => moveCategory(idx, 'down')} disabled={idx === categories.length - 1} className="text-xs text-[var(--color-secondary-400)] hover:text-[var(--color-secondary-700)] disabled:opacity-30">▼</button>
                                </div>
                                <div>
                                    <span className="font-medium text-[var(--color-secondary-900)]">{cat.nombre}</span>
                                    <span className="ml-2 text-xs text-[var(--color-secondary-400)]">Orden: {cat.orden}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={() => handleToggleVisible(cat.$id, !cat.visible)}>
                                    <Badge variant={cat.visible ? 'success' : 'error'}>
                                        {cat.visible ? 'Visible' : 'Oculta'}
                                    </Badge>
                                </button>
                                <Button size="sm" variant="ghost" onClick={() => openEdit(cat)}>Editar</Button>
                                <Button size="sm" variant="danger" onClick={() => handleDelete(cat.$id)}>Eliminar</Button>
                            </div>
                        </div>
                    ))}
                    {categories.length === 0 && (
                        <div className="p-8 text-center text-[var(--color-secondary-400)]">No hay categorías</div>
                    )}
                </div>
            </Card>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Editar Categoría' : 'Nueva Categoría'}>
                <div className="space-y-4">
                    <Input label="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} error={errors.nombre} />
                    <Input label="Orden" type="number" value={form.orden} onChange={(e) => setForm({ ...form, orden: e.target.value })} />
                    <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={form.visible} onChange={(e) => setForm({ ...form, visible: e.target.checked })} className="rounded" />
                        Visible en menú público
                    </label>
                    <div className="flex gap-3 pt-4">
                        <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1">Cancelar</Button>
                        <Button onClick={handleSave} loading={saving} className="flex-1">{editing ? 'Guardar' : 'Crear'}</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
