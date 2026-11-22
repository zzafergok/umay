import { describe, expect, it } from 'vitest';
import type { Item } from '@/features/inventory/types';
import { computeDashboardSummary } from '@/features/routes/auth/home/home-utils';
import {
  computeShoppingSummary,
  resolveEditedShoppingPrice,
  resolveReceiptUnitPrice,
} from '@/features/routes/auth/shopping/shopping-utils';

describe('shopping amounts', () => {
  it('preserves receipt totals and an unchanged high-precision unit price', () => {
    const price = resolveReceiptUnitPrice(10, 3.33, 3);
    expect(price).toBeDefined();
    expect((price ?? 0) * 3).toBeCloseTo(10);
    expect(resolveEditedShoppingPrice('3,33', price, false)).toBe(price);
    expect(resolveEditedShoppingPrice('3,50', price, true)).toBe(3.5);
    expect(resolveEditedShoppingPrice('', price, true)).toBeUndefined();
    expect(resolveReceiptUnitPrice(0, 12, 2)).toBe(0);
  });

  it('counts zero as a provided price in the shopping summary', () => {
    const summary = computeShoppingSummary([
      {
        id: 'zero',
        itemId: null,
        qty: 1,
        price: 0,
        source: 'manual',
        done: false,
        createdAt: '',
        updatedAt: '',
      },
    ]);
    expect(summary.pricedPendingCount).toBe(1);
    expect(summary.pendingTotal).toBe(0);
  });

  it('calculates inventory purchase value using actual stock quantities', () => {
    const base: Item = {
      id: 'item',
      name: 'Ürün',
      categoryId: '',
      locationId: '',
      type: 'consumable',
      quantity: 0,
      unit: 'adet',
      minQuantity: 0,
      purchasePrice: 20,
      currency: 'TRY',
      photos: [],
      documents: [],
      tags: [],
      customFieldValues: {},
      notes: '',
      status: 'active',
      createdAt: '',
      updatedAt: '',
    };
    const summary = computeDashboardSummary({
      items: [
        base,
        { ...base, id: 'weighted', quantity: 0.5 },
        { ...base, id: 'durable', type: 'durable', quantity: 3 },
      ],
      parts: [],
      logs: [],
      categories: [],
      locations: [],
      shoppingItems: [],
      currency: 'TRY',
      nowMs: Date.now(),
    });
    expect(summary.inventoryValue).toBe(70);
  });
});
