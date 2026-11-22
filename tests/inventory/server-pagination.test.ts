import { describe, expect, it } from 'vitest';
import {
  buildCleanQueryParams,
  matchesTurkishSearch,
  paginateArray,
  parsePaginationSearchParams,
  sortItems,
  toggleSortState,
} from '@/lib/pagination';
import { movementListQuerySchema } from '@/features/inventory/schemas';
import {
  createItem,
  listStockMovementsPaginated,
  recordStockMovement,
} from '@/lib/inventory/repo';

describe('server pagination utilities', () => {
  it('parses searchParams with defaults and coerces page/pageSize', () => {
    const params = new URLSearchParams('page=2&pageSize=20&direction=inflow');
    const parsed = parsePaginationSearchParams(params, movementListQuerySchema);
    expect(parsed).toEqual({
      page: 2,
      pageSize: 20,
      direction: 'inflow',
      type: 'all',
      dateRange: 'all',
      sortBy: 'at',
      sortOrder: 'desc',
    });
  });

  it('toggles sort state and sorts items using typed comparators', () => {
    const first = toggleSortState(
      { sortBy: 'at', sortOrder: 'desc' },
      'delta',
      'desc',
    );
    expect(first).toEqual({ sortBy: 'delta', sortOrder: 'desc' });
    const flipped = toggleSortState(first, 'delta', 'desc');
    expect(flipped).toEqual({ sortBy: 'delta', sortOrder: 'asc' });

    const rows = [{ delta: 5 }, { delta: -2 }, { delta: 10 }];
    expect(
      sortItems(rows, 'delta', 'asc', { delta: (a, b) => a.delta - b.delta }),
    ).toEqual([{ delta: -2 }, { delta: 5 }, { delta: 10 }]);
  });

  it('paginates arrays safely and clamps out-of-range page numbers', () => {
    const items = Array.from({ length: 45 }, (_, idx) => idx + 1);
    const page2 = paginateArray(items, 2, 20);
    expect(page2.items).toEqual(Array.from({ length: 20 }, (_, i) => i + 21));
    expect(page2.total).toBe(45);
    expect(page2.totalPages).toBe(3);

    const clamped = paginateArray(items, 99, 20);
    expect(clamped.page).toBe(3);
    expect(clamped.items).toEqual([41, 42, 43, 44, 45]);
  });

  it('matches Turkish characters case-insensitively and strips empty params', () => {
    expect(matchesTurkishSearch('şeker', 'Toz Şeker 1kg', 'Kiler')).toBe(true);
    expect(matchesTurkishSearch('kahve', 'Toz Şeker 1kg', 'Kiler')).toBe(false);
    expect(
      buildCleanQueryParams({
        page: 1,
        search: '',
        type: 'all',
        itemId: undefined,
      }),
    ).toEqual({ page: 1, type: 'all' });
  });

  it('paginates and filters stock movements on the repository layer', async () => {
    const uid = `pag-user-${Date.now()}`;
    const item = await createItem(uid, {
      name: 'Filtre Kahve',
      categoryId: 'cat-1',
      locationId: 'loc-1',
      type: 'consumable',
      quantity: 10,
      unit: 'adet',
      minQuantity: 2,
      currency: 'TRY',
      photos: [],
      documents: [],
      tags: [],
      customFieldValues: {},
      notes: '',
      status: 'active',
    });

    await recordStockMovement(uid, {
      itemId: item.id,
      type: 'in',
      delta: 5,
      reason: 'Alışverişten stok girişi',
    });
    await recordStockMovement(uid, {
      itemId: item.id,
      type: 'consume',
      delta: -2,
      reason: 'Hızlı tüketim',
    });

    const inflowPage = await listStockMovementsPaginated(
      uid,
      movementListQuerySchema.parse({
        page: 1,
        pageSize: 20,
        direction: 'inflow',
      }),
    );
    expect(inflowPage.total).toBe(2);
    expect(inflowPage.items[0]?.movement.type).toBe('in');
    expect(inflowPage.summary?.totalCount).toBe(3);
    expect(inflowPage.summary?.inflowUnits).toBe(15);
    expect(inflowPage.summary?.outflowUnits).toBe(2);
  });
});
