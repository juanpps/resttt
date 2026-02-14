'use client';

import { useState, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface Tab {
    id: string;
    label: string;
    icon?: ReactNode;
    count?: number;
}

interface TabsProps {
    tabs: Tab[];
    activeTab: string;
    onChange: (tabId: string) => void;
    variant?: 'underline' | 'pill';
}

export function Tabs({
    tabs,
    activeTab,
    onChange,
    variant = 'underline',
}: TabsProps) {
    if (variant === 'pill') {
        return (
            <div className="flex gap-2 p-1 bg-[var(--color-secondary-100)] rounded-xl">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onChange(tab.id)}
                        className={`
              relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
              ${activeTab === tab.id
                                ? 'text-[var(--color-primary-600)]'
                                : 'text-[var(--color-secondary-500)] hover:text-[var(--color-secondary-700)]'
                            }
            `}
                    >
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="pill-tab"
                                className="absolute inset-0 bg-white rounded-lg shadow-sm"
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                            {tab.icon}
                            {tab.label}
                            {tab.count !== undefined && (
                                <span className="px-1.5 py-0.5 text-xs rounded-full bg-[var(--color-primary-100)] text-[var(--color-primary-600)]">
                                    {tab.count}
                                </span>
                            )}
                        </span>
                    </button>
                ))}
            </div>
        );
    }

    // Underline variant
    return (
        <div className="border-b border-[var(--color-secondary-200)]">
            <nav className="flex gap-6 -mb-px overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onChange(tab.id)}
                        className={`
              relative pb-3 text-sm font-medium whitespace-nowrap transition-colors duration-200
              ${activeTab === tab.id
                                ? 'text-[var(--color-primary-500)]'
                                : 'text-[var(--color-secondary-500)] hover:text-[var(--color-secondary-700)]'
                            }
            `}
                    >
                        <span className="flex items-center gap-2">
                            {tab.icon}
                            {tab.label}
                            {tab.count !== undefined && (
                                <span
                                    className={`px-1.5 py-0.5 text-xs rounded-full ${activeTab === tab.id
                                            ? 'bg-[var(--color-primary-100)] text-[var(--color-primary-600)]'
                                            : 'bg-[var(--color-secondary-100)] text-[var(--color-secondary-600)]'
                                        }`}
                                >
                                    {tab.count}
                                </span>
                            )}
                        </span>
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="underline-tab"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-primary-500)]"
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            />
                        )}
                    </button>
                ))}
            </nav>
        </div>
    );
}
