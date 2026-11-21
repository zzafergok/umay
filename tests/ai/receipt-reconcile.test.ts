import { describe, expect, it } from 'vitest';
import {
  buildTotalsCheck,
  parseReceiptModelResponse,
  sanitizeReceiptItems,
  type ReceiptLineItem,
} from '@/lib/ai/receipt-analyzer';
import {
  finalizeReceiptItems,
  scoreFinalizedReceipt,
} from '@/lib/ai/receipt-analyzer/finalize';

const item = (name: string, totalPrice: number): ReceiptLineItem => ({
  name,
  normalizedName: name,
  quantity: 1,
  unit: 'adet',
  unitPrice: totalPrice,
  totalPrice,
  categoryHint: null,
  vatRate: null,
});

describe('receipt reconcile & validation', () => {
  it('drops barcode/PLU lines that weak models emit as products', () => {
    const items = [
      item('KIVI ADET', 29.95),
      item('2922078 x 1,184 KG', 47.3),
      item('8690504961482 x 1 AD', 26.25),
      item('2922087', 111.13),
    ];
    expect(sanitizeReceiptItems(items).map((i) => i.name)).toEqual([
      'KIVI ADET',
    ]);
  });

  it('flags a missing item through the printed ARA TOPLAM', () => {
    const check = buildTotalsCheck(
      [item('A', 100), item('B', 50.5)],
      'ARA TOPLAM 517.90',
    );
    expect(check.status).toBe('mismatch');
    expect(check.difference).toBe(-367.4);
  });

  it('prefers the explicit subtotal field and reports unverified without it', () => {
    expect(buildTotalsCheck([item('A', 10)], '', 10).status).toBe('match');
    expect(buildTotalsCheck([item('A', 10)], 'no totals').status).toBe(
      'unverified',
    );
  });

  it('infers the misread weight from the printed total and unit price', () => {
    const { data } = parseReceiptModelResponse(
      JSON.stringify({
        items: [
          {
            name: 'MUZ ITHAL',
            quantity: 3.694,
            unit: 'kg',
            unitPrice: 139.95,
            totalPrice: 97.13,
          },
        ],
      }),
    );
    expect(data.items[0]).toMatchObject({
      quantity: 0.694,
      unitPrice: 139.95,
      totalPrice: 97.13,
    });
  });

  it('scores truncated and mismatching candidates worse than verified ones', () => {
    const base = {
      date: null, time: null, currency: 'TRY', subtotal: null, taxTotal: null,
      discountTotal: null, grandTotal: null, paymentMethod: null, notes: null,
      merchantName: null, merchantTaxId: null, confidence: 'medium' as const,
    };
    const good = finalizeReceiptItems(
      { ...base, rawText: '', subtotal: 150.5, items: [item('A', 100), item('B', 50.5)] },
      1,
    );
    const missing = finalizeReceiptItems(
      { ...base, rawText: '', subtotal: 517.9, items: [item('A', 100), item('B', 50.5)] },
      1,
    );
    expect(scoreFinalizedReceipt(good, 'stop')).toBe(0);
    expect(scoreFinalizedReceipt(missing, 'stop')).toBeGreaterThan(0);
    expect(scoreFinalizedReceipt(good, 'length')).toBeGreaterThan(
      scoreFinalizedReceipt(missing, 'stop'),
    );
  });
});
