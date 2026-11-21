import type { ReceiptAnalyzeInput, ReceiptLineItem } from './schemas';

export function resolveReceiptImages(input: ReceiptAnalyzeInput): string[] {
  const urls =
    input.imageDataUrls && input.imageDataUrls.length > 0
      ? input.imageDataUrls
      : input.imageDataUrl
        ? [input.imageDataUrl]
        : [];
  return Array.from(new Set(urls));
}

const TURKISH_CHAR_MAP: Record<string, string> = {
  ç: 'c',
  ğ: 'g',
  ı: 'i',
  i: 'i',
  ö: 'o',
  ş: 's',
  ü: 'u',
};

function canonicalizeText(text: string): string {
  return text
    .toLocaleLowerCase('tr-TR')
    .replace(/[çğıiöşü]/g, (ch) => TURKISH_CHAR_MAP[ch] ?? ch)
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function roundMoney(value: number | null | undefined): string {
  return typeof value === 'number' && Number.isFinite(value)
    ? value.toFixed(2)
    : 'null';
}

function areNamesEquivalent(a: ReceiptLineItem, b: ReceiptLineItem): boolean {
  const rawA = canonicalizeText(a.name);
  const rawB = canonicalizeText(b.name);
  const normA = canonicalizeText(a.normalizedName || a.name);
  const normB = canonicalizeText(b.normalizedName || b.name);

  if (rawA && rawA === rawB) return true;
  if (normA && normA === normB) return true;
  if (rawA && normB && rawA === normB) return true;
  if (normA && rawB && normA === rawB) return true;

  const minLen = Math.min(normA.length, normB.length);
  return minLen >= 6 && (normA.includes(normB) || normB.includes(normA));
}

export function areItemsEquivalent(
  a: ReceiptLineItem,
  b: ReceiptLineItem,
): boolean {
  if (!areNamesEquivalent(a, b)) return false;
  const qtyA = Number((a.quantity || 1).toFixed(3));
  const qtyB = Number((b.quantity || 1).toFixed(3));
  if (qtyA !== qtyB) return false;

  const totalA = roundMoney(a.totalPrice);
  const totalB = roundMoney(b.totalPrice);
  if (totalA !== 'null' && totalB !== 'null') return totalA === totalB;

  const unitA = roundMoney(a.unitPrice);
  const unitB = roundMoney(b.unitPrice);
  if (unitA !== 'null' && unitB !== 'null') return unitA === unitB;

  return totalA === totalB && unitA === unitB;
}

function mergeDuplicatePair(
  primary: ReceiptLineItem,
  secondary: ReceiptLineItem,
): ReceiptLineItem {
  return {
    name:
      primary.name.length >= secondary.name.length
        ? primary.name
        : secondary.name,
    normalizedName: primary.normalizedName || secondary.normalizedName || '',
    quantity: primary.quantity || secondary.quantity || 1,
    unit: primary.unit || secondary.unit || 'adet',
    unitPrice: primary.unitPrice ?? secondary.unitPrice ?? null,
    totalPrice: primary.totalPrice ?? secondary.totalPrice ?? null,
    categoryHint: primary.categoryHint ?? secondary.categoryHint ?? null,
    vatRate: primary.vatRate ?? secondary.vatRate ?? null,
  };
}

function countDistinctNames(slice: ReceiptLineItem[]): number {
  return new Set(
    slice.map((item) => canonicalizeText(item.normalizedName || item.name)),
  ).size;
}

/**
 * Yalnızca çoklu fiş fotoğraflarının kesişim (overlap) bölgelerinden kaynaklanan
 * ardışık tekrar bloklarını (en az 2 farklı ürün içeren kesişen satır dizilerini) atlar.
 * Fişin kendi üzerinde birden fazla kez okutulmuş/tekrar eden ürünleri olduğu gibi korur.
 */
export function deduplicateReceiptItems(items: ReceiptLineItem[]): {
  items: ReceiptLineItem[];
  deduplicatedCount: number;
} {
  if (items.length < 4) {
    return { items, deduplicatedCount: 0 };
  }

  const working = [...items];
  const removedIndices = new Set<number>();
  let deduplicatedCount = 0;

  for (let i = 0; i < working.length; i += 1) {
    if (removedIndices.has(i)) continue;

    for (let j = i + 2; j < working.length; j += 1) {
      if (removedIndices.has(j)) continue;

      let blockLen = 0;
      while (
        i + blockLen < j &&
        j + blockLen < working.length &&
        !removedIndices.has(i + blockLen) &&
        !removedIndices.has(j + blockLen) &&
        areItemsEquivalent(working[i + blockLen]!, working[j + blockLen]!)
      ) {
        blockLen += 1;
      }

      if (blockLen >= 2) {
        const blockSlice = working.slice(i, i + blockLen);
        if (countDistinctNames(blockSlice) >= 2) {
          for (let k = 0; k < blockLen; k += 1) {
            working[i + k] = mergeDuplicatePair(
              working[i + k]!,
              working[j + k]!,
            );
            removedIndices.add(j + k);
          }
          deduplicatedCount += blockLen;
        }
      }
    }
  }

  return {
    items: working.filter((_, idx) => !removedIndices.has(idx)),
    deduplicatedCount,
  };
}

/**
 * Çoklu görsel OCR metin dökümünde yalnızca kesişen ardışık satır bloklarını temizler;
 * fiş içinde gerçekten tekrar eden tekil ürün satırlarına dokunmaz.
 */
export function deduplicateRawReceiptText(rawText: string): string {
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line, idx, arr) => line !== '' || arr[idx - 1] !== '');
  if (lines.length < 4) return rawText.trim();

  const canonicals = lines.map(canonicalizeText);
  const removed = new Set<number>();

  for (let i = 0; i < lines.length; i += 1) {
    if (removed.has(i) || canonicals[i]!.length < 4) continue;
    for (let j = i + 2; j < lines.length; j += 1) {
      if (removed.has(j)) continue;
      let len = 0;
      while (
        i + len < j &&
        j + len < lines.length &&
        !removed.has(i + len) &&
        !removed.has(j + len) &&
        canonicals[i + len]!.length >= 4 &&
        canonicals[i + len] === canonicals[j + len]
      ) {
        len += 1;
      }
      if (len >= 2 && new Set(canonicals.slice(i, i + len)).size >= 2) {
        for (let k = 0; k < len; k += 1) removed.add(j + k);
      }
    }
  }

  return lines
    .filter((_, idx) => !removed.has(idx))
    .join('\n')
    .trim();
}
