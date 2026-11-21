import { isRecord } from './normalizers';

function stripMarkdownFences(raw: string): string {
  const trimmed = raw.trim();
  const fencedOpen = trimmed.match(/^```(?:json)?\s*([\s\S]*?)(?:```)?$/i);
  return fencedOpen?.[1]?.trim() ?? trimmed;
}

function extractBalancedObjectsFromArray(
  source: string,
  arrayStartBracketIdx: number,
): Record<string, unknown>[] {
  const results: Record<string, unknown>[] = [];
  let inString = false;
  let escaped = false;
  let depth = 0;
  let objStart = -1;

  for (let i = arrayStartBracketIdx + 1; i < source.length; i += 1) {
    const ch = source[i];

    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === '\\' && inString) {
      escaped = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;

    if (ch === '{') {
      if (depth === 0) objStart = i;
      depth += 1;
    } else if (ch === '}') {
      depth -= 1;
      if (depth === 0 && objStart !== -1) {
        const slice = source.slice(objStart, i + 1);
        try {
          const parsed: unknown = JSON.parse(slice);
          if (isRecord(parsed)) {
            results.push(parsed);
          }
        } catch {
          // Bozuk nesneyi atla
        }
        objStart = -1;
      }
    } else if (ch === ']' && depth === 0) {
      break;
    }
  }

  return results;
}

function extractStringField(source: string, keys: string[]): string | null {
  for (const key of keys) {
    const pattern = new RegExp(
      `"${key}"\\s*:\\s*"((?:\\\\.|[^"\\\\])*)"`,
      'i',
    );
    const match = source.match(pattern);
    if (match?.[1] !== undefined) {
      try {
        return JSON.parse(`"${match[1]}"`) as string;
      } catch {
        return match[1];
      }
    }
  }
  return null;
}

function extractNumberOrStringField(
  source: string,
  keys: string[],
): string | number | null {
  for (const key of keys) {
    const numPattern = new RegExp(
      `"${key}"\\s*:\\s*(-?\\d+(?:[.,]\\d+)?)`,
      'i',
    );
    const numMatch = source.match(numPattern);
    if (numMatch?.[1] !== undefined) {
      return numMatch[1];
    }
    const strVal = extractStringField(source, [key]);
    if (strVal !== null) return strVal;
  }
  return null;
}

/**
 * Token limiti (finish_reason: "length") nedeniyle yarıda kesilmiş JSON yanıtlarından
 * tamamlanmış ürün satırlarını (items) ve üst veri alanlarını kurtarır.
 */
export function repairTruncatedReceiptJson(
  rawContent: string,
): Record<string, unknown> | null {
  const cleaned = stripMarkdownFences(rawContent);
  const firstBrace = cleaned.indexOf('{');
  if (firstBrace === -1) return null;

  const fragment = cleaned.slice(firstBrace);
  const itemsKeyMatch = fragment.match(
    /"(?:items|lineItems|line_items|products)"\s*:\s*\[/,
  );

  const items: Record<string, unknown>[] = [];
  if (itemsKeyMatch && itemsKeyMatch.index !== undefined) {
    const bracketIdx =
      itemsKeyMatch.index + itemsKeyMatch[0].lastIndexOf('[');
    items.push(...extractBalancedObjectsFromArray(fragment, bracketIdx));
  }

  const merchantName = extractStringField(fragment, [
    'merchantName',
    'merchant_name',
    'storeName',
    'store_name',
  ]);
  const grandTotal = extractNumberOrStringField(fragment, [
    'grandTotal',
    'grand_total',
    'total',
  ]);

  if (items.length === 0 && !merchantName && grandTotal === null) {
    return null;
  }

  return {
    merchantName,
    merchantTaxId: extractStringField(fragment, [
      'merchantTaxId',
      'merchant_tax_id',
      'vkn',
    ]),
    date: extractStringField(fragment, ['date', 'receiptDate']),
    time: extractStringField(fragment, ['time', 'receiptTime']),
    currency: extractStringField(fragment, ['currency']) ?? 'TRY',
    subtotal: extractNumberOrStringField(fragment, ['subtotal', 'sub_total']),
    taxTotal: extractNumberOrStringField(fragment, [
      'taxTotal',
      'tax_total',
      'vatTotal',
    ]),
    discountTotal: extractNumberOrStringField(fragment, [
      'discountTotal',
      'discount_total',
    ]),
    grandTotal,
    paymentMethod: extractStringField(fragment, [
      'paymentMethod',
      'payment_method',
    ]),
    items,
    rawText: extractStringField(fragment, ['rawText', 'raw_text']) ?? '',
    notes:
      extractStringField(fragment, ['notes', 'note']) ??
      'Uzun fiş yanıtı token sınırında kesildi; tamamlanan kalemler kurtarıldı.',
    confidence:
      extractStringField(fragment, ['confidence']) ??
      (items.length > 0 ? 'medium' : 'low'),
  };
}
