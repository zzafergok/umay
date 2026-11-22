import type { CurrencyCode, ItemType } from './inventory';

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

export type ShoppingSource =
  'auto_low_stock' | 'auto_part_due' | 'manual' | 'receipt_ai';

export type ShoppingPriority = 'low' | 'normal' | 'high';

export interface ShoppingList {
  id: string;
  name: string;
  description?: string;
  store?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShoppingListItem {
  id: string;
  listId?: string;
  itemId: string | null;
  freeText?: string;
  qty: number;
  unit?: string;
  category?: string;
  locationId?: string;
  type?: ItemType;
  minQuantity?: number;
  brand?: string;
  model?: string;
  barcode?: string;
  currency?: CurrencyCode;
  expiresAt?: string;
  priority?: ShoppingPriority;
  estimatedPrice?: number;
  store?: string;
  note?: string;
  source: ShoppingSource;
  done: boolean;
  boughtAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserSettings {
  currency: CurrencyCode;
  dateFormat: 'dd.MM.yyyy' | 'yyyy-MM-dd';
  defaultUnit?: string;
  compactMode?: boolean;
  updatedAt: string;
}
