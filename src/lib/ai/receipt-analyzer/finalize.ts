import { deduplicateReceiptItems } from './deduplicate';
import {
  buildTotalsCheck,
  reconcileConsecutiveRunsWithAraToplam,
  sanitizeReceiptItems,
} from './reconcile';
import type {
  ReceiptLineItem,
  ReceiptModelOutput,
  ReceiptTotalsCheck,
} from './schemas';

export interface FinalizedReceipt {
  items: ReceiptLineItem[];
  deduplicatedCount: number;
  totalsCheck: ReceiptTotalsCheck;
  grandTotal: number | null;
  taxTotal: number | null;
}

const TRUNCATION_REASONS = new Set(['length', 'max_tokens']);
const SCORE_EMPTY = 500_000;
const SCORE_TRUNCATED = 1_000_000;

/**
 * Model çıktısını deterministik olarak temizler ve doğrular:
 * barkod satırı ayıklama → kesişim mükerrerlerini atlama → ARA TOPLAM mutabakatı →
 * ürün toplamı (grandTotal) ve fişteki KDV (taxTotal).
 */
export function finalizeReceiptItems(
  data: ReceiptModelOutput,
  imageCount: number,
): FinalizedReceipt {
  const sanitized = sanitizeReceiptItems(data.items);
  const { items: overlapCleaned, deduplicatedCount } =
    imageCount > 1
      ? deduplicateReceiptItems(sanitized)
      : { items: sanitized, deduplicatedCount: 0 };
  const items = reconcileConsecutiveRunsWithAraToplam(
    overlapCleaned,
    data.rawText,
    data.subtotal,
    data.grandTotal,
    data.discountTotal,
    imageCount,
  );
  const totalsCheck = buildTotalsCheck(
    items,
    data.rawText,
    data.subtotal,
    data.grandTotal,
    data.discountTotal,
  );

  const hasPricedItems = items.some((item) => item.totalPrice !== null);
  const taxTotal =
    typeof data.taxTotal === 'number' && Number.isFinite(data.taxTotal)
      ? Number(data.taxTotal.toFixed(2))
      : null;

  return {
    items,
    deduplicatedCount,
    totalsCheck,
    grandTotal: hasPricedItems ? totalsCheck.itemsSum : data.grandTotal,
    taxTotal,
  };
}

/**
 * Aday kalite skoru (düşük = iyi): 0 = kabul edilebilir (doğrulandı/doğrulanamadı ama sağlam),
 * 1+fark = ARA TOPLAM ile uyuşmuyor, yüksek değerler = boş ya da token sınırında kesilmiş.
 */
export function scoreFinalizedReceipt(
  finalized: FinalizedReceipt,
  finishReason?: string | null,
  nativeFinishReason?: string | null,
): number {
  if (finalized.items.length === 0) return SCORE_EMPTY;
  const truncated = [finishReason, nativeFinishReason].some(
    (reason) =>
      typeof reason === 'string' &&
      TRUNCATION_REASONS.has(reason.toLowerCase()),
  );
  if (truncated) return SCORE_TRUNCATED;
  if (finalized.totalsCheck.status === 'mismatch') {
    return 1 + Math.abs(finalized.totalsCheck.difference ?? 0);
  }
  return 0;
}

export function buildEnrichedRawText(
  rawText: string,
  items: ReceiptLineItem[],
): string {
  const trimmed = rawText.trim();
  if (items.length === 0) return trimmed;
  const lineCount = trimmed ? trimmed.split(/\r?\n/).length : 0;
  if (lineCount >= items.length) return trimmed;

  const itemLines = items.map((item) => {
    const pricePart =
      item.totalPrice !== null ? ` *${item.totalPrice.toFixed(2)}` : '';
    return `${item.name} (${item.quantity} ${item.unit})${pricePart}`;
  });
  return trimmed
    ? `${trimmed}\n--- Kalemler (${items.length}) ---\n${itemLines.join('\n')}`
    : itemLines.join('\n');
}
