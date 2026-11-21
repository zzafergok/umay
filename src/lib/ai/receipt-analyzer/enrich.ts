import {
  createOpenRouterChatCompletion,
  OpenRouterApiError,
} from '@/lib/ai/openrouter';
import { isRecord, toOptionalString } from './normalizers';
import { extractJsonFromModelText } from './parser';
import { extractFirstChoicePayload } from './response-extract';
import {
  RECEIPT_CATEGORY_HINTS,
  type ReceiptEnrichedItem,
  type ReceiptEnrichInput,
} from './schemas';

const ENRICH_TIMEOUT_MS = 60_000;
const FALLBACK_MODEL = 'openrouter/free';
const MAX_NAME_LENGTH = 120;

/**
 * Türkçe Karşılığı (Sistem İstemi):
 * Kısaltılmış, büyük harfli ve ASCII'ye çevrilmiş market fişi ürün adlarını okunaklı Türkçe ürün adına
 * çevir (doğru büyük/küçük harf, Türkçe karakterler, açılmış kısaltmalar; marka ve gramaj korunur) ve her
 * ürüne sabit kategori listesinden bir kategori ata. Kalem ekleme, silme, birleştirme veya sıralama değiştirme.
 */
export const RECEIPT_ENRICH_SYSTEM_PROMPT = `You clean up Turkish supermarket receipt product names.
Input: a JSON object {"names":[...]} where each name is an abbreviated, UPPERCASE, often ASCII-folded receipt line (e.g. "ETI SUSAMLI CUBUK 56", "DIMES M. SUYU VISNE").
For every name (same index), return:
- "n": a readable Turkish product name with proper casing and Turkish characters, abbreviations expanded, brand and size kept (e.g. "ETI SUSAMLI CUBUK 56" -> "Eti Susamlı Çubuk 56g"). Do not invent details that are not implied by the name.
- "c": exactly one category from: ${RECEIPT_CATEGORY_HINTS.map((c) => `"${c}"`).join(', ')}.
Never merge, drop, add or reorder entries. Return ONLY minified JSON, no Markdown, no commentary:
{"items":[{"i":0,"n":"string","c":"string"}]}`;

const canonical = (value: string): string =>
  value.trim().toLocaleLowerCase('tr-TR');

const CATEGORY_LOOKUP = new Map<string, string>(
  RECEIPT_CATEGORY_HINTS.map((category) => [canonical(category), category]),
);

/** Model yanıtını indeks bazlı güvenli şekilde ayrıştırır; eksik kalemler boş bırakılır. */
export function parseEnrichmentResponse(
  content: string,
  count: number,
): ReceiptEnrichedItem[] {
  const result = Array.from(
    { length: count },
    (): ReceiptEnrichedItem => ({ normalizedName: '', categoryHint: null }),
  );
  const json = extractJsonFromModelText(content);
  if (!json) return result;

  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return result;
  }
  const list: unknown[] = Array.isArray(parsed)
    ? parsed
    : isRecord(parsed) && Array.isArray(parsed.items)
      ? parsed.items
      : [];

  list.forEach((entry, position) => {
    if (!isRecord(entry)) return;
    const rawIndex = entry.i ?? entry.index;
    const index =
      typeof rawIndex === 'number' && Number.isInteger(rawIndex)
        ? rawIndex
        : position;
    if (index < 0 || index >= count) return;

    const name = toOptionalString(entry.n ?? entry.name ?? entry.normalizedName);
    const category = toOptionalString(
      entry.c ?? entry.category ?? entry.categoryHint,
    );
    result[index] = {
      normalizedName: name ? name.slice(0, MAX_NAME_LENGTH) : '',
      categoryHint: category ? (CATEGORY_LOOKUP.get(canonical(category)) ?? null) : null,
    };
  });
  return result;
}

export async function enrichReceiptItemNames(
  input: ReceiptEnrichInput,
): Promise<ReceiptEnrichedItem[]> {
  const model = input.modelId ?? FALLBACK_MODEL;
  const basePayload = {
    model,
    temperature: 0,
    max_tokens: Math.min(8192, 1500 + input.names.length * 45),
    messages: [
      { role: 'system' as const, content: RECEIPT_ENRICH_SYSTEM_PROMPT },
      {
        role: 'user' as const,
        content: JSON.stringify({ names: input.names }),
      },
    ],
  };
  const reasoning = model.startsWith('google/gemini-4')
    ? { effort: 'low' as const }
    : { enabled: false as const };
  const send = (withReasoning: boolean) =>
    createOpenRouterChatCompletion(
      withReasoning ? { ...basePayload, reasoning } : basePayload,
      { timeoutMs: ENRICH_TIMEOUT_MS },
    );

  let response;
  try {
    response = await send(true);
  } catch (error) {
    const retryable =
      error instanceof OpenRouterApiError &&
      (error.status === 400 || error.status === 422);
    if (!retryable) throw error;
    response = await send(false);
  }

  const extracted = extractFirstChoicePayload(response);
  const content = extracted.contentText || extracted.reasoning || '';
  if (!content) {
    throw new OpenRouterApiError(
      'Model ürün adı düzenleme çıktısı üretemedi.',
      502,
      'empty_completion',
    );
  }
  return parseEnrichmentResponse(content, input.names.length);
}
