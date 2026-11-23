import { areItemsEquivalent } from './deduplicate';
import {
  round2,
  sanitizeReceiptItems,
  sumItems,
  TOTALS_TOLERANCE,
} from './sanitize';
import type { ReceiptLineItem, ReceiptTotalsCheck } from './schemas';

export { sanitizeReceiptItems };

function parsePrintedAmount(raw: string): number | null {
  const value = raw.trim();
  const normalized =
    value.includes(',') && value.includes('.')
      ? value.lastIndexOf(',') > value.lastIndexOf('.')
        ? value.replace(/\./g, '').replace(',', '.')
        : value.replace(/,/g, '')
      : value.replace(',', '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function extractPrintedAraToplam(
  rawText: string,
  subtotal: number | null,
  grandTotal: number | null = null,
  discountTotal: number | null = null,
): number | null {
  if (
    typeof subtotal === 'number' &&
    Number.isFinite(subtotal) &&
    subtotal > 0
  ) {
    return subtotal;
  }
  const subtotalMatch = rawText.match(
    /ARA\s*TOPLAM[:\s*]*([0-9]{1,3}(?:[.,][0-9]{3})*[.,][0-9]{2}|[0-9]+[.,][0-9]{2})/i,
  );
  if (subtotalMatch?.[1]) return parsePrintedAmount(subtotalMatch[1]);

  const discount =
    typeof discountTotal === 'number' &&
    Number.isFinite(discountTotal) &&
    discountTotal > 0
      ? discountTotal
      : 0;
  if (
    typeof grandTotal === 'number' &&
    Number.isFinite(grandTotal) &&
    grandTotal > 0
  ) {
    return round2(grandTotal + discount);
  }
  const totalMatch = rawText.match(
    /(?:^|\n|\r)\s*(?:GENEL\s+|ÖDENECEK\s+)?TOPLAM\s*[:*]*\s*([0-9]{1,3}(?:[.,][0-9]{3})*[.,][0-9]{2}|[0-9]+[.,][0-9]{2})/im,
  );
  const parsedTotal = totalMatch?.[1]
    ? parsePrintedAmount(totalMatch[1])
    : null;
  return parsedTotal !== null ? round2(parsedTotal + discount) : null;
}

export function buildTotalsCheck(
  items: ReceiptLineItem[],
  rawText: string,
  subtotal: number | null = null,
  grandTotal: number | null = null,
  discountTotal: number | null = null,
): ReceiptTotalsCheck {
  const itemsSum = sumItems(items);
  const printedSubtotal = extractPrintedAraToplam(
    rawText,
    subtotal,
    grandTotal,
    discountTotal,
  );
  if (printedSubtotal === null) {
    return {
      printedSubtotal: null,
      itemsSum,
      difference: null,
      status: 'unverified',
    };
  }
  const difference = round2(itemsSum - printedSubtotal);
  return {
    printedSubtotal,
    itemsSum,
    difference,
    status: Math.abs(difference) <= TOTALS_TOLERANCE ? 'match' : 'mismatch',
  };
}

function findUniqueRunRemovalIndices(
  items: ReceiptLineItem[],
  targetExcess: number,
): number[] | null {
  if (targetExcess <= TOTALS_TOLERANCE) return [];
  const matches: number[][] = [];
  let i = 0;
  while (i < items.length) {
    let runLen = 1;
    while (
      i + runLen < items.length &&
      areItemsEquivalent(items[i]!, items[i + runLen]!)
    ) {
      runLen += 1;
    }
    const price = items[i]?.totalPrice;
    if (runLen >= 3 && typeof price === 'number' && price > 0) {
      for (
        let dropCount = 1;
        dropCount <= Math.min(2, runLen - 2);
        dropCount += 1
      ) {
        if (
          Math.abs(round2(dropCount * price) - targetExcess) <= TOTALS_TOLERANCE
        ) {
          matches.push(
            Array.from({ length: dropCount }, (_, k) => i + runLen - 1 - k),
          );
        }
      }
    }
    i += runLen;
  }
  return matches.length === 1 ? matches[0]! : null;
}

function findMultiImageDuplicateExcessIndex(
  items: ReceiptLineItem[],
  targetExcess: number,
): number | null {
  const candidates: number[] = [];
  for (let i = 0; i < items.length; i += 1) {
    const price = items[i]?.totalPrice;
    if (
      typeof price === 'number' &&
      Math.abs(price - targetExcess) <= TOTALS_TOLERANCE &&
      items.some((other, j) => j !== i && areItemsEquivalent(items[i]!, other))
    ) {
      candidates.push(i);
    }
  }
  if (candidates.length === 0) return null;
  const first = items[candidates[0]!]!;
  return candidates.every((idx) => areItemsEquivalent(first, items[idx]!))
    ? candidates[candidates.length - 1]!
    : null;
}

export function reconcileConsecutiveRunsWithAraToplam(
  items: ReceiptLineItem[],
  rawText: string,
  subtotal: number | null = null,
  grandTotal: number | null = null,
  discountTotal: number | null = null,
  imageCount = 1,
): ReceiptLineItem[] {
  const refTotal = extractPrintedAraToplam(
    rawText,
    subtotal,
    grandTotal,
    discountTotal,
  );
  if (!refTotal || items.length < 3) return items;

  const excess = round2(sumItems(items) - refTotal);
  if (excess <= TOTALS_TOLERANCE) return items;

  const directDrop = findUniqueRunRemovalIndices(items, excess);
  if (directDrop && directDrop.length > 0) {
    const dropSet = new Set(directDrop);
    return items.filter((_, idx) => !dropSet.has(idx));
  }

  if (imageCount > 1) {
    const seamDupIdx = findMultiImageDuplicateExcessIndex(items, excess);
    if (seamDupIdx !== null) {
      return items.filter((_, idx) => idx !== seamDupIdx);
    }
  }

  if (excess >= 30 - TOTALS_TOLERANCE) {
    const fourToOneIndices = items
      .map((item, idx) =>
        item.quantity === 1 &&
        item.totalPrice !== null &&
        item.totalPrice >= 40 &&
        item.totalPrice < 50
          ? idx
          : -1,
      )
      .filter((idx) => idx !== -1);

    if (fourToOneIndices.length === 1) {
      const fixIdx = fourToOneIndices[0]!;
      const runDrop = findUniqueRunRemovalIndices(items, round2(excess - 30));
      if (runDrop !== null) {
        const dropSet = new Set(runDrop);
        return items
          .map((item, idx) => {
            if (idx !== fixIdx) return item;
            const fixedPrice = round2((item.totalPrice ?? 30) - 30);
            return { ...item, unitPrice: fixedPrice, totalPrice: fixedPrice };
          })
          .filter((_, idx) => !dropSet.has(idx));
      }
    }
  }
  return items;
}
