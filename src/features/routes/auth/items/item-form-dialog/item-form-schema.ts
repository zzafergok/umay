import { z } from 'zod';
import type { ItemInput } from '@/features/inventory/schemas';
import type {
  Category,
  CustomFieldValue,
  Item,
  Location,
} from '@/features/inventory/types';
import { buildDefaultCustomFieldValues } from '@/features/inventory/utils';
import { parseAmountInput } from '@/lib/utils';

const amountFieldValue = z.union([z.string(), z.number()]).optional();

export const itemFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Ürün adı zorunludur.')
    .max(120, 'Ürün adı en fazla 120 karakter olabilir.'),
  categoryId: z.string().trim().min(1, 'Kategori seçimi zorunludur.'),
  locationId: z.string().trim().min(1, 'Konum seçimi zorunludur.'),
  type: z.enum(['durable', 'consumable', 'component']),
  status: z.enum(['active', 'in_repair', 'lent', 'discarded']),
  quantity: z
    .union([z.string(), z.number()])
    .refine((val) => parseAmountInput(val) >= 0, 'Miktar negatif olamaz.'),
  unit: z.string().trim().min(1, 'Birim zorunludur.').max(24),
  minQuantity: amountFieldValue,
  targetQuantity: amountFieldValue,
  barcode: z.string().trim().max(80).optional(),
  brand: z.string().trim().max(80).optional(),
  model: z.string().trim().max(80).optional(),
  serialNumber: z.string().trim().max(100).optional(),
  purchaseDate: z.string().nullable().optional(),
  purchasePrice: amountFieldValue,
  currency: z.enum(['TRY', 'USD', 'EUR']),
  store: z.string().trim().max(100).optional(),
  warrantyEndsAt: z.string().nullable().optional(),
  expiresAt: z.string().nullable().optional(),
  notes: z.string().trim().max(2000),
});

export type ItemFormValues = z.infer<typeof itemFormSchema>;

function toOptionalPositiveNumber(
  raw: string | number | undefined,
): number | undefined {
  if (raw === undefined || raw === null || String(raw).trim() === '') {
    return undefined;
  }
  const parsed = parseAmountInput(raw);
  return parsed >= 0 ? parsed : undefined;
}

function toIsoDateSlice(val?: string): string | null {
  if (!val) return null;
  return val.slice(0, 10);
}

export function buildItemFormDefaults(
  editItem: Item | undefined,
  categories: Category[],
  locations: Location[],
  initialBarcode?: string,
  userDefaults?: { currency?: Item['currency']; defaultUnit?: string },
): ItemFormValues {
  const defaultCategory =
    categories.find((c) => c.id === editItem?.categoryId) ?? categories[0];
  const defaults = defaultCategory?.itemDefaults;

  return {
    name: editItem?.name ?? '',
    categoryId: editItem?.categoryId ?? defaultCategory?.id ?? '',
    locationId: editItem?.locationId ?? locations[0]?.id ?? '',
    type:
      editItem?.type ??
      (defaults?.defaultType === 'consumable'
        ? defaults.defaultType
        : 'consumable'),
    status: editItem?.status ?? 'active',
    quantity: editItem?.quantity ?? 1,
    unit:
      editItem?.unit ??
      defaults?.defaultUnit ??
      userDefaults?.defaultUnit ??
      'adet',
    minQuantity: editItem?.minQuantity ?? defaults?.defaultMinQuantity ?? 1,
    targetQuantity: editItem?.targetQuantity ?? '',
    barcode: editItem?.barcode ?? initialBarcode ?? '',
    brand: editItem?.brand ?? '',
    model: editItem?.model ?? '',
    serialNumber: editItem?.serialNumber ?? '',
    purchaseDate: toIsoDateSlice(editItem?.purchaseDate),
    purchasePrice: editItem?.purchasePrice ?? '',
    currency: editItem?.currency ?? userDefaults?.currency ?? 'TRY',
    store: editItem?.store ?? '',
    warrantyEndsAt: toIsoDateSlice(editItem?.warrantyEndsAt),
    expiresAt: toIsoDateSlice(editItem?.expiresAt),
    notes: editItem?.notes ?? '',
  };
}

export function buildInitialCustomValues(
  editItem: Item | undefined,
  categories: Category[],
): Record<string, CustomFieldValue> {
  const activeCategory =
    categories.find((c) => c.id === editItem?.categoryId) ?? categories[0];
  if (!activeCategory) return editItem?.customFieldValues ?? {};
  return buildDefaultCustomFieldValues(
    activeCategory.customFields,
    editItem?.customFieldValues ?? {},
  );
}

export function toItemPayload(
  values: ItemFormValues,
  customValues: Record<string, CustomFieldValue>,
  photos: string[],
  tags: string[],
  documents: ItemInput['documents'],
): ItemInput {
  const cleanOptionalString = (val?: string | null) =>
    val && val.trim() ? val.trim() : undefined;

  return {
    name: values.name.trim(),
    categoryId: values.categoryId,
    locationId: values.locationId,
    type: values.type,
    status: values.status,
    quantity: parseAmountInput(values.quantity),
    unit: values.unit.trim() || 'adet',
    minQuantity: toOptionalPositiveNumber(values.minQuantity) ?? 0,
    targetQuantity: toOptionalPositiveNumber(values.targetQuantity),
    barcode: cleanOptionalString(values.barcode),
    brand: cleanOptionalString(values.brand),
    model: cleanOptionalString(values.model),
    serialNumber: cleanOptionalString(values.serialNumber),
    purchaseDate: cleanOptionalString(values.purchaseDate),
    purchasePrice: toOptionalPositiveNumber(values.purchasePrice),
    currency: values.currency,
    store: cleanOptionalString(values.store),
    warrantyEndsAt: cleanOptionalString(values.warrantyEndsAt),
    expiresAt: cleanOptionalString(values.expiresAt),
    photos,
    documents,
    tags,
    customFieldValues: customValues,
    notes: values.notes.trim(),
  };
}
