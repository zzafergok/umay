import type { ShoppingListItem } from '@/features/inventory/types';
import type { ShoppingPaginatedSummary } from '@/lib/inventory/repo/shopping-query-repo';
import type { PaginatedResponse } from '@/lib/pagination';

// Temporary response aliases allow already-open clients to finish using the old API contract.
export function serializeShoppingItem(item: ShoppingListItem) {
  return { ...item, estimatedPrice: item.price };
}

export function serializeShoppingItems(items: ShoppingListItem[]) {
  return items.map(serializeShoppingItem);
}

export function serializeShoppingPage(
  page: PaginatedResponse<ShoppingListItem, ShoppingPaginatedSummary>,
) {
  return {
    ...page,
    items: serializeShoppingItems(page.items),
    summary: page.summary && {
      ...page.summary,
      estimatedPendingTotal: page.summary.pendingTotal,
    },
  };
}
