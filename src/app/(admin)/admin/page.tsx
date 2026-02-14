'use client';

import { useEffect, useState } from 'react';
import { analyticsService } from '@/services/analytics.service';
import { pedidosService } from '@/services/pedidos.service';
import { StatCard, Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/Spinner';
import type { Pedido, EstadoPedido } from '@/types';
import { ESTADO_LABELS } from '@/types';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function AdminDashboard() {
    const [kpis, setKpis] = useState<Awaited<ReturnType<typeof analyticsService.getAllKPIs>> | null>(null);
    const [recentOrders, setRecentOrders] = useState<Pedido[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [kpiData, orders] = await Promise.all([
                    analyticsService.getAllKPIs(),
                    pedidosService.listByStatus(),
                ]);
                setKpis(kpiData);
                setRecentOrders(orders.slice(0, 10));
            } catch (err) {
                console.error('Error loading dashboard:', err);
            } finally {
                setLoading(false);
            }
        };
        load();

        // Auto-refresh every 30s
        const interval = setInterval(load, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return <PageLoader />;

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[var(--color-secondary-900)]">Dashboard</h1>
                <p className="text-sm text-[var(--color-secondary-500)]">
                    Resumen general del restaurante
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
                    <StatCard
                        label="Ventas Hoy"
                        value={`$${(kpis?.salesToday ?? 0).toLocaleString()}`}
                        color="var(--color-primary-500)"
                        icon={<span className="text-xl">💰</span>}
                    />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <StatCard
                        label="Ventas del Mes"
                        value={`$${(kpis?.salesMonth ?? 0).toLocaleString()}`}
                        color="#10b981"
                        icon={<span className="text-xl">📈</span>}
                    />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <StatCard
                        label="Ticket Promedio"
                        value={`$${(kpis?.avgTicket ?? 0).toLocaleString()}`}
                        color="#6366f1"
                        icon={<span className="text-xl">🎫</span>}
                    />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <StatCard
                        label="Pedidos del Mes"
                        value={kpis?.totalOrders ?? 0}
                        color="#f59e0b"
                        icon={<span className="text-xl">📦</span>}
                    />
                </motion.div>
            </div>

            {/* Extra KPIs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
                <Card>
                    <h3 className="font-semibold text-[var(--color-secondary-900)] mb-2">
                        🏆 Producto Más Vendido
                    </h3>
                    {kpis?.topProduct ? (
                        <p className="text-lg font-bold text-[var(--color-primary-500)]">
                            {kpis.topProduct.nombre}{' '}
                            <span className="text-sm text-[var(--color-secondary-500)] font-normal">
                                ({kpis.topProduct.count} ventas)
                            </span>
                        </p>
                    ) : (
                        <p className="text-[var(--color-secondary-400)]">Sin datos</p>
                    )}
                </Card>
                <Card>
                    <h3 className="font-semibold text-[var(--color-secondary-900)] mb-2">
                        ⏰ Hora Pico
                    </h3>
                    <p className="text-lg font-bold text-[var(--color-primary-500)]">
                        {kpis?.peakHour ?? '—'}
                    </p>
                </Card>
            </div>

            {/* Recent Orders */}
            <Card padding="none">
                <div className="p-4 border-b border-[var(--color-secondary-100)]">
                    <div className="flex items-center justify-between">
                        <h2 className="font-bold text-[var(--color-secondary-900)]">
                            Pedidos Recientes
                        </h2>
                        <Link
                            href="/admin/operativo"
                            className="text-sm text-[var(--color-primary-500)] hover:underline"
                        >
                            Ver todos →
                        </Link>
                    </div>
                </div>

                <div className="divide-y divide-[var(--color-secondary-50)]">
                    {recentOrders.length === 0 ? (
                        <div className="p-8 text-center text-[var(--color-secondary-400)]">
                            No hay pedidos recientes
                        </div>
                    ) : (
                        recentOrders.map((order) => (
                            <div
                                key={order.$id}
                                className="px-4 py-3 flex items-center justify-between hover:bg-[var(--color-secondary-50)] transition-colors"
                            >
                                <div>
                                    <span className="font-medium text-sm text-[var(--color-secondary-900)]">
                                        #{order.numero_pedido}
                                    </span>
                                    <span className="text-xs text-[var(--color-secondary-400)] ml-3">
                                        {new Date(order.fecha_creacion).toLocaleString('es')}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="font-bold text-sm">
                                        ${order.total.toLocaleString()}
                                    </span>
                                    <Badge estado={order.estado as EstadoPedido} size="sm" dot />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Card>
        </div>
    );
}
