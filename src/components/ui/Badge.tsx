import type { EstadoPedido } from '@/types';
import { ESTADO_LABELS, ESTADO_COLORS } from '@/types';

type BadgeVariant = 'default' | 'success' | 'error' | 'warning' | 'info' | 'status';

interface BadgeProps {
    children?: React.ReactNode;
    variant?: BadgeVariant;
    estado?: EstadoPedido;
    size?: 'sm' | 'md';
    dot?: boolean;
}

const variantStyles: Record<string, string> = {
    default: 'bg-[var(--color-secondary-100)] text-[var(--color-secondary-700)]',
    success: 'bg-emerald-50 text-emerald-700',
    error: 'bg-red-50 text-red-700',
    warning: 'bg-amber-50 text-amber-700',
    info: 'bg-blue-50 text-blue-700',
};

export function Badge({
    children,
    variant = 'default',
    estado,
    size = 'sm',
    dot = false,
}: BadgeProps) {
    // If estado is provided, use status colors
    if (estado) {
        const color = ESTADO_COLORS[estado];
        return (
            <span
                className={`
          inline-flex items-center gap-1.5 font-medium rounded-full
          ${size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'}
        `}
                style={{
                    backgroundColor: `${color}15`,
                    color: color,
                }}
            >
                {dot && (
                    <span
                        className="w-1.5 h-1.5 rounded-full animate-pulse"
                        style={{ backgroundColor: color }}
                    />
                )}
                {ESTADO_LABELS[estado]}
            </span>
        );
    }

    return (
        <span
            className={`
        inline-flex items-center gap-1.5 font-medium rounded-full
        ${variantStyles[variant]}
        ${size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'}
      `}
        >
            {dot && (
                <span
                    className={`w-1.5 h-1.5 rounded-full ${variant === 'success' ? 'bg-emerald-500' :
                            variant === 'error' ? 'bg-red-500' :
                                variant === 'warning' ? 'bg-amber-500' :
                                    variant === 'info' ? 'bg-blue-500' : 'bg-gray-500'
                        }`}
                />
            )}
            {children}
        </span>
    );
}
