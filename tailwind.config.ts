import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: "#FFD700", // Vibrant Yellow
                    foreground: "#0F0F0F",
                },
                secondary: {
                    DEFAULT: "#0F0F0F", // Deep Black
                    foreground: "#FFFFFF",
                },
                surface: {
                    charcoal: "#1C1C1E",
                    card: "#FFFFFF",
                    dark: "#0F0F0F",
                },
                accent: "#FFD700",
            },
            spacing: {
                'safe-top': 'var(--safe-area-inset-top)',
                'safe-bottom': 'var(--safe-area-inset-bottom)',
                'safe-left': 'var(--safe-area-inset-left)',
                'safe-right': 'var(--safe-area-inset-right)',
            },
            borderRadius: {
                'xl': '16px',
                '2xl': '24px',
            },
            fontSize: {
                'display': ['40px', { lineHeight: '1.1', fontWeight: '800' }],
                'h1': ['32px', { lineHeight: '1.2', fontWeight: '700' }],
                'h2': ['24px', { lineHeight: '1.3', fontWeight: '700' }],
                'h3': ['20px', { lineHeight: '1.4', fontWeight: '600' }],
                'body': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
                'caption': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
            },
            boxShadow: {
                'premium': '0 10px 30px -10px rgba(0, 0, 0, 0.1)',
                'premium-hover': '0 20px 40px -15px rgba(0, 0, 0, 0.2)',
            },
            animation: {
                'scale-in': 'scale-in 0.2s ease-out',
                'fade-in': 'fade-in 0.3s ease-out',
            },
            keyframes: {
                'scale-in': {
                    '0%': { transform: 'scale(0.95)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                'fade-in': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
            },
        },
    },
    plugins: [],
};
export default config;
