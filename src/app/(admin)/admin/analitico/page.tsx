'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { analyticsService } from '@/services/analytics.service';
import { StatCard } from '@/components/ui/Card';
import { PageLoader, Skeleton } from '@/components/ui/Spinner';

const AnalyticsCharts = dynamic(() => import('@/components/admin/AnalyticsCharts'), {
    loading: () => <Skeleton className="w-full h-[400px] rounded-2xl" />,
    ssr: false,
});

export default function AnaliticoPage() {
    const [kpis, setKpis] = useState<Awaited<ReturnType<typeof analyticsService.getAllKPIs>> | null>(null);
    const [dailySales, setDailySales] = useState<Awaited<ReturnType<typeof analyticsService.getDailySales>>>([]);
    const [peakHours, setPeakHours] = useState<Awaited<ReturnType<typeof analyticsService.getPeakHours>>>([]);
    const [ordersByStatus, setOrdersByStatus] = useState<Awaited<ReturnType<typeof analyticsService.getOrdersByStatus>>>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [kpiData, daily, hours, byStatus] = await Promise.all([
                    analyticsService.getAllKPIs(),
                    analyticsService.getDailySales(30),
                    analyticsService.getPeakHours(),
                    analyticsService.getOrdersByStatus(),
                ]);
                setKpis(kpiData);
                setDailySales(daily);
                setPeakHours(hours);
                setOrdersByStatus(byStatus);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return <PageLoader />;

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[var(--color-secondary-900)]">Analíticas</h1>
                <p className="text-sm text-[var(--color-secondary-500)]">
                    Métricas y rendimiento del restaurante
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard label="Ventas Hoy" value={`$${(kpis?.salesToday ?? 0).toLocaleString()}`} color="var(--color-primary-500)" icon={<span className="text-xl">💰</span>} />
                <StatCard label="Ventas del Mes" value={`$${(kpis?.salesMonth ?? 0).toLocaleString()}`} color="#10b981" icon={<span className="text-xl">📈</span>} />
                <StatCard label="Ticket Promedio" value={`$${(kpis?.avgTicket ?? 0).toLocaleString()}`} color="#6366f1" icon={<span className="text-xl">🎫</span>} />
                <StatCard label="Total Pedidos" value={kpis?.totalOrders ?? 0} color="#f59e0b" icon={<span className="text-xl">📦</span>} />
            </div>

            {/* Charts Grid */}
            <AnalyticsCharts
                dailySales={dailySales}
                peakHours={peakHours}
                ordersByStatus={ordersByStatus}
            />
        </div>
    );
}

