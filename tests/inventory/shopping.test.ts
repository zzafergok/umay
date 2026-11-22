import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('@/lib/firebase/admin', () => ({
  isFirebaseConfigured: () => false,
  getAdminAuth: vi.fn(),
  getAdminFirestore: vi.fn(),
  getAdminStorage: vi.fn(),
}));

import { POST as createShoppingRoute } from '@/app/api/inventory/shopping/route';
import type { Category, Item } from '@/features/inventory/types';
import {
  computeShoppingSummary,
  filterAndSortShoppingList,
  formatShoppingUnit,
  parseOptionalPrice,
} from '@/features/routes/auth/shopping/shopping-utils';
import { signToken } from '@/lib/auth/jwt';
import { clearMemoryStore } from '@/lib/inventory/memory-store';
import {
  createShoppingItem,
  createShoppingItemsBulk,
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
      price: 249.5,
      store: 'Migros',
      note: '60lı paket',
      source: 'manual',
      done: false,
    });

    expect(created.priority).toBe('high');
    expect(created.store).toBe('Migros');
    expect(created.price).toBe(249.5);
    expect(created.boughtAt).toBeUndefined();

    const markedDone = await updateShoppingItem(uid, created.id, {
      done: true,
      price: null,
    });
    expect(markedDone.done).toBe(true);
    expect(markedDone.boughtAt).toBeTruthy();
    expect(markedDone.price).toBeUndefined();

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
      price: 90,
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
      price: 300,
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
      price: 150,
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
    expect(summary.pendingTotal).toBe(690);
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
    expect(parseOptionalPrice('1.044,75')).toBe(1044.75);
    expect(parseOptionalPrice('1.234.567,89')).toBe(1234567.89);
    expect(parseOptionalPrice('1044.75')).toBe(1044.75);
    expect(parseOptionalPrice('1.044')).toBe(1044);
    expect(parseOptionalPrice('1,044.75')).toBe(1044.75);
    expect(parseOptionalPrice('')).toBeUndefined();
    expect(formatShoppingUnit('lt')).toBe('Litre');
    expect(formatShoppingUnit('kg')).toBe('Kilogram');
    expect(formatShoppingUnit('gr')).toBe('Gram');
    expect(formatShoppingUnit('ml')).toBe('Mililitre');
    expect(formatShoppingUnit('adet')).toBe('Adet');
    expect(formatShoppingUnit('demet')).toBe('Demet');
  });

  it('supports single and bulk creation in repo and POST /api/inventory/shopping', async () => {
    const bulkRepo = await createShoppingItemsBulk(uid, [
      {
        itemId: null,
        freeText: 'Süt',
        qty: 2,
        unit: 'Litre',
        priority: 'normal',
        source: 'receipt_ai',
        done: false,
      },
      {
        itemId: null,
        freeText: 'Yoğurt',
        qty: 1,
        unit: 'Adet',
        priority: 'normal',
        source: 'receipt_ai',
        done: false,
      },
    ]);
    expect(bulkRepo).toHaveLength(2);
    expect(await listShoppingItems(uid)).toHaveLength(2);

    const token = signToken({
      sub: 'uid_route_shopping_test',
      email: 'test@umay.app',
      name: 'Tester',
      role: 'user',
    });

    const singleReq = new NextRequest(
      'http://localhost:3000/api/inventory/shopping',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          itemId: null,
          freeText: 'Ekmek',
          qty: 2,
          unit: 'Adet',
          source: 'manual',
        }),
      },
    );
    const singleRes = await createShoppingRoute(singleReq);
    expect(singleRes.status).toBe(201);
    const singleJson = (await singleRes.json()) as {
      id: string;
      freeText?: string;
    };
    expect(singleJson.freeText).toBe('Ekmek');

    const bulkReq = new NextRequest(
      'http://localhost:3000/api/inventory/shopping',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: [
            {
              itemId: null,
              freeText: 'Peynir',
              qty: 1,
              unit: 'Adet',
              source: 'receipt_ai',
            },
            {
              itemId: null,
              freeText: 'Zeytin',
              qty: 1,
              unit: 'Adet',
              source: 'receipt_ai',
            },
          ],
        }),
      },
    );
    const bulkRes = await createShoppingRoute(bulkReq);
    expect(bulkRes.status).toBe(201);
    const bulkJson = (await bulkRes.json()) as {
      count: number;
      items: unknown[];
    };
    expect(bulkJson.count).toBe(2);
    expect(bulkJson.items).toHaveLength(2);
    expect(await listShoppingItems('uid_route_shopping_test')).toHaveLength(3);

    const emptyBulkReq = new NextRequest(
      'http://localhost:3000/api/inventory/shopping',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ items: [] }),
      },
    );
    const emptyBulkRes = await createShoppingRoute(emptyBulkReq);
    expect(emptyBulkRes.status).toBe(400);
  });
});
