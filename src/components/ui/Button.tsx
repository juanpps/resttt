'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?: Size;
    loading?: boolean;
    icon?: React.ReactNode;
    fullWidth?: boolean;
}

const variantStyles: Record<Variant, string> = {
    primary:
        'bg-[var(--color-primary)] text-[var(--color-secondary)] shadow-premium hover:shadow-premium-hover',
    secondary:
        'bg-[var(--color-secondary)] text-white shadow-premium hover:shadow-premium-hover',
    outline:
        'border-2 border-[var(--color-secondary)] text-[var(--color-secondary)] hover:bg-[var(--color-secondary)] hover:text-white',
    ghost:
        'text-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/5',
    danger: 'bg-red-500 text-white shadow-premium hover:bg-red-600',
};

const sizeStyles: Record<Size, string> = {
    sm: 'h-9 px-4 text-sm rounded-xl',
    md: 'h-11 px-6 text-sm rounded-xl',
    lg: 'h-[52px] px-8 text-base rounded-2xl font-bold',
    xl: 'h-16 px-10 text-lg rounded-2xl font-bold',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            variant = 'primary',
            size = 'lg',
            loading = false,
            icon,
            children,
            className = '',
            disabled,
            fullWidth = false,
            ...props
        },
        ref
    ) => {
        return (
            <motion.button
                ref={ref}
                whileHover={{ y: disabled || loading ? 0 : -2 }}
                whileTap={{ scale: disabled || loading ? 1 : 0.96 }}
                className={`
          inline-flex items-center justify-center gap-3 font-semibold
          transition-all duration-200
          disabled:opacity-40 disabled:cursor-not-allowed disabled:filter-grayscale
          ${fullWidth ? 'w-full' : ''}
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `}
                disabled={disabled || loading}
                {...(props as any)}
            >
                {loading ? (
                    <motion.svg
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                    </motion.svg>
                ) : icon ? (
                    <span className="text-xl">{icon}</span>
                ) : null}
                {children}
            </motion.button>
        );
    }
);

Button.displayName = 'Button';
