import { describe, expect, it } from 'vitest';
import { shoppingListQuerySchema } from '@/features/inventory/schemas';
import {
  createShoppingItem,
  listShoppingItemsPaginated,
} from '@/lib/inventory/repo';

describe('listShoppingItemsPaginated', () => {
  it('filters by status, priority, search, sorts by column, and paginates', async () => {
    const uid = `test-shop-paginated-${Date.now()}`;
    const listId = 'shl_test_1';

    await createShoppingItem(uid, {
      listId,
      itemId: null,
      source: 'manual',
      freeText: 'Domates',
      qty: 2,
      priority: 'high',
      price: 40,
      done: false,
    });
    await createShoppingItem(uid, {
      listId,
      itemId: null,
      source: 'manual',
      freeText: 'Elma',
      qty: 3,
      priority: 'normal',
      price: 30,
      done: false,
    });
    await createShoppingItem(uid, {
      listId,
      itemId: null,
      source: 'manual',
      freeText: 'Ekmek',
      qty: 1,
      priority: 'low',
      price: 15,
      done: true,
    });

    const page1 = await listShoppingItemsPaginated(
      uid,
      shoppingListQuerySchema.parse({
        listId,
        status: 'pending',
        sortBy: 'total',
        sortOrder: 'desc',
        page: 1,
        pageSize: 1,
      }),
    );

    expect(page1.total).toBe(2);
    expect(page1.totalPages).toBe(2);
    expect(page1.items).toHaveLength(1);
    expect(page1.items[0]?.freeText).toBe('Elma');
    expect(page1.summary?.totalCount).toBe(3);
    expect(page1.summary?.pendingCount).toBe(2);
    expect(page1.summary?.doneCount).toBe(1);

    const searchResult = await listShoppingItemsPaginated(
      uid,
      shoppingListQuerySchema.parse({
        listId,
        search: 'domat',
      }),
    );

    expect(searchResult.total).toBe(1);
    expect(searchResult.items[0]?.freeText).toBe('Domates');
  });
});
