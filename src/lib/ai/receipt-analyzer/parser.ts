import {
  receiptModelOutputSchema,
  type ReceiptModelOutput,
} from './schemas';

function toOptionalNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
    return value;
  }
  if (typeof value === 'string') {
    const cleaned = value
      .replace(/[^\d.,-]/g, '')
      .replace(/\.(?=\d{3}(?:\D|$))/g, '')
      .replace(',', '.');
    const parsed = Number(cleaned);
    if (Number.isFinite(parsed) && parsed >= 0) {
      return parsed;
    }
  }
  return null;
}

export function extractJsonFromModelText(rawContent: string): string | null {
  const trimmed = rawContent.trim();
  if (!trimmed) return null;

  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  return null;
}

function normalizeRawReceiptObject(raw: Record<string, unknown>): Record<string, unknown> {
  const rawItems = Array.isArray(raw.items) ? raw.items : [];
  const normalizedItems = rawItems
    .filter((item): item is Record<string, unknown> =>
      typeof item === 'object' && item !== null,
    )
    .map((item) => ({
      name: typeof item.name === 'string' && item.name.trim() ? item.name.trim() : 'Ürün',
      normalizedName:
        typeof item.normalizedName === 'string' ? item.normalizedName.trim() : '',
      quantity: toOptionalNumber(item.quantity) ?? 1,
      unit: typeof item.unit === 'string' && item.unit.trim() ? item.unit.trim() : 'adet',
      unitPrice: toOptionalNumber(item.unitPrice),
      totalPrice: toOptionalNumber(item.totalPrice),
      categoryHint:
        typeof item.categoryHint === 'string' && item.categoryHint.trim()
          ? item.categoryHint.trim()
          : null,
      vatRate: toOptionalNumber(item.vatRate),
    }));

  return {
    ...raw,
    subtotal: toOptionalNumber(raw.subtotal),
    taxTotal: toOptionalNumber(raw.taxTotal),
    discountTotal: toOptionalNumber(raw.discountTotal),
    grandTotal: toOptionalNumber(raw.grandTotal),
    items: normalizedItems,
  };
}

export function parseReceiptModelResponse(rawContent: string): {
  data: ReceiptModelOutput;
  parsedFromJson: boolean;
} {
  const jsonCandidate = extractJsonFromModelText(rawContent);
  if (jsonCandidate) {
    try {
      const parsedUnknown: unknown = JSON.parse(jsonCandidate);
      if (typeof parsedUnknown === 'object' && parsedUnknown !== null) {
        const normalized = normalizeRawReceiptObject(
          parsedUnknown as Record<string, unknown>,
        );
        const validated = receiptModelOutputSchema.safeParse(normalized);
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
      // Fall through to raw text fallback below
    }
  }

  return {
    data: receiptModelOutputSchema.parse({
      rawText: rawContent.trim(),
      confidence: 'low',
      notes: 'Model yanıtı yapılandırılmış JSON olarak ayrıştırılamadı; ham metin korundu.',
    }),
    parsedFromJson: false,
  };
}
