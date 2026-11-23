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
      date: null,
      time: null,
      currency: 'TRY',
      subtotal: null,
      taxTotal: null,
      discountTotal: null,
      grandTotal: null,
      paymentMethod: null,
      notes: null,
      merchantName: null,
      merchantTaxId: null,
      confidence: 'medium' as const,
    };
    const good = finalizeReceiptItems(
      {
        ...base,
        rawText: '',
        subtotal: 150.5,
        items: [item('A', 100), item('B', 50.5)],
      },
      1,
    );
    const missing = finalizeReceiptItems(
      {
        ...base,
        rawText: '',
        subtotal: 517.9,
        items: [item('A', 100), item('B', 50.5)],
      },
      1,
    );
    expect(scoreFinalizedReceipt(good, 'stop')).toBe(0);
    expect(scoreFinalizedReceipt(missing, 'stop')).toBeGreaterThan(0);
    expect(scoreFinalizedReceipt(good, 'length')).toBeGreaterThan(
      scoreFinalizedReceipt(missing, 'stop'),
    );
  });

  it('drops unbarcoded qty*price modifier lines and merges matching weight/qty into the next item', () => {
    const items: ReceiptLineItem[] = [
      item('U.684 KG X 8,95', 7.16),
      item('TAVUK POŞET BÜTÜN', 15.07),
      item('1,892 kg X 8,95', 16.93),
      item('TAVUK POŞET BÜTÜN', 16.93),
      item('24 X 0,45', 10.8),
      item('NESTLE SALEP 15GR', 10.8),
      item('TON BALIGI 2X160GR', 9.95),
    ];

    const sanitized = sanitizeReceiptItems(items);
    expect(sanitized.map((entry) => entry.name)).toEqual([
      'TAVUK POŞET BÜTÜN',
      'TAVUK POŞET BÜTÜN',
      'NESTLE SALEP 15GR',
      'TON BALIGI 2X160GR',
    ]);
    expect(sanitized[1]).toMatchObject({
      quantity: 1.892,
      unit: 'kg',
      unitPrice: 8.95,
      totalPrice: 16.93,
    });
    expect(sanitized[2]).toMatchObject({
      quantity: 24,
      unit: 'adet',
      unitPrice: 0.45,
      totalPrice: 10.8,
    });
  });

  it('falls back to printed TOPLAM / grandTotal when ARA TOPLAM is absent', () => {
    const checkFromRaw = buildTotalsCheck(
      [item('A', 300), item('B', 37.85)],
      'TARİH 06.01.2020 15:58\nTOPKDV 22,79\nTOPLAM 307,85',
    );
    expect(checkFromRaw.status).toBe('mismatch');
    expect(checkFromRaw.printedSubtotal).toBe(307.85);
    expect(checkFromRaw.difference).toBe(30);

    const checkFromGrandTotal = buildTotalsCheck(
      [item('A', 307.85)],
      '',
      null,
      307.85,
    );
    expect(checkFromGrandTotal.status).toBe('match');
  });

  it('recovers chicken totals when model puts unitPrice as totalPrice on product line and reconciles *1->4 OCR + soup overcount', () => {
    const base = {
      date: '2020-01-06',
      time: '15:58',
      currency: 'TRY',
      subtotal: null,
      taxTotal: 22.79,
      discountTotal: null,
      grandTotal: 307.85,
      paymentMethod: null,
      notes: null,
      merchantName: null,
      merchantTaxId: null,
      confidence: 'medium' as const,
      rawText: 'TARİH 06.01.2020 SAAT 15:58\nTOPKDV 22,79\nTOPLAM 307,85',
    };

    const finalized = finalizeReceiptItems(
      {
        ...base,
        items: [
          item('DİĞER ÜRÜNLER TOPLAMI', 252.1),
          item('CORBA SEH. TAVUK 5IN', 1.25),
          item('CORBA SEH. TAVUK 5IN', 1.25),
          item('CORBA SEH. TAVUK 5IN', 1.25),
          item('CORBA SEH. TAVUK 5IN', 1.25),
          item('FILVAST P.K. 2.5 KG', 40.45),
          {
            ...item('1,684 KG X 8,95', 15.07),
            quantity: 1.684,
            unit: 'kg',
            unitPrice: 8.95,
          },
          item('TRVUK POSET BÜTÜN', 8.95),
          {
            ...item('1,892 kg X 8,95', 16.93),
            quantity: 1.892,
            unit: 'kg',
            unitPrice: 8.95,
          },
          item('TEVUK POSET BÜTÜN', 8.95),
          {
            ...item('24 X 0,45', 10.8),
            quantity: 24,
            unit: 'adet',
            unitPrice: 0.45,
          },
          item('NESTLE SABLE 15GR', 10.8),
        ],
      },
      1,
    );

    expect(finalized.grandTotal).toBe(307.85);
    expect(finalized.totalsCheck.status).toBe('match');
    expect(finalized.totalsCheck.difference).toBe(0);
    expect(
      finalized.items.find((i) => i.name === 'TRVUK POSET BÜTÜN'),
    ).toMatchObject({
      quantity: 1.684,
      unit: 'kg',
      unitPrice: 8.95,
      totalPrice: 15.07,
    });
    expect(
      finalized.items.find((i) => i.name === 'TEVUK POSET BÜTÜN'),
    ).toMatchObject({
      quantity: 1.892,
      unit: 'kg',
      unitPrice: 8.95,
      totalPrice: 16.93,
    });
    expect(
      finalized.items.find((i) => i.name === 'FILVAST P.K. 2.5 KG')?.totalPrice,
    ).toBe(10.45);
  });
});
