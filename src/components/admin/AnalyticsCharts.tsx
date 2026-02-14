'use client';

import { Card } from '@/components/ui/Card';
import { motion } from 'framer-motion';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';

const COLORS = ['#FF6B35', '#10b981', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6'];

interface AnalyticsChartsProps {
    dailySales: { date: string; total: number; count: number }[];
    peakHours: { hour: number; count: number }[];
    ordersByStatus: { estado: string; count: number }[];
}

export default function AnalyticsCharts({ dailySales, peakHours, ordersByStatus }: AnalyticsChartsProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Daily Sales Line Chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card>
                    <h3 className="font-semibold text-[var(--color-secondary-900)] mb-4">
                        Ventas Diarias (30 días)
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={dailySales}>
                            <defs>
                                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#FF6B35" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip
                                formatter={(value: number | undefined) => [`$${(value ?? 0).toLocaleString()}`, 'Ventas'] as [string, string]}
                                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Area type="monotone" dataKey="total" stroke="#FF6B35" fill="url(#salesGradient)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </Card>
            </motion.div>

            {/* Peak Hours Bar Chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card>
                    <h3 className="font-semibold text-[var(--color-secondary-900)] mb-4">
                        Horas Pico
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={peakHours}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="hour" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}h`} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip
                                formatter={(value: number | undefined) => [value ?? 0, 'Pedidos'] as [number, string]}
                                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Bar dataKey="count" fill="#FF6B35" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </motion.div>

            {/* Orders by Status Pie Chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card>
                    <h3 className="font-semibold text-[var(--color-secondary-900)] mb-4">
                        Pedidos por Estado
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={ordersByStatus}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={4}
                                dataKey="count"
                                nameKey="estado"
                            >
                                {ordersByStatus.map((_, idx) => (
                                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap gap-3 justify-center mt-2">
                        {ordersByStatus.map((item, idx) => (
                            <div key={item.estado} className="flex items-center gap-1.5 text-xs">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                <span className="text-[var(--color-secondary-600)]">{item.estado} ({item.count})</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </motion.div>

            {/* Daily Order Count */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card>
                    <h3 className="font-semibold text-[var(--color-secondary-900)] mb-4">
                        Pedidos Diarios
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={dailySales}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip
                                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>
            </motion.div>
        </div>
    );
}
