import type { StatusTone } from '@/components/core/status-pill';
import { ITEM_TYPE_OPTIONS } from '@/features/inventory/constants';
import type { Item } from '@/features/inventory/types';

export interface ItemStockBarState {
  showBar: boolean;
  percent: number;
  barColorClass: string;
  valueColorClass: string;
  thresholdLabel: string | null;
}

/** Resolves the highest-priority exception badge for an inventory item card. */
export function getItemExceptionPill(
  item: Item,
  nowMs: number,
): { tone: StatusTone; label: string } | null {
  if (item.quantity <= 0) {
    return { tone: 'out_of_stock', label: 'Tükendi' };
  }
  if (item.minQuantity > 0 && item.quantity <= item.minQuantity) {
    return { tone: 'low_stock', label: 'Düşük stok' };
  }
  if (item.status === 'in_repair') {
    return { tone: 'in_repair', label: 'Tamirde' };
  }
  if (item.status === 'lent') {
    return { tone: 'lent', label: 'Ödünç' };
  }
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  const expMs = item.expiresAt ? Date.parse(item.expiresAt) : NaN;
  if (!Number.isNaN(expMs)) {
    if (expMs < nowMs) {
      return { tone: 'overdue', label: 'SKT geçti' };
    }
    if (expMs - nowMs <= thirtyDaysMs) {
      return { tone: 'due_soon', label: 'SKT yaklaşıyor' };
    }
  }
  return null;
}

/** Computes stock progress bar percentage, semantic color classes, and threshold label. */
export function getItemStockBarState(item: Item): ItemStockBarState {
  const hasTarget =
    item.targetQuantity !== undefined && item.targetQuantity > 0;
  const hasMin = item.minQuantity > 0;
  const showBar = hasTarget || hasMin;

  const baseline = hasTarget
    ? (item.targetQuantity ?? 1)
    : Math.max(item.minQuantity * 2, item.quantity, 1);

  const percent = showBar
    ? Math.min(100, Math.round((Math.max(0, item.quantity) / baseline) * 100))
    : 0;

  const isOut = item.quantity <= 0;
  const isLow = !isOut && hasMin && item.quantity <= item.minQuantity;

  const barColorClass = isOut
    ? 'bg-danger'
    : isLow
      ? 'bg-warning'
      : 'bg-success';

  const valueColorClass = isOut
    ? 'text-danger'
    : isLow
      ? 'text-warning'
      : 'text-text';

  const thresholdLabel = hasTarget
    ? `Hedef: ${item.targetQuantity} ${item.unit}`
    : hasMin
      ? `Eşik: ${item.minQuantity} ${item.unit}`
      : null;

  return {
    showBar,
    percent,
    barColorClass,
    valueColorClass,
    thresholdLabel,
  };
}

/** Maps ItemType enum to its Turkish display label. */
export function getItemTypeLabel(type: Item['type']): string {
  return ITEM_TYPE_OPTIONS.find((opt) => opt.value === type)?.label ?? type;
}
