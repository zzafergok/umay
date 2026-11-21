import { repairTruncatedReceiptJson } from './json-repair';
import {
  isRecord,
  normalizeConfidence,
  normalizeCurrency,
  normalizeVatRate,
  pickFirst,
  toOptionalNumber,
  toOptionalString,
} from './normalizers';
import { receiptModelOutputSchema, type ReceiptModelOutput } from './schemas';

export function extractJsonFromModelText(rawContent: string): string | null {
  const trimmed = rawContent.trim();
  if (!trimmed) return null;

  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  const firstBrace = trimmed.indexOf('{');
  const firstBracket = trimmed.indexOf('[');
  const useArray =
    firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace);

  if (useArray) {
    const lastBracket = trimmed.lastIndexOf(']');
    if (lastBracket > firstBracket) {
      return trimmed.slice(firstBracket, lastBracket + 1);
    }
  }

  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  return null;
}

function unwrapReceiptContainer(
  parsed: unknown,
): Record<string, unknown> | null {
  if (Array.isArray(parsed)) return { items: parsed };
  if (!isRecord(parsed)) return null;

  for (const wrapperKey of ['receipt', 'data', 'result', 'analysis']) {
    const nested = parsed[wrapperKey];
    if (isRecord(nested) && !('items' in parsed) && !('rawText' in parsed)) {
      return nested;
    }
  }
  return parsed;
}

function normalizeReceiptItem(item: Record<string, unknown>) {
  return {
    name:
      toOptionalString(
        pickFirst(item, [
          'name',
          'productName',
          'product_name',
          'title',
          'description',
          'item',
        ]),
      ) ?? 'Ürün',
    normalizedName:
      toOptionalString(
        pickFirst(item, [
          'normalizedName',
          'normalized_name',
          'cleanName',
          'clean_name',
        ]),
      ) ?? '',
    quantity:
      toOptionalNumber(pickFirst(item, ['quantity', 'qty', 'count'])) ?? 1,
    unit: toOptionalString(pickFirst(item, ['unit', 'uom'])) ?? 'adet',
    unitPrice: toOptionalNumber(
      pickFirst(item, ['unitPrice', 'unit_price', 'price']),
    ),
    totalPrice: toOptionalNumber(
      pickFirst(item, [
        'totalPrice',
        'total_price',
        'lineTotal',
        'line_total',
        'total',
        'amount',
      ]),
    ),
    categoryHint: toOptionalString(
      pickFirst(item, ['categoryHint', 'category_hint', 'category']),
    ),
    vatRate: normalizeVatRate(
      pickFirst(item, ['vatRate', 'vat_rate', 'taxRate', 'tax_rate']),
    ),
  };
}

function normalizeRawReceiptObject(
  raw: Record<string, unknown>,
): Record<string, unknown> {
  const rawItemsCandidate = pickFirst(raw, [
    'items',
    'lineItems',
    'line_items',
    'products',
  ]);
  const rawItems = Array.isArray(rawItemsCandidate) ? rawItemsCandidate : [];

  return {
    rawText:
      toOptionalString(
        pickFirst(raw, [
          'rawText',
          'raw_text',
          'ocrText',
          'ocr_text',
          'text',
          'raw',
        ]),
      ) ?? '',
    merchantName: toOptionalString(
      pickFirst(raw, [
        'merchantName',
        'merchant_name',
        'merchant',
        'storeName',
        'store_name',
        'store',
      ]),
    ),
    merchantTaxId: toOptionalString(
      pickFirst(raw, [
        'merchantTaxId',
        'merchant_tax_id',
        'taxId',
        'tax_id',
        'vkn',
      ]),
    ),
    date: toOptionalString(
      pickFirst(raw, ['date', 'receiptDate', 'receipt_date']),
    ),
    time: toOptionalString(
      pickFirst(raw, ['time', 'receiptTime', 'receipt_time']),
    ),
    currency: normalizeCurrency(
      pickFirst(raw, ['currency', 'currencyCode', 'currency_code']),
    ),
    subtotal: toOptionalNumber(
      pickFirst(raw, ['subtotal', 'sub_total', 'netTotal', 'net_total']),
    ),
    taxTotal: toOptionalNumber(
      pickFirst(raw, ['taxTotal', 'tax_total', 'vatTotal', 'vat_total', 'kdv']),
    ),
    discountTotal: toOptionalNumber(
      pickFirst(raw, ['discountTotal', 'discount_total', 'discount']),
    ),
    grandTotal: toOptionalNumber(
      pickFirst(raw, [
        'grandTotal',
        'grand_total',
        'total',
        'totalAmount',
        'total_amount',
      ]),
    ),
    paymentMethod: toOptionalString(
      pickFirst(raw, ['paymentMethod', 'payment_method', 'payment']),
    ),
    items: rawItems.filter(isRecord).map(normalizeReceiptItem),
    notes: toOptionalString(pickFirst(raw, ['notes', 'note', 'summary'])),
    confidence: normalizeConfidence(pickFirst(raw, ['confidence'])),
  };
}

export function parseReceiptModelResponse(rawContent: string): {
  data: ReceiptModelOutput;
  parsedFromJson: boolean;
} {
  const jsonCandidate = extractJsonFromModelText(rawContent);
  if (jsonCandidate) {
    try {
      const container = unwrapReceiptContainer(JSON.parse(jsonCandidate));
      if (container) {
        const validated = receiptModelOutputSchema.safeParse(
          normalizeRawReceiptObject(container),
        );
        if (validated.success) {
          return {
            data: {
              ...validated.data,
              rawText: validated.data.rawText || rawContent.trim(),
            },
            parsedFromJson: true,
          };
        }
      }
    } catch {
      // Fall through to truncated JSON repair below
    }
  }

  const repairedContainer = repairTruncatedReceiptJson(rawContent);
  if (repairedContainer) {
    const validated = receiptModelOutputSchema.safeParse(
      normalizeRawReceiptObject(repairedContainer),
    );
    if (validated.success) {
      return {
        data: {
          ...validated.data,
          rawText:
            validated.data.rawText ||
            validated.data.items
              .map(
                (item) =>
                  `${item.name}${item.totalPrice !== null ? ` ${item.totalPrice}` : ''}`,
              )
              .join('\n'),
        },
        parsedFromJson: true,
      };
    }
  }

  return {
    data: receiptModelOutputSchema.parse({
      rawText: rawContent.trim(),
      confidence: 'low',
      notes:
        'Model yanıtı yapılandırılmış JSON olarak ayrıştırılamadı; ham metin korundu.',
    }),
    parsedFromJson: false,
  };
}
