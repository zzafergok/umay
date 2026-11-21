import { describe, expect, it } from 'vitest';
import {
  parseEnrichmentResponse,
  receiptEnrichRequestSchema,
} from '@/lib/ai/receipt-analyzer';
import { computeReceiptProgress } from '@/components/ai/receipt-assistant/use-receipt-progress';

describe('receipt enrichment', () => {
  it('maps names and categories by index and normalizes category casing', () => {
    const result = parseEnrichmentResponse(
      '{"items":[{"i":1,"n":"Dimes Vişne Meyve Suyu","c":"içecek"},{"i":0,"n":"Eti Susamlı Çubuk 56g","c":"Gıda"}]}',
      3,
    );
    expect(result[0]).toEqual({
      normalizedName: 'Eti Susamlı Çubuk 56g',
      categoryHint: 'Gıda',
    });
    expect(result[1]).toEqual({
      normalizedName: 'Dimes Vişne Meyve Suyu',
      categoryHint: 'İçecek',
    });
    expect(result[2]).toEqual({ normalizedName: '', categoryHint: null });
  });

  it('drops unknown categories, out-of-range indices and invalid JSON safely', () => {
    expect(
      parseEnrichmentResponse('{"items":[{"i":9,"n":"X","c":"Gıda"},{"i":0,"n":"Y","c":"Uzay"}]}', 1),
    ).toEqual([{ normalizedName: 'Y', categoryHint: null }]);
    expect(parseEnrichmentResponse('not json', 2)).toEqual([
      { normalizedName: '', categoryHint: null },
      { normalizedName: '', categoryHint: null },
    ]);
  });

  it('validates the enrich request on the server', () => {
    expect(receiptEnrichRequestSchema.safeParse({ names: [] }).success).toBe(false);
    expect(receiptEnrichRequestSchema.safeParse({ names: ['ETI SUSAMLI CUBUK'] }).success).toBe(true);
  });

  it('keeps progress monotonic and never reaches 100% on its own', () => {
    const reading = [0, 10, 40, 120, 600].map((s) => computeReceiptProgress('reading', s));
    expect([...reading].sort((a, b) => a - b)).toEqual(reading);
    expect(Math.max(...reading)).toBeLessThan(86);
    expect(computeReceiptProgress('enriching', 0)).toBeGreaterThanOrEqual(86);
    expect(computeReceiptProgress('enriching', 600)).toBeLessThan(100);
    expect(computeReceiptProgress('idle', 5)).toBe(0);
  });
});
