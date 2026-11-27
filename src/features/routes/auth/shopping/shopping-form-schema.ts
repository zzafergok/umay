import { z } from 'zod';
import type { SelectOption } from '@/components/forms';
import type { Category, Item, Location } from '@/features/inventory/types';
import { SHOPPING_CATEGORY_PRESETS, SHOPPING_UNIT_OPTIONS } from './constants';
import { formatShoppingUnit } from './shopping-utils';

export const SHOPPING_ITEM_TYPE_OPTIONS: SelectOption[] = [
  { value: 'consumable', label: 'Sarf / Tüketim' },
  { value: 'durable', label: 'Demirbaş / Dayanıklı' },
  { value: 'component', label: 'Parça / Bileşen' },
];

export const shoppingFormSchema = z.object({
  freeText: z
    .string()
    .trim()
    .min(1, 'Ürün adı zorunludur.')
    .max(120, 'En fazla 120 karakter olabilir.'),
  qty: z
    .number({ error: 'Geçerli bir miktar girin.' })
    .positive('Miktar 0 dan büyük olmalıdır.')
    .max(100000),
  unit: z.string().trim().min(1).max(24),
  priority: z.enum(['low', 'normal', 'high']),
  category: z.string().trim().max(60).nullable().optional(),
  locationId: z.string().trim().nullable().optional(),
  type: z.enum(['durable', 'consumable', 'component']),
  minQuantity: z.union([z.string(), z.number()]).optional(),
  itemId: z.string().trim().nullable().optional(),
  brand: z.string().trim().max(80).optional(),
  model: z.string().trim().max(80).optional(),
  barcode: z.string().trim().max(80).optional(),
  store: z.string().trim().max(80).optional(),
  price: z.union([z.string(), z.number()]).optional(),
  expiresAt: z.string().trim().nullable().optional(),
  note: z.string().trim().max(240).optional(),
});

export type ShoppingFormValues = z.infer<typeof shoppingFormSchema>;

export const SHOPPING_FORM_DEFAULT_VALUES: ShoppingFormValues = {
  freeText: '',
  qty: 1,
  unit: 'Adet',
  priority: 'normal',
  category: null,
  locationId: null,
  type: 'consumable',
  minQuantity: '',
  itemId: null,
  brand: '',
  model: '',
  barcode: '',
  store: '',
  price: '',
  expiresAt: null,
  note: '',
};

export function buildShoppingCategoryOptions(
  categories: Category[],
): SelectOption[] {
  const seen = new Set<string>();
  const options: SelectOption[] = [];

  for (const cat of categories) {
    const trimmed = cat.name.trim();
    if (!trimmed || seen.has(trimmed.toLocaleLowerCase('tr'))) continue;
    seen.add(trimmed.toLocaleLowerCase('tr'));
    options.push({ value: trimmed, label: trimmed });
  }

  for (const preset of SHOPPING_CATEGORY_PRESETS) {
    if (seen.has(preset.toLocaleLowerCase('tr'))) continue;
    seen.add(preset.toLocaleLowerCase('tr'));
    options.push({ value: preset, label: preset });
  }

  return options;
}

export function buildShoppingLocationOptions(
  locations: Location[],
): SelectOption[] {
  return locations.map((loc) => ({
    value: loc.id,
    label: loc.path.length > 0 ? loc.path.join('/') : loc.name,
  }));
}

export function buildLinkedItemOptions(items: Item[]): SelectOption[] {
  return items.map((item) => ({
    value: item.id,
    label: `${item.name} (${item.quantity} ${formatShoppingUnit(item.unit)})`,
  }));
}

export function buildShoppingUnitOptions(
  currentUnit?: string | null,
): SelectOption[] {
  const formatted = formatShoppingUnit(currentUnit);
  const exists = SHOPPING_UNIT_OPTIONS.some((opt) => opt.value === formatted);
  if (exists) return SHOPPING_UNIT_OPTIONS;
  return [{ value: formatted, label: formatted }, ...SHOPPING_UNIT_OPTIONS];
}

export function getLinkedItemFieldMeta(hasItems: boolean) {
  return {
    disabled: !hasItems,
    allowNone: hasItems,
    noneLabel: 'Eşleştirme yok (isteğe bağlı)',
    placeholder: hasItems
      ? 'Ev stoğundan ürün seçin'
      : 'Stokta henüz kayıtlı ürün yok',
    description: hasItems
      ? 'Bir ürün seçerseniz, alışverişte alındı işaretlediğinizde ev stoğu otomatik artırılır.'
      : 'Alındığında ev stoğunu otomatik artırmak için önce Ürünler sayfasından ürün ekleyin.',
  };
}
