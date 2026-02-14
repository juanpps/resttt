'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
    hoverable?: boolean;
    onClick?: () => void;
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
};

export function Card({
    children,
    className = '',
    hoverable = false,
    onClick,
    padding = 'md',
}: CardProps) {
    const Component = hoverable ? motion.div : 'div';

    const baseClasses = `
    bg-white rounded-xl border border-[var(--color-secondary-200)]
    ${paddingStyles[padding]}
    ${hoverable ? 'cursor-pointer' : ''}
    ${className}
  `;

    if (hoverable) {
        return (
            <motion.div
                className={baseClasses}
                whileHover={{
                    y: -4,
                    boxShadow:
                        '0 20px 25px -5px rgba(255, 107, 53, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
                }}
                transition={{ duration: 0.2 }}
                onClick={onClick}
            >
                {children}
            </motion.div>
        );
    }

    return (
        <div className={baseClasses} onClick={onClick}>
            {children}
        </div>
    );
}

// Stat Card sub-component
interface StatCardProps {
    label: string;
    value: string | number;
    icon?: ReactNode;
    trend?: { value: number; positive: boolean };
    color?: string;
}

export function StatCard({ label, value, icon, trend, color }: StatCardProps) {
    return (
        <Card className="relative overflow-hidden">
            {color && (
                <div
                    className="absolute top-0 left-0 w-1 h-full rounded-l-xl"
                    style={{ backgroundColor: color }}
                />
            )}
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-[var(--color-secondary-500)] mb-1">
                        {label}
                    </p>
                    <p className="text-2xl font-bold text-[var(--color-secondary-900)]">
                        {value}
                    </p>
                    {trend && (
                        <p
                            className={`text-xs mt-1 font-medium ${trend.positive ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'
                                }`}
                        >
                            {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
                        </p>
                    )}
                </div>
                {icon && (
                    <div className="p-2 rounded-lg bg-[var(--color-primary-50)] text-[var(--color-primary-500)]">
                        {icon}
                    </div>
                )}
            </div>
        </Card>
    );
}
