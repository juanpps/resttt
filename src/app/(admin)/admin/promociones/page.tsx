'use client';

import { useEffect, useState } from 'react';
import { promocionesService } from '@/services/promociones.service';
import type { Promocion } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/Spinner';
import toast from 'react-hot-toast';

export default function PromocionesAdminPage() {
    const [promos, setPromos] = useState<Promocion[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState<Promocion | null>(null);
    const [form, setForm] = useState({
        tipo: 'porcentaje',
        valor: '',
        fecha_inicio: '',
        fecha_fin: '',
        activa: true,
    });

    const loadData = async () => {
        try {
            const data = await promocionesService.list();
            setPromos(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const openCreate = () => {
        setEditing(null);
        const now = new Date();
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        setForm({
            tipo: 'porcentaje',
            valor: '',
            fecha_inicio: now.toISOString().slice(0, 16),
            fecha_fin: nextWeek.toISOString().slice(0, 16),
            activa: true,
        });
        setShowModal(true);
    };

    const openEdit = (p: Promocion) => {
        setEditing(p);
        setForm({
            tipo: p.tipo,
            valor: String(p.valor),
            fecha_inicio: new Date(p.fecha_inicio).toISOString().slice(0, 16),
            fecha_fin: new Date(p.fecha_fin).toISOString().slice(0, 16),
            activa: p.activa,
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const data = {
                tipo: form.tipo as import('@/types').TipoPromocion,
                valor: Number(form.valor),
                productos_aplicables: editing?.productos_aplicables ?? [],
                fecha_inicio: new Date(form.fecha_inicio).toISOString(),
                fecha_fin: new Date(form.fecha_fin).toISOString(),
                activa: form.activa,
            };

            if (editing) {
                await promocionesService.update(editing.$id, data);
                toast.success('Promoción actualizada');
            } else {
                await promocionesService.create(data as Omit<Promocion, '$id' | '$createdAt' | '$updatedAt'>);
                toast.success('Promoción creada');
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
        if (!confirm('¿Eliminar esta promoción?')) return;
        try {
            await promocionesService.delete(id);
            toast.success('Promoción eliminada');
            loadData();
        } catch {
            toast.error('Error al eliminar');
        }
    };

    const getTypeLabel = (tipo: string) => {
        switch (tipo) {
            case 'porcentaje': return '% Descuento';
            case 'monto_fijo': return '$ Fijo';
            case '2x1': return '2x1';
            default: return tipo;
        }
    };

    const isActive = (p: Promocion) => {
        const now = Date.now();
        return p.activa && new Date(p.fecha_inicio).getTime() <= now && new Date(p.fecha_fin).getTime() >= now;
    };

    if (loading) return <PageLoader />;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-secondary-900)]">Promociones</h1>
                    <p className="text-sm text-[var(--color-secondary-500)]">{promos.length} promociones</p>
                </div>
                <Button onClick={openCreate}>+ Nueva Promoción</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {promos.map((p) => (
                    <Card key={p.$id} className="relative">
                        <div className="flex items-start justify-between mb-3">
                            <Badge variant={isActive(p) ? 'success' : 'error'} dot>
                                {isActive(p) ? 'Activa' : 'Inactiva'}
                            </Badge>
                            <span className="text-2xl font-bold text-[var(--color-primary-500)]">
                                {p.tipo === 'porcentaje' ? `${p.valor}%` : p.tipo === '2x1' ? '2x1' : `$${p.valor}`}
                            </span>
                        </div>
                        <p className="text-sm font-medium text-[var(--color-secondary-700)] mb-1">
                            {getTypeLabel(p.tipo)}
                        </p>
                        <p className="text-xs text-[var(--color-secondary-400)] mb-4">
                            {new Date(p.fecha_inicio).toLocaleDateString('es')} — {new Date(p.fecha_fin).toLocaleDateString('es')}
                        </p>
                        <div className="flex gap-2">
                            <Button size="sm" variant="ghost" onClick={() => openEdit(p)} className="flex-1">Editar</Button>
                            <Button size="sm" variant="danger" onClick={() => handleDelete(p.$id)}>Eliminar</Button>
                        </div>
                    </Card>
                ))}
                {promos.length === 0 && (
                    <div className="col-span-full text-center py-12 text-[var(--color-secondary-400)]">
                        No hay promociones creadas
                    </div>
                )}
            </div>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Editar Promoción' : 'Nueva Promoción'}>
                <div className="space-y-4">
                    <Select
                        label="Tipo"
                        value={form.tipo}
                        onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                        options={[
                            { value: 'porcentaje', label: '% Descuento' },
                            { value: 'monto_fijo', label: '$ Monto Fijo' },
                            { value: '2x1', label: '2x1' },
                        ]}
                    />
                    {form.tipo !== '2x1' && (
                        <Input
                            label={form.tipo === 'porcentaje' ? 'Porcentaje (%)' : 'Monto ($)'}
                            type="number"
                            value={form.valor}
                            onChange={(e) => setForm({ ...form, valor: e.target.value })}
                        />
                    )}
                    <Input label="Fecha Inicio" type="datetime-local" value={form.fecha_inicio} onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })} />
                    <Input label="Fecha Fin" type="datetime-local" value={form.fecha_fin} onChange={(e) => setForm({ ...form, fecha_fin: e.target.value })} />
                    <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={form.activa} onChange={(e) => setForm({ ...form, activa: e.target.checked })} className="rounded" />
                        Activa
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
