import type { CurrencyCode } from './inventory';

export type LifespanMode = 'time' | 'usage' | 'both';

export type PartStatus = 'ok' | 'due_soon' | 'overdue';

export interface PartLifespan {
  mode: LifespanMode;
  days?: number;
  usageUnit?: string;
  usageLimit?: number;
}

export interface Part {
  id: string;
  name: string;
  parentItemId: string | null;
  spareItemId: string | null;
  lifespan: PartLifespan;
  installedAt: string;
  usageCurrent?: number;
  nextReplacementAt: string | null;
  lastReplacedAt?: string;
  status: PartStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
}

export interface ReplacementLog {
  id: string;
  partId: string;
  replacedAt: string;
  oldInstalledAt: string;
  usageAtReplacement?: number;
  spareItemId?: string | null;
  cost?: number;
  note?: string;
  createdAt: string;
}

export type StockMovementType =
  'in' | 'out' | 'adjust' | 'consume' | 'replace_part' | 'discard';

export interface StockMovement {
  id: string;
  itemId: string;
  type: StockMovementType;
  delta: number;
  quantityAfter: number;
  reason?: string;
  relatedPartId?: string;
  at: string;
}

export type ShoppingSource = 'auto_low_stock' | 'auto_part_due' | 'manual';

export interface ShoppingListItem {
  id: string;
  itemId: string | null;
  freeText?: string;
  qty: number;
  unit?: string;
  source: ShoppingSource;
  done: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserSettings {
  currency: CurrencyCode;
  dateFormat: 'dd.MM.yyyy' | 'yyyy-MM-dd';
  updatedAt: string;
}
