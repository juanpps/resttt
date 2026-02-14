'use client';

import { InputHTMLAttributes, forwardRef, TextareaHTMLAttributes, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, icon, className = '', ...props }, ref) => {
        const [isFocused, setIsFocused] = useState(false);
        const hasValue = !!props.value || !!props.placeholder;

        return (
            <div className="w-full group">
                <div className={`
                    relative transition-all duration-300 rounded-2xl border-2
                    ${isFocused ? 'border-[var(--color-primary)] bg-white shadow-premium' : 'border-transparent bg-[var(--color-secondary)]/5'}
                    ${error ? 'border-red-500' : ''}
                `}>
                    {/* Floating Label Logic */}
                    {label && (
                        <label className={`
                            absolute left-4 transition-all duration-200 pointer-events-none
                            ${(isFocused || hasValue) ? 'top-2 text-[10px] uppercase tracking-wider font-bold text-[var(--color-text-muted)]' : 'top-1/2 -translate-y-1/2 text-body'}
                        `}>
                            {label}
                        </label>
                    )}

                    <div className="flex items-center pt-2">
                        {icon && <div className="pl-4 text-xl">{icon}</div>}
                        <input
                            ref={ref}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            className={`
                                w-full bg-transparent px-4 pb-3 pt-3 text-body outline-none
                                placeholder:text-transparent
                                disabled:opacity-50
                                ${className}
                            `}
                            {...props}
                        />
                    </div>
                </div>

                <AnimatePresence>
                    {error && (
                        <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-2 pl-4 text-caption text-red-500 font-medium"
                        >
                            {error}
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>
        );
    }
);

Input.displayName = 'Input';

// ── Textarea ──
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, className = '', ...props }, ref) => {
        return (
            <div className="w-full">
                <div className={`
                    relative rounded-2xl bg-[var(--color-secondary)]/5 p-4 border-2 border-transparent transition-all
                    focus-within:border-[var(--color-primary)] focus-within:bg-white focus-within:shadow-premium
                    ${error ? 'border-red-500' : ''}
                `}>
                    {label && (
                        <label className="block text-[10px] uppercase tracking-wider font-bold text-[var(--color-text-muted)] mb-1">
                            {label}
                        </label>
                    )}
                    <textarea
                        ref={ref}
                        className={`w-full bg-transparent text-body outline-none resize-none min-h-[120px] ${className}`}
                        {...props}
                    />
                </div>
                {error && <p className="mt-2 pl-4 text-caption text-red-500 font-medium">{error}</p>}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';

// ── Select ──
interface SelectProps extends InputHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, options, className = '', ...props }, ref) => {
        return (
            <div className="w-full">
                <div className={`
                    relative rounded-2xl bg-[var(--color-secondary)]/5 p-4 border-2 border-transparent transition-all
                    focus-within:border-[var(--color-primary)] focus-within:bg-white focus-within:shadow-premium
                    ${error ? 'border-red-500' : ''}
                `}>
                    {label && (
                        <label className="block text-[10px] uppercase tracking-wider font-bold text-[var(--color-text-muted)] mb-1">
                            {label}
                        </label>
                    )}
                    <select
                        ref={ref}
                        className={`w-full bg-transparent text-body outline-none appearance-none cursor-pointer ${className}`}
                        {...(props as any)}
                    >
                        {options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>
                {error && <p className="mt-2 pl-4 text-caption text-red-500 font-medium">{error}</p>}
            </div>
        );
    }
);

Select.displayName = 'Select';
