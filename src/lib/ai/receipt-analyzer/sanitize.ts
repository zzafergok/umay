import type { ReceiptLineItem } from './schemas';

export const TOTALS_TOLERANCE = 0.02;
const BARCODE_LINE_PATTERN = /^\s*\d{5,}(?:\s*[x×].*)?$/i;
const QUANTITY_MODIFIER_LINE_PATTERN =
  /^\s*(?:\d+(?:[.,]\d+)?|[A-Za-z][.,]\d+)\s*(?:kg|g|gr|l|lt|ml|ad|adet|pk|paket)?\s*[x×*@]\s*\*?\s*\d+(?:[.,]\d+)?(?:\s*-\s*[A-Z])?\s*$/i;

const UNIT_ALIAS: Record<string, string> = {
  kg: 'kg',
  g: 'g',
  gr: 'g',
  l: 'l',
  lt: 'l',
  ml: 'ml',
  ad: 'adet',
  adet: 'adet',
  pk: 'paket',
  paket: 'paket',
};

export const round2 = (value: number): number => Number(value.toFixed(2));
export const sumItems = (items: ReceiptLineItem[]): number =>
  round2(items.reduce((sum, item) => sum + (item.totalPrice ?? 0), 0));

function parseQuantityModifierLine(name: string) {
  const match = name.match(
    /^\s*(\d+(?:[.,]\d+)?)\s*(kg|g|gr|l|lt|ml|ad|adet|pk|paket)?\s*[x×*@]\s*\*?\s*(\d+(?:[.,]\d+)?)(?:\s*-\s*[A-Z])?\s*$/i,
  );
  if (!match?.[1] || !match[3]) return null;
  const quantity = Number(match[1].replace(',', '.'));
  const unitPrice = Number(match[3].replace(',', '.'));
  if (!Number.isFinite(quantity) || quantity <= 0) return null;
  if (!Number.isFinite(unitPrice) || unitPrice <= 0) return null;
  const rawUnit = match[2]?.toLowerCase();
  return {
    quantity,
    unit: rawUnit ? (UNIT_ALIAS[rawUnit] ?? 'adet') : 'adet',
    unitPrice,
  };
}

const isNonProductModifierLine = (name: string): boolean =>
  BARCODE_LINE_PATTERN.test(name) || QUANTITY_MODIFIER_LINE_PATTERN.test(name);

/**
 * Barkod satırlarını ve barkodsuz miktar ön satırlarını ("1,892 kg X 8,95", "24 X 0,45") ayıklar.
 * Miktar ön satırının tutarı veya birim fiyatı hemen altındaki/üstündeki tekil ürünle eşleşiyorsa birleştirir.
 */
export function sanitizeReceiptItems(
  items: ReceiptLineItem[],
): ReceiptLineItem[] {
  const working = [...items];
  const result: ReceiptLineItem[] = [];
  for (let i = 0; i < working.length; i += 1) {
    const curr = working[i]!;
    if (BARCODE_LINE_PATTERN.test(curr.name)) continue;

    if (QUANTITY_MODIFIER_LINE_PATTERN.test(curr.name)) {
      const parsed = parseQuantityModifierLine(curr.name);
      const next = working[i + 1];
      const computedTotal = parsed
        ? round2(parsed.quantity * parsed.unitPrice)
        : null;
      const matchesLine = (target: ReceiptLineItem | undefined): boolean =>
        Boolean(
          parsed &&
          computedTotal !== null &&
          target &&
          !isNonProductModifierLine(target.name) &&
          target.quantity === 1 &&
          target.totalPrice !== null &&
          (Math.abs(computedTotal - target.totalPrice) <= TOTALS_TOLERANCE ||
            Math.abs(parsed.unitPrice - target.totalPrice) <= TOTALS_TOLERANCE),
        );

      const applyModifier = (target: ReceiptLineItem): ReceiptLineItem => ({
        ...target,
        quantity: parsed!.quantity,
        unit: parsed!.unit,
        unitPrice: parsed!.unitPrice,
        totalPrice:
          curr.totalPrice !== null &&
          computedTotal !== null &&
          Math.abs(curr.totalPrice - computedTotal) <= 0.05
            ? curr.totalPrice
            : (computedTotal ?? target.totalPrice),
      });

      if (parsed && matchesLine(next)) {
        working[i + 1] = applyModifier(next!);
      } else if (parsed && matchesLine(result[result.length - 1])) {
        result[result.length - 1] = applyModifier(result[result.length - 1]!);
      }
      continue;
    }

    result.push(curr);
  }
  return result;
}
