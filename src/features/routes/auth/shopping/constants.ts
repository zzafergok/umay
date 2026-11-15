import type {
  ShoppingPriority,
  ShoppingSource,
} from '@/features/inventory/types';
import type { SelectOption } from '@/components/forms';

export const SHOPPING_UNIT_OPTIONS: SelectOption[] = [
  { value: 'Adet', label: 'Adet' },
  { value: 'Paket', label: 'Paket' },
  { value: 'Kutu', label: 'Kutu' },
  { value: 'Kilogram', label: 'Kilogram' },
  { value: 'Gram', label: 'Gram' },
  { value: 'Litre', label: 'Litre' },
  { value: 'Mililitre', label: 'Mililitre' },
  { value: 'Şişe', label: 'Şişe' },
  { value: 'Rulo', label: 'Rulo' },
];

export const SHOPPING_UNIT_ALIASES: Record<string, string> = {
  adet: 'Adet',
  paket: 'Paket',
  pkt: 'Paket',
  kutu: 'Kutu',
  kg: 'Kilogram',
  kilo: 'Kilogram',
  kilogram: 'Kilogram',
  gr: 'Gram',
  g: 'Gram',
  gram: 'Gram',
  lt: 'Litre',
  l: 'Litre',
  litre: 'Litre',
  ml: 'Mililitre',
  mililitre: 'Mililitre',
  şişe: 'Şişe',
  sise: 'Şişe',
  rulo: 'Rulo',
};

export const SHOPPING_PRIORITY_OPTIONS: SelectOption[] = [
  { value: 'high', label: 'Acil' },
  { value: 'normal', label: 'Normal' },
  { value: 'low', label: 'Düşük' },
];

export const SHOPPING_PRIORITY_META: Record<
  ShoppingPriority,
  {
    label: string;
    badgeVariant: 'destructive' | 'secondary' | 'outline';
    rank: number;
  }
> = {
  high: { label: 'Acil', badgeVariant: 'destructive', rank: 0 },
  normal: { label: 'Normal', badgeVariant: 'secondary', rank: 1 },
  low: { label: 'Düşük', badgeVariant: 'outline', rank: 2 },
};

export const SHOPPING_SOURCE_LABELS: Record<ShoppingSource, string> = {
  auto_low_stock: 'Düşük Stok',
  auto_part_due: 'Parça Vadesi',
  receipt_ai: 'Fiş AI',
  manual: 'Manuel',
};

export const SHOPPING_CATEGORY_PRESETS = [
  'Gıda',
  'Temizlik',
  'Kişisel Bakım',
  'Ev & Mutfak',
  'Yedek Parça',
  'Diğer',
] as const;
