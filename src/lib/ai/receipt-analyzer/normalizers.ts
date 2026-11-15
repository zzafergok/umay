export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function pickFirst(
  record: Record<string, unknown>,
  keys: readonly string[],
): unknown {
  for (const key of keys) {
    if (key in record && record[key] !== undefined) {
      return record[key];
    }
  }
  return undefined;
}

export function toOptionalString(value: unknown): string | null {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  return null;
}

export function toOptionalNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
    return value;
  }
  if (typeof value === 'string') {
    const cleaned = value
      .replace(/[^\d.,-]/g, '')
      .replace(/\.(?=\d{3}(?:\D|$))/g, '')
      .replace(',', '.');
    if (!cleaned) return null;
    const parsed = Number(cleaned);
    if (Number.isFinite(parsed) && parsed >= 0) {
      return parsed;
    }
  }
  return null;
}

export function normalizeCurrency(value: unknown): string {
  const raw = toOptionalString(value);
  if (!raw) return 'TRY';
  const upper = raw.toUpperCase();
  if (upper === 'TL' || upper === '₺' || upper.includes('TRY')) {
    return 'TRY';
  }
  return raw.slice(0, 20);
}

export function normalizeConfidence(
  value: unknown,
): 'high' | 'medium' | 'low' {
  if (typeof value === 'number' && Number.isFinite(value)) {
    if (value >= 0.75) return 'high';
    if (value >= 0.4) return 'medium';
    return 'low';
  }
  if (typeof value === 'string') {
    const lower = value.trim().toLowerCase();
    if (lower === 'high' || lower === 'yüksek' || lower === 'yuksek') {
      return 'high';
    }
    if (lower === 'low' || lower === 'düşük' || lower === 'dusuk') {
      return 'low';
    }
  }
  return 'medium';
}

export function normalizeVatRate(value: unknown): number | null {
  const num = toOptionalNumber(value);
  if (num === null || num > 100) return null;
  return num;
}
