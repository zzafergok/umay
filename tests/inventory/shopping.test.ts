import { beforeEach, describe, expect, it } from 'vitest';
import type { Category, Item } from '@/features/inventory/types';
import {
  computeShoppingSummary,
  filterAndSortShoppingList,
  formatShoppingUnit,
  parseOptionalPrice,
} from '@/features/routes/auth/shopping/shopping-utils';
import { clearMemoryStore } from '@/lib/inventory/memory-store';
import {
  createShoppingItem,
  listShoppingItems,
  updateShoppingItem,
} from '@/lib/inventory/repo';

describe('detailed shopping list repository & utils', () => {
  const uid = 'uid_shopping_test';

  beforeEach(() => {
    clearMemoryStore();
  });

  it('persists detailed fields and clears optional price/boughtAt on patch', async () => {
    const created = await createShoppingItem(uid, {
      itemId: null,
      freeText: 'Bulaşık Tableti',
      qty: 2,
      unit: 'kutu',
      category: 'Temizlik',
      priority: 'high',
      estimatedPrice: 249.5,
      store: 'Migros',
      note: '60lı paket',
      source: 'manual',
      done: false,
    });

    expect(created.priority).toBe('high');
    expect(created.store).toBe('Migros');
    expect(created.estimatedPrice).toBe(249.5);
    expect(created.boughtAt).toBeUndefined();

    const markedDone = await updateShoppingItem(uid, created.id, {
      done: true,
      estimatedPrice: null,
    });
    expect(markedDone.done).toBe(true);
    expect(markedDone.boughtAt).toBeTruthy();
    expect(markedDone.estimatedPrice).toBeUndefined();

    const reopened = await updateShoppingItem(uid, created.id, {
      done: false,
    });
    expect(reopened.done).toBe(false);
    expect(reopened.boughtAt).toBeUndefined();
    expect(await listShoppingItems(uid)).toHaveLength(1);
  });

  it('computes summary metrics and sorts/filters by status, priority, and Turkish search', async () => {
    const low = await createShoppingItem(uid, {
      itemId: null,
      freeText: 'Kağıt Havlu',
      qty: 1,
      unit: 'paket',
      priority: 'low',
      estimatedPrice: 90,
      source: 'manual',
      done: false,
    });
    const urgent = await createShoppingItem(uid, {
      itemId: 'itm_1',
      freeText: 'Zeytinyağı',
      qty: 2,
      unit: 'lt',
      category: 'Gıda',
      priority: 'high',
      estimatedPrice: 300,
      store: 'Carrefour',
      source: 'auto_low_stock',
      done: false,
    });
    const done = await createShoppingItem(uid, {
      itemId: null,
      freeText: 'Şampuan',
      qty: 1,
      unit: 'şişe',
      priority: 'normal',
      estimatedPrice: 150,
      source: 'receipt_ai',
      done: true,
    });

    const list = [low, urgent, done];
    const summary = computeShoppingSummary(list);
    expect(summary.totalCount).toBe(3);
    expect(summary.pendingCount).toBe(2);
    expect(summary.doneCount).toBe(1);
    expect(summary.highPriorityPendingCount).toBe(1);
    expect(summary.linkedPendingCount).toBe(1);
    expect(summary.estimatedPendingTotal).toBe(690);
    expect(summary.completionRate).toBe(33);

    const itemMap = new Map<string, Item>();
    const categoryMap = new Map<string, Category>();

    const sortedAll = filterAndSortShoppingList(
      list,
      { status: 'all', priority: 'all', search: '' },
      itemMap,
      categoryMap,
    );
    expect(sortedAll.map((i) => i.id)).toEqual([urgent.id, low.id, done.id]);

    const searched = filterAndSortShoppingList(
      list,
      { status: 'pending', priority: 'all', search: 'carrefour' },
      itemMap,
      categoryMap,
    );
    expect(searched.map((i) => i.id)).toEqual([urgent.id]);
    expect(parseOptionalPrice('129,95')).toBe(129.95);
    expect(parseOptionalPrice('')).toBeUndefined();
    expect(formatShoppingUnit('lt')).toBe('Litre');
    expect(formatShoppingUnit('kg')).toBe('Kilogram');
    expect(formatShoppingUnit('gr')).toBe('Gram');
    expect(formatShoppingUnit('ml')).toBe('Mililitre');
    expect(formatShoppingUnit('adet')).toBe('Adet');
    expect(formatShoppingUnit('demet')).toBe('Demet');
  });
});
