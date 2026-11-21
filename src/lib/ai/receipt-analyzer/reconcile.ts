import { areItemsEquivalent } from './deduplicate';
import type { ReceiptLineItem, ReceiptTotalsCheck } from './schemas';

/** Tolerance (in currency units) when comparing item sum with printed ARA TOPLAM. */
const TOTALS_TOLERANCE = 0.02;

/**
 * Barkod/PLU satırı deseni: "8690504961482 x 1 AD" veya yalnızca "2922087".
 * Zayıf modeller barkod satırını ürün kalemi sanabiliyor; bunlar gerçek ürün değildir.
 */
const BARCODE_LINE_PATTERN = /^\s*\d{5,}(?:\s*[x×].*)?$/i;

const round2 = (value: number): number => Number(value.toFixed(2));

function sumItems(items: ReceiptLineItem[]): number {
  return round2(items.reduce((sum, item) => sum + (item.totalPrice ?? 0), 0));
}

/** Barkod satırlarını ürün kalemi olarak döndüren hatalı çıktıları ayıklar. */
export function sanitizeReceiptItems(
  items: ReceiptLineItem[],
): ReceiptLineItem[] {
  return items.filter((item) => !BARCODE_LINE_PATTERN.test(item.name));
}

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

/** Fişte basılı ARA TOPLAM: önce açık `subtotal` alanı, yoksa rawText içinden. */
export function extractPrintedAraToplam(
  rawText: string,
  subtotal: number | null,
): number | null {
  if (typeof subtotal === 'number' && Number.isFinite(subtotal) && subtotal > 0) {
    return subtotal;
  }
  const match = rawText.match(
    /ARA\s*TOPLAM[:\s*]*([0-9]{1,3}(?:[.,][0-9]{3})*[.,][0-9]{2}|[0-9]+[.,][0-9]{2})/i,
  );
  return match?.[1] ? parsePrintedAmount(match[1]) : null;
}

/** Ürün toplamını fişteki ARA TOPLAM ile karşılaştırır (doğrulanamıyorsa `unverified`). */
export function buildTotalsCheck(
  items: ReceiptLineItem[],
  rawText: string,
  subtotal: number | null = null,
): ReceiptTotalsCheck {
  const itemsSum = sumItems(items);
  const printedSubtotal = extractPrintedAraToplam(rawText, subtotal);
  if (printedSubtotal === null) {
    return { printedSubtotal: null, itemsSum, difference: null, status: 'unverified' };
  }
  const difference = round2(itemsSum - printedSubtotal);
  return {
    printedSubtotal,
    itemsSum,
    difference,
    status: Math.abs(difference) <= TOTALS_TOLERANCE ? 'match' : 'mismatch',
  };
}

/**
 * Alt alta 3+ kez tekrar eden özdeş ürün bloğunda modelin +1 fazla saydığı kalemi,
 * fazlalık tam olarak o ürünün tutarına eşitse (ARA TOPLAM referansıyla) düzeltir.
 */
export function reconcileConsecutiveRunsWithAraToplam(
  items: ReceiptLineItem[],
  rawText: string,
  subtotal: number | null = null,
): ReceiptLineItem[] {
  const refTotal = extractPrintedAraToplam(rawText, subtotal);
  if (!refTotal || items.length < 3) return items;

  const excess = round2(sumItems(items) - refTotal);
  if (excess <= 0) return items;

  const matchingRunEnds: number[] = [];
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
    if (
      runLen >= 3 &&
      typeof price === 'number' &&
      Math.abs(price - excess) <= TOTALS_TOLERANCE
    ) {
      matchingRunEnds.push(i + runLen - 1);
    }
    i += runLen;
  }

  if (matchingRunEnds.length !== 1) return items;
  const removeIdx = matchingRunEnds[0]!;
  return items.filter((_, idx) => idx !== removeIdx);
}
