export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12',
    };

    return (
        <div className="flex items-center justify-center">
            <svg
                className={`animate-spin ${sizeClasses[size]} text-[var(--color-primary-500)]`}
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
            </svg>
        </div>
    );
}

// Skeleton for loading states
export function Skeleton({ className = '' }: { className?: string }) {
    return (
        <div
            className={`animate-shimmer rounded-lg ${className}`}
            aria-hidden="true"
        />
    );
}

// Full page loading
export function PageLoader() {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
                <Spinner size="lg" />
                <p className="mt-4 text-sm text-[var(--color-secondary-500)]">
                    Cargando...
                </p>
            </div>
        </div>
    );
}
