import { describe, it, expect } from 'vitest';
import { pedidosService } from './pedidos.service';
import type { CartItem } from '@/types';

// Mock appwrite deps since we import them in service
vi.mock('@/lib/appwrite', () => ({
    databases: {},
    DATABASE_ID: 'test-db',
    COLLECTION: { PEDIDOS: 'pedidos' }
}));

describe('pedidosService', () => {
    describe('calculateTotals', () => {
        const mockItems: CartItem[] = [
            {
                producto: {
                    $id: '1',
                    nombre: 'Pizza',
                    descripcion: 'Delicious pizza',
                    precio: 10000,
                    categoria_id: 'c1',
                    disponible: true,
                    destacado: false,
                    imagen_url: '',
                    etiquetas: [],
                    stock: 100,
                    $createdAt: '',
                    $updatedAt: ''
                },
                cantidad: 2
            },
            {
                producto: {
                    $id: '2',
                    nombre: 'Soda',
                    descripcion: 'Cold soda',
                    precio: 3000,
                    categoria_id: 'c2',
                    disponible: true,
                    destacado: false,
                    imagen_url: '',
                    etiquetas: [],
                    stock: 50,
                    $createdAt: '',
                    $updatedAt: ''
                },
                cantidad: 1
            }
        ];

        it('should calculate subtotal correctly', () => {
            const totals = pedidosService.calculateTotals(mockItems);
            // (10000 * 2) + (3000 * 1) = 23000
            expect(totals.subtotal).toBe(23000);
        });

        it('should calculate tax correctly (8%)', () => {
            const totals = pedidosService.calculateTotals(mockItems);
            // 23000 * 0.08 = 1840
            expect(totals.impuestos).toBe(1840);
        });

        it('should include shipping when requested', () => {
            const totals = pedidosService.calculateTotals(mockItems, 0, true);
            expect(totals.envio).toBe(5000);
            expect(totals.total).toBe(23000 + 1840 + 5000);
        });

        it('should not include shipping by default', () => {
            const totals = pedidosService.calculateTotals(mockItems);
            expect(totals.envio).toBe(0);
            expect(totals.total).toBe(23000 + 1840);
        });

        it('should apply discount correctly before tax', () => {
            const discount = 3000;
            const totals = pedidosService.calculateTotals(mockItems, discount);

            // Subtotal: 23000
            // Discount: 3000
            // Tax base: 20000 -> Tax: 1600
            // Total: 20000 + 1600 = 21600

            expect(totals.subtotal).toBe(23000);
            expect(totals.descuento).toBe(3000);
            expect(totals.impuestos).toBe(1600);
            expect(totals.total).toBe(21600);
        });
    });
});
