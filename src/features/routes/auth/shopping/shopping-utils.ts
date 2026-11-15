import type {
  Category,
  Item,
  Part,
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
  estimatedPendingTotal: number;
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
  const linkedPendingCount = pending.filter((item) => Boolean(item.itemId)).length;

  let estimatedPendingTotal = 0;
  let pricedPendingCount = 0;
  for (const item of pending) {
    if (typeof item.estimatedPrice === 'number' && item.estimatedPrice > 0) {
      estimatedPendingTotal += item.estimatedPrice * item.qty;
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
    estimatedPendingTotal,
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
      const category = resolveShoppingCategory(entry, itemMap, categoryMap) ?? '';
      const haystack = [title, category, entry.store ?? '', entry.note ?? '']
        .join(' ')
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
  const normalized = String(value).replace(',', '.').trim();
  if (!normalized) return undefined;
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < 0) return undefined;
  return Number(parsed.toFixed(2));
}

export function buildShoppingSuggestions(
  list: ShoppingListItem[],
  items: Item[],
  parts: Part[],
  itemMap: Map<string, Item>,
  categoryMap: Map<string, Category>,
): ShoppingSuggestion[] {
  const existingItemIds = new Set(
    list.filter((s) => !s.done && s.itemId).map((s) => s.itemId),
  );
  const lowStock: ShoppingSuggestion[] = items
    .filter(
      (i) =>
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

  const dueParts: ShoppingSuggestion[] = parts
    .filter(
      (p) =>
        p.status !== 'ok' &&
        p.spareItemId &&
        !existingItemIds.has(p.spareItemId),
    )
    .map((p) => {
      const spare = p.spareItemId ? itemMap.get(p.spareItemId) : undefined;
      return {
        key: `part_${p.id}`,
        itemId: p.spareItemId,
        label: spare ? spare.name : `${p.name} Yedeği`,
        suggestedQty: 1,
        unit: formatShoppingUnit(spare?.unit),
        category: spare ? categoryMap.get(spare.categoryId)?.name : undefined,
        reason: p.status === 'overdue' ? 'Değişim gecikti' : 'Değişim yakın',
        source: 'auto_part_due',
      };
    });

  return [...lowStock, ...dueParts];
}
