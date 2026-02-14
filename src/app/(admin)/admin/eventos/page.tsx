'use client';

import { useEffect, useState } from 'react';
import { eventosService } from '@/services/eventos.service';
import type { Evento } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/Spinner';
import toast from 'react-hot-toast';

export default function EventosAdminPage() {
    const [events, setEvents] = useState<Evento[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState<Evento | null>(null);
    const [form, setForm] = useState({
        nombre: '',
        descripcion: '',
        color_tema: '#FF6B35',
        fecha_inicio: '',
        fecha_fin: '',
        activo: true,
    });

    const loadData = async () => {
        try {
            const data = await eventosService.list();
            setEvents(data);
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
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        setForm({
            nombre: '',
            descripcion: '',
            color_tema: '#FF6B35',
            fecha_inicio: now.toISOString().slice(0, 16),
            fecha_fin: tomorrow.toISOString().slice(0, 16),
            activo: true,
        });
        setShowModal(true);
    };

    const openEdit = (e: Evento) => {
        setEditing(e);
        setForm({
            nombre: e.nombre,
            descripcion: e.descripcion,
            color_tema: e.color_tema,
            fecha_inicio: new Date(e.fecha_inicio).toISOString().slice(0, 16),
            fecha_fin: new Date(e.fecha_fin).toISOString().slice(0, 16),
            activo: e.activo,
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const data = {
                nombre: form.nombre,
                descripcion: form.descripcion,
                imagen: editing?.imagen ?? '',
                color_tema: form.color_tema,
                fecha_inicio: new Date(form.fecha_inicio).toISOString(),
                fecha_fin: new Date(form.fecha_fin).toISOString(),
                activo: form.activo,
            };

            if (editing) {
                await eventosService.update(editing.$id, data);
                toast.success('Evento actualizado');
            } else {
                await eventosService.create(data as Omit<Evento, '$id' | '$createdAt' | '$updatedAt'>);
                toast.success('Evento creado');
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
        if (!confirm('¿Eliminar este evento?')) return;
        try {
            await eventosService.delete(id);
            toast.success('Evento eliminado');
            loadData();
        } catch {
            toast.error('Error al eliminar');
        }
    };

    if (loading) return <PageLoader />;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-secondary-900)]">Eventos</h1>
                    <p className="text-sm text-[var(--color-secondary-500)]">Gestiona campañas y eventos especiales</p>
                </div>
                <Button onClick={openCreate}>+ Nuevo Evento</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {events.map((ev) => (
                    <Card key={ev.$id} className="relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: ev.color_tema }} />
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <h3 className="font-bold text-[var(--color-secondary-900)]">{ev.nombre}</h3>
                                <p className="text-sm text-[var(--color-secondary-500)]">{ev.descripcion}</p>
                            </div>
                            <Badge variant={ev.activo ? 'success' : 'error'} dot>
                                {ev.activo ? 'Activo' : 'Inactivo'}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2 mb-4 text-xs text-[var(--color-secondary-400)]">
                            <span>📅 {new Date(ev.fecha_inicio).toLocaleDateString('es')}</span>
                            <span>→</span>
                            <span>{new Date(ev.fecha_fin).toLocaleDateString('es')}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-xs text-[var(--color-secondary-500)]">Color tema:</span>
                            <div className="w-6 h-6 rounded-md border" style={{ backgroundColor: ev.color_tema }} />
                        </div>
                        <div className="flex gap-2">
                            <Button size="sm" variant="ghost" onClick={() => openEdit(ev)} className="flex-1">Editar</Button>
                            <Button size="sm" variant="danger" onClick={() => handleDelete(ev.$id)}>Eliminar</Button>
                        </div>
                    </Card>
                ))}
                {events.length === 0 && (
                    <div className="col-span-full text-center py-12 text-[var(--color-secondary-400)]">
                        No hay eventos creados
                    </div>
                )}
            </div>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Editar Evento' : 'Nuevo Evento'}>
                <div className="space-y-4">
                    <Input label="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
                    <Textarea label="Descripción" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
                    <div className="flex items-center gap-3">
                        <Input label="Color Tema" type="color" value={form.color_tema} onChange={(e) => setForm({ ...form, color_tema: e.target.value })} className="!w-16 !h-10 !p-1" />
                        <div className="flex-1 h-10 rounded-lg" style={{ backgroundColor: form.color_tema }} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Fecha Inicio" type="datetime-local" value={form.fecha_inicio} onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })} />
                        <Input label="Fecha Fin" type="datetime-local" value={form.fecha_fin} onChange={(e) => setForm({ ...form, fecha_fin: e.target.value })} />
                    </div>
                    <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={form.activo} onChange={(e) => setForm({ ...form, activo: e.target.checked })} className="rounded" />
                        Activo
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
