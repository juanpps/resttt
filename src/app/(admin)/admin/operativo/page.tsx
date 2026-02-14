'use client';

import { useEffect, useState } from 'react';
import { pedidosService } from '@/services/pedidos.service';
import type { Pedido, EstadoPedido } from '@/types';
import { ESTADO_LABELS, ESTADO_COLORS, VALID_TRANSITIONS } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageLoader } from '@/components/ui/Spinner';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const KANBAN_STATES: EstadoPedido[] = [
    'nuevo',
    'confirmado',
    'en_preparacion',
    'en_camino',
    'entregado',
];

export default function OperativoPage() {
    const [orders, setOrders] = useState<Pedido[]>([]);
    const [loading, setLoading] = useState(true);

    const loadOrders = async () => {
        try {
            const data = await pedidosService.listByStatus();
            setOrders(data);
        } catch (err) {
            console.error('Error loading orders:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
        const interval = setInterval(loadOrders, 15000);
        return () => clearInterval(interval);
    }, []);

    const handleTransition = async (
        pedidoId: string,
        nuevoEstado: EstadoPedido
    ) => {
        try {
            await pedidosService.updateEstado(pedidoId, nuevoEstado, 'admin');
            toast.success(`Pedido actualizado a: ${ESTADO_LABELS[nuevoEstado]}`);
            loadOrders();
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Error actualizando pedido');
        }
    };

    if (loading) return <PageLoader />;

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[var(--color-secondary-900)]">
                    Kanban de Pedidos
                </h1>
                <p className="text-sm text-[var(--color-secondary-500)]">
                    Gestiona el flujo de pedidos en tiempo real
                </p>
            </div>

            <div className="grid grid-cols-5 gap-4 min-h-[70vh]">
                {KANBAN_STATES.map((state) => {
                    const stateOrders = orders.filter((o) => o.estado === state);
                    const color = ESTADO_COLORS[state];

                    return (
                        <div
                            key={state}
                            className="bg-[var(--color-secondary-50)] rounded-xl p-3"
                        >
                            {/* Column Header */}
                            <div className="flex items-center gap-2 mb-3 px-1">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: color }}
                                />
                                <h2 className="text-sm font-semibold text-[var(--color-secondary-700)]">
                                    {ESTADO_LABELS[state]}
                                </h2>
                                <span className="ml-auto text-xs bg-white rounded-full px-2 py-0.5 font-medium text-[var(--color-secondary-500)]">
                                    {stateOrders.length}
                                </span>
                            </div>

                            {/* Cards */}
                            <div className="space-y-2 max-h-[65vh] overflow-y-auto">
                                <AnimatePresence>
                                    {stateOrders.map((order) => {
                                        const nextStates = VALID_TRANSITIONS[state];
                                        return (
                                            <motion.div
                                                key={order.$id}
                                                layout
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                            >
                                                <Card className="!p-3">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <span className="font-bold text-sm">
                                                            #{order.numero_pedido}
                                                        </span>
                                                        <span className="text-xs text-[var(--color-secondary-400)]">
                                                            {new Date(order.fecha_creacion).toLocaleTimeString(
                                                                'es',
                                                                { hour: '2-digit', minute: '2-digit' }
                                                            )}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm font-semibold text-[var(--color-primary-500)] mb-2">
                                                        ${order.total.toLocaleString()}
                                                    </p>
                                                    <p className="text-xs text-[var(--color-secondary-500)] mb-3">
                                                        {order.metodo_pago}
                                                    </p>

                                                    {/* Action Buttons */}
                                                    <div className="flex gap-1 flex-wrap">
                                                        {nextStates.map((nextState) => (
                                                            <Button
                                                                key={nextState}
                                                                size="sm"
                                                                variant={
                                                                    nextState === 'cancelado' ? 'danger' : 'primary'
                                                                }
                                                                onClick={() =>
                                                                    handleTransition(order.$id, nextState)
                                                                }
                                                                className="text-xs !px-2 !py-1"
                                                            >
                                                                {nextState === 'cancelado'
                                                                    ? '✕'
                                                                    : ESTADO_LABELS[nextState]}
                                                            </Button>
                                                        ))}
                                                    </div>
                                                </Card>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
