import { Boxes, type LucideIcon } from 'lucide-react';
import {
  CATEGORY_COLOR_OPTIONS,
  CATEGORY_ICON_OPTIONS,
  CUSTOM_FIELD_TYPE_OPTIONS,
} from '@/features/inventory/constants';
import type {
  CustomFieldDefinition,
  CustomFieldType,
  CustomFieldValue,
} from '@/features/inventory/types';

const TURKISH_CHAR_MAP: Record<string, string> = {
  ç: 'c',
  Ç: 'c',
  ğ: 'g',
  Ğ: 'g',
  ı: 'i',
  I: 'i',
  İ: 'i',
  ö: 'o',
  Ö: 'o',
  ş: 's',
  Ş: 's',
  ü: 'u',
  Ü: 'u',
};

export function slugifyFieldKey(label: string): string {
  const normalized = label
    .trim()
    .split('')
    .map((ch) => TURKISH_CHAR_MAP[ch] ?? ch)
    .join('')
    .toLowerCase();

  return normalized
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 48);
}

export function ensureUniqueFieldKey(
  baseKey: string,
  existingKeys: string[],
): string {
  const cleanBase = baseKey || 'alan';
  if (!existingKeys.includes(cleanBase)) return cleanBase;
  let index = 2;
  while (existingKeys.includes(`${cleanBase}_${index}`)) {
    index += 1;
  }
  return `${cleanBase}_${index}`;
}

export function resolveCategoryColorHex(colorToken?: string): string {
  const found = CATEGORY_COLOR_OPTIONS.find((opt) => opt.value === colorToken);
  return found?.swatchColor ?? 'rgb(var(--accent))';
}

export function resolveCategoryIconComponent(iconName?: string): LucideIcon {
  const found = CATEGORY_ICON_OPTIONS.find((opt) => opt.value === iconName);
  return found?.icon ?? Boxes;
}

export function getCustomFieldTypeLabel(type: CustomFieldType): string {
  return (
    CUSTOM_FIELD_TYPE_OPTIONS.find((opt) => opt.value === type)?.shortLabel ??
    type
  );
}

export function formatCustomFieldBadge(field: CustomFieldDefinition): string {
  const typeLabel = getCustomFieldTypeLabel(field.type);
  if (field.type === 'number' && field.unit) {
    return `${typeLabel} · ${field.unit}`;
  }
  if (field.type === 'select' && field.options && field.options.length > 0) {
    return `${typeLabel} (${field.options.length})`;
  }
  return typeLabel;
}

export function formatCustomFieldValue(
  field: CustomFieldDefinition,
  value: CustomFieldValue | undefined,
): string {
  if (value === undefined || value === '') return '—';
  if (field.type === 'boolean') {
    if (value === true || value === 'true') return 'Evet';
    if (value === false || value === 'false') return 'Hayır';
  }
  if (field.type === 'date' && typeof value === 'string') {
    const ms = Date.parse(value);
    if (!Number.isNaN(ms)) {
      return new Date(ms).toLocaleDateString('tr-TR');
    }
  }
  if (field.type === 'number' && field.unit) {
    return `${value} ${field.unit}`;
  }
  return String(value);
}

export function buildDefaultCustomFieldValues(
  fields: CustomFieldDefinition[],
  existing: Record<string, CustomFieldValue> = {},
): Record<string, CustomFieldValue> {
  const next: Record<string, CustomFieldValue> = { ...existing };
  for (const field of fields) {
    if (next[field.key] === undefined && field.defaultValue !== undefined) {
      next[field.key] = field.defaultValue;
    }
  }
  return next;
}

export function validateCustomFieldValues(
  fields: CustomFieldDefinition[],
  values: Record<string, CustomFieldValue>,
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const field of fields) {
    const raw = values[field.key];
    const isEmpty =
      raw === undefined ||
      raw === null ||
      (typeof raw === 'string' && raw.trim() === '');

    if (field.required && isEmpty) {
      errors[field.key] = `${field.label} alanı zorunludur.`;
      continue;
    }

    if (isEmpty) continue;

    if (field.type === 'number') {
      const numeric = typeof raw === 'number' ? raw : Number(raw);
      if (Number.isNaN(numeric)) {
        errors[field.key] = `${field.label} geçerli bir sayı olmalıdır.`;
        continue;
      }
      if (field.min !== undefined && numeric < field.min) {
        errors[field.key] = `${field.label} en az ${field.min} olmalıdır.`;
        continue;
      }
      if (field.max !== undefined && numeric > field.max) {
        errors[field.key] = `${field.label} en fazla ${field.max} olmalıdır.`;
      }
    }

    if (field.type === 'url' && typeof raw === 'string') {
      try {
        const parsed = new URL(raw);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
          errors[field.key] = 'Geçerli bir http/https bağlantısı giriniz.';
        }
      } catch {
        errors[field.key] = 'Geçerli bir URL giriniz (örn. https://...).';
      }
    }
  }

  return errors;
}
