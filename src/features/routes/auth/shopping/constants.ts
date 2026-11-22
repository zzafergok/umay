import type {
  ShoppingPriority,
  ShoppingSource,
} from '@/features/inventory/types';
import {
  INVENTORY_UNIT_OPTIONS,
  INVENTORY_UNITS,
  UNIT_ALIASES,
} from '@/features/inventory/constants';
import type { SelectOption } from '@/components/forms';

export const SHOPPING_UNIT_OPTIONS: SelectOption[] = INVENTORY_UNIT_OPTIONS;

export const SHOPPING_UNIT_ALIASES: Record<string, string> = Object.fromEntries(
  Object.entries(UNIT_ALIASES).map(([alias, unitId]) => [
    alias,
    INVENTORY_UNITS[unitId].label.replace(/\s*\([^)]*\)$/, ''),
  ]),
);

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
