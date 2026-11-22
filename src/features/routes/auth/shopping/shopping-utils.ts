import type {
  Category,
  Item,
  ShoppingListItem,
  ShoppingPriority,
} from '@/features/inventory/types';
import { SHOPPING_PRIORITY_META, SHOPPING_UNIT_ALIASES } from './constants';
import type { ShoppingSuggestion } from './shopping-suggestions';

export type ShoppingStatusFilter = 'all' | 'pending' | 'done';
export type ShoppingPriorityFilter = 'all' | ShoppingPriority;

export interface ShoppingSummary {
  totalCount: number;
  pendingCount: number;
  doneCount: number;
  highPriorityPendingCount: number;
  linkedPendingCount: number;
  pendingTotal: number;
  pricedPendingCount: number;
  completionRate: number;
}

export function formatShoppingUnit(unit?: string | null): string {
  const trimmed = unit?.trim() ?? '';
  if (!trimmed) return 'Adet';
  const normalizedKey = trimmed.toLocaleLowerCase('tr');
  const mapped = SHOPPING_UNIT_ALIASES[normalizedKey];
  if (mapped) return mapped;
  return trimmed.charAt(0).toLocaleUpperCase('tr') + trimmed.slice(1);
}

export function resolveShoppingTitle(
  entry: ShoppingListItem,
  itemMap: Map<string, Item>,
): string {
  const linked = entry.itemId ? itemMap.get(entry.itemId) : undefined;
  return linked?.name ?? entry.freeText ?? 'Ürün';
}

export function resolveShoppingCategory(
  entry: ShoppingListItem,
  itemMap: Map<string, Item>,
  categoryMap: Map<string, Category>,
): string | undefined {
  if (entry.category?.trim()) return entry.category.trim();
  const linked = entry.itemId ? itemMap.get(entry.itemId) : undefined;
  if (!linked) return undefined;
  return categoryMap.get(linked.categoryId)?.name;
}

export function computeShoppingSummary(
  list: ShoppingListItem[],
): ShoppingSummary {
  const totalCount = list.length;
  const pending = list.filter((item) => !item.done);
  const doneCount = totalCount - pending.length;
  const highPriorityPendingCount = pending.filter(
    (item) => item.priority === 'high',
  ).length;
  const linkedPendingCount = pending.filter((item) =>
    Boolean(item.itemId),
  ).length;

  let pendingTotal = 0;
  let pricedPendingCount = 0;
  for (const item of pending) {
    if (typeof item.price === 'number') {
      pendingTotal += item.price * item.qty;
      pricedPendingCount += 1;
    }
  }

  const completionRate =
    totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  return {
    totalCount,
    pendingCount: pending.length,
    doneCount,
    highPriorityPendingCount,
    linkedPendingCount,
    pendingTotal,
    pricedPendingCount,
    completionRate,
  };
}

export function filterAndSortShoppingList(
  list: ShoppingListItem[],
  options: {
    status: ShoppingStatusFilter;
    priority: ShoppingPriorityFilter;
    search: string;
  },
  itemMap: Map<string, Item>,
  categoryMap: Map<string, Category>,
): ShoppingListItem[] {
  const query = options.search.trim().toLocaleLowerCase('tr');

  return [...list]
    .filter((entry) => {
      if (options.status === 'pending' && entry.done) return false;
      if (options.status === 'done' && !entry.done) return false;

      const entryPriority: ShoppingPriority = entry.priority ?? 'normal';
      if (options.priority !== 'all' && entryPriority !== options.priority) {
        return false;
      }

      if (!query) return true;
      const title = resolveShoppingTitle(entry, itemMap);
      const category =
        resolveShoppingCategory(entry, itemMap, categoryMap) ?? '';
      const haystack = [title, category, entry.store ?? '', entry.note ?? '']
        .join('')
        .toLocaleLowerCase('tr');
      return haystack.includes(query);
    })
    .sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      const rankA = SHOPPING_PRIORITY_META[a.priority ?? 'normal'].rank;
      const rankB = SHOPPING_PRIORITY_META[b.priority ?? 'normal'].rank;
      if (rankA !== rankB) return rankA - rankB;
      return b.createdAt.localeCompare(a.createdAt);
    });
}

export function parseOptionalPrice(value: unknown): number | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value === 'number') {
    return Number.isFinite(value) && value >= 0
      ? Number(value.toFixed(2))
      : undefined;
  }
  const trimmed = String(value).replace(/\s+/g, '').trim();
  if (!trimmed) return undefined;

  const hasComma = trimmed.includes(',');
  const hasDot = trimmed.includes('.');
  let normalized = trimmed;

  if (hasComma && hasDot) {
    normalized =
      trimmed.lastIndexOf(',') > trimmed.lastIndexOf('.')
        ? trimmed.replace(/\./g, '').replace(',', '.')
        : trimmed.replace(/,/g, '');
  } else if (hasComma) {
    normalized = trimmed.replace(',', '.');
  } else if (hasDot) {
    const parts = trimmed.split('.');
    const isGroupedThousands =
      parts.length > 2 ||
      (parts.length === 2 && (parts[1]?.length ?? 0) === 3 && parts[0] !== '0');
    normalized = isGroupedThousands ? trimmed.replace(/\./g, '') : trimmed;
  }

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < 0) return undefined;
  return Number(parsed.toFixed(2));
}

export function resolveReceiptUnitPrice(
  totalPrice: number | null | undefined,
  unitPrice: number | null | undefined,
  quantity: number,
): number | undefined {
  if (typeof totalPrice === 'number' && totalPrice >= 0 && quantity > 0) {
    return totalPrice / quantity;
  }
  return typeof unitPrice === 'number' && unitPrice >= 0
    ? unitPrice
    : undefined;
}

export function resolveEditedShoppingPrice(
  value: unknown,
  originalPrice: number | undefined,
  changed: boolean,
): number | undefined {
  return changed ? parseOptionalPrice(value) : originalPrice;
}

export function buildShoppingSuggestions(
  list: ShoppingListItem[],
  items: Item[],
  categoryMap: Map<string, Category>,
): ShoppingSuggestion[] {
  const existingItemIds = new Set(
    list.filter((s) => !s.done && s.itemId).map((s) => s.itemId),
  );
  return items
    .filter(
      (i) =>
        i.type !== 'component' &&
        i.minQuantity > 0 &&
        i.quantity <= i.minQuantity &&
        !existingItemIds.has(i.id),
    )
    .map((i) => ({
      key: `low_${i.id}`,
      itemId: i.id,
      label: i.name,
      suggestedQty: Math.max(
        1,
        (i.targetQuantity ?? i.minQuantity * 2) - i.quantity,
      ),
      unit: formatShoppingUnit(i.unit),
      category: categoryMap.get(i.categoryId)?.name,
      reason: `Mevcut: ${i.quantity}/${i.minQuantity} ${formatShoppingUnit(i.unit)}`,
      source: 'auto_low_stock',
    }));
}
