import type {
  ShoppingListQuery,
  ShoppingSortField,
} from '@/features/inventory/schemas';
import type {
  Category,
  Item,
  ShoppingListItem,
  ShoppingPriority,
} from '@/features/inventory/types';
import {
  matchesTurkishSearch,
  paginateArray,
  sortItems,
  type PaginatedResponse,
} from '@/lib/pagination';
import { listItems } from './item-stock-repo';
import { listCategories } from './location-category-repo';
import { listShoppingItems } from './shopping-settings-repo';

export interface ShoppingPaginatedSummary {
  totalCount: number;
  pendingCount: number;
  doneCount: number;
  highPriorityPendingCount: number;
  linkedPendingCount: number;
  pendingTotal: number;
  pricedPendingCount: number;
  completionRate: number;
  unsyncedDoneCount: number;
}

interface EnrichedShoppingEntry {
  entry: ShoppingListItem;
  title: string;
  categoryLabel: string;
}

const PRIORITY_WEIGHT: Record<ShoppingPriority, number> = {
  high: 0,
  normal: 1,
  low: 2,
};

function priorityWeight(priority?: ShoppingPriority): number {
  return PRIORITY_WEIGHT[priority ?? 'normal'] ?? 1;
}

function totalOf(entry: ShoppingListItem): number {
  if (typeof entry.price === 'number' && entry.price > 0) {
    return entry.price * entry.qty;
  }
  return 0;
}

const SHOPPING_COMPARATORS: Record<
  ShoppingSortField,
  (a: EnrichedShoppingEntry, b: EnrichedShoppingEntry) => number
> = {
  done: (a, b) => {
    const doneDiff = Number(a.entry.done) - Number(b.entry.done);
    if (doneDiff !== 0) return doneDiff;
    const priorityDiff =
      priorityWeight(a.entry.priority) - priorityWeight(b.entry.priority);
    if (priorityDiff !== 0) return priorityDiff;
    return a.title.localeCompare(b.title, 'tr');
  },
  title: (a, b) => a.title.localeCompare(b.title, 'tr'),
  priority: (a, b) =>
    priorityWeight(a.entry.priority) - priorityWeight(b.entry.priority),
  qty: (a, b) => a.entry.qty - b.entry.qty,
  total: (a, b) => totalOf(a.entry) - totalOf(b.entry),
  estimatedTotal: (a, b) => totalOf(a.entry) - totalOf(b.entry),
  createdAt: (a, b) =>
    Date.parse(a.entry.createdAt) - Date.parse(b.entry.createdAt),
};

function computeSummary(list: ShoppingListItem[]): ShoppingPaginatedSummary {
  const totalCount = list.length;
  const pending = list.filter((item) => !item.done);
  const doneCount = totalCount - pending.length;
  const highPriorityPendingCount = pending.filter(
    (item) => item.priority === 'high',
  ).length;
  const linkedPendingCount = pending.filter((item) =>
    Boolean(item.itemId),
  ).length;
  const unsyncedDoneCount = list.filter((e) => e.done && !e.itemId).length;

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
    unsyncedDoneCount,
  };
}

function resolveTitle(
  entry: ShoppingListItem,
  itemMap: Map<string, Item>,
): string {
  const linked = entry.itemId ? itemMap.get(entry.itemId) : undefined;
  return linked?.name ?? entry.freeText ?? 'Ürün';
}

function resolveCategory(
  entry: ShoppingListItem,
  itemMap: Map<string, Item>,
  categoryMap: Map<string, Category>,
): string {
  if (entry.category?.trim()) return entry.category.trim();
  const linked = entry.itemId ? itemMap.get(entry.itemId) : undefined;
  if (!linked) return '';
  return categoryMap.get(linked.categoryId)?.name ?? '';
}

export async function listShoppingItemsPaginated(
  uid: string,
  query: ShoppingListQuery,
): Promise<PaginatedResponse<ShoppingListItem, ShoppingPaginatedSummary>> {
  const isUnassigned = query.listId === 'unassigned';
  const scopedListId = query.listId && !isUnassigned ? query.listId : undefined;

  const [rawList, items, categories] = await Promise.all([
    listShoppingItems(uid, scopedListId),
    listItems(uid, true),
    listCategories(uid),
  ]);

  const list = isUnassigned
    ? rawList.filter((entry) => !entry.listId)
    : rawList;

  const summary = computeSummary(list);
  const itemMap = new Map(items.map((item) => [item.id, item]));
  const categoryMap = new Map(categories.map((cat) => [cat.id, cat]));

  const filtered: EnrichedShoppingEntry[] = [];
  for (const entry of list) {
    if (query.status === 'pending' && entry.done) continue;
    if (query.status === 'done' && !entry.done) continue;
    if (
      query.priority !== 'all' &&
      (entry.priority ?? 'normal') !== query.priority
    ) {
      continue;
    }

    const title = resolveTitle(entry, itemMap);
    const categoryLabel = resolveCategory(entry, itemMap, categoryMap);
    if (
      !matchesTurkishSearch(
        query.search,
        title,
        categoryLabel,
        entry.store,
        entry.note,
      )
    ) {
      continue;
    }

    filtered.push({ entry, title, categoryLabel });
  }

  const sorted = sortItems(
    filtered,
    query.sortBy,
    query.sortOrder,
    SHOPPING_COMPARATORS,
  ).map((item) => item.entry);

  return paginateArray(sorted, query.page, query.pageSize, summary);
}
