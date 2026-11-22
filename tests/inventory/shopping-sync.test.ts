import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('@/lib/firebase/admin', () => ({
  isFirebaseConfigured: () => false,
  getAdminAuth: vi.fn(),
  getAdminFirestore: vi.fn(),
  getAdminStorage: vi.fn(),
}));

import {
  PATCH as bulkUpdateShoppingRoute,
  POST as createShoppingRoute,
} from '@/app/api/inventory/shopping/route';
import { POST as syncDoneShoppingRoute } from '@/app/api/inventory/shopping/sync/route';
import { signToken } from '@/lib/auth/jwt';
import { clearMemoryStore } from '@/lib/inventory/memory-store';
import {
  createShoppingItem,
  listItems,
  listStockMovements,
  updateShoppingItem,
} from '@/lib/inventory/repo';

describe('shopping done -> inventory items auto-sync', () => {
  beforeEach(() => {
    clearMemoryStore();
  });

  it('auto-creates Item with matching product details when single item is marked done and avoids duplicates on toggle', async () => {
    const uid = 'uid_sync_single';
    const created = await createShoppingItem(uid, {
      itemId: null,
      freeText: 'Torku Sucuk Kangal',
      qty: 0.375,
      unit: 'Kilogram',
      category: 'Gıda',
      type: 'consumable',
      minQuantity: 0.5,
      brand: 'Torku',
      barcode: '2910005',
      price: 1044.75,
      currency: 'TRY',
      store: 'Yunus Market',
      source: 'receipt_ai',
      done: false,
    });

    const markedDone = await updateShoppingItem(uid, created.id, { done: true });
    expect(markedDone.done).toBe(true);
    expect(markedDone.itemId).toBeTruthy();

    const items = await listItems(uid);
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      id: markedDone.itemId,
      name: 'Torku Sucuk Kangal',
      quantity: 0.375,
      unit: 'Kilogram',
      brand: 'Torku',
      barcode: '2910005',
      purchasePrice: 1044.75,
      store: 'Yunus Market',
      minQuantity: 0.5,
    });

    // Unchecking and re-checking adds stock to the linked item instead of creating a duplicate
    await updateShoppingItem(uid, created.id, { done: false });
    await updateShoppingItem(uid, created.id, { done: true });
    const itemsAfter = await listItems(uid);
    expect(itemsAfter).toHaveLength(1);
    expect(itemsAfter[0]!.quantity).toBe(0.75);
    expect(await listStockMovements(uid, itemsAfter[0]!.id)).toHaveLength(2);
  });

  it('bulk-creates inventory items on PATCH /api/inventory/shopping in a single request', async () => {
    const uid = 'uid_sync_bulk';
    const token = signToken({
      sub: uid,
      email: 'bulk@umay.app',
      name: 'Bulk Tester',
      role: 'user',
    });

    const postRes = await createShoppingRoute(
      new NextRequest('http://localhost:3000/api/inventory/shopping', {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
        body: JSON.stringify({
          items: [
            { itemId: null, freeText: 'Peynir', qty: 1, unit: 'Adet', category: 'Gıda', source: 'receipt_ai' },
            { itemId: null, freeText: 'Zeytin', qty: 2, unit: 'Kilogram', category: 'Gıda', source: 'receipt_ai' },
          ],
        }),
      }),
    );
    const { items: createdList } = (await postRes.json()) as {
      items: Array<{ id: string }>;
    };

    const patchRes = await bulkUpdateShoppingRoute(
      new NextRequest('http://localhost:3000/api/inventory/shopping', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
        body: JSON.stringify({ ids: createdList.map((i) => i.id), done: true }),
      }),
    );
    expect(patchRes.status).toBe(200);
    const patchJson = (await patchRes.json()) as {
      count: number;
      items: Array<{ id: string; done: boolean; itemId: string | null }>;
    };
    expect(patchJson.count).toBe(2);
    expect(patchJson.items.every((entry) => entry.done && Boolean(entry.itemId))).toBe(true);

    const inventory = await listItems(uid);
    expect(inventory.map((i) => i.name).sort()).toEqual(['Peynir', 'Zeytin']);
  });

  it('syncs previously done unlinked items once via POST /api/inventory/shopping/sync', async () => {
    const uid = 'uid_sync_existing_done';
    const token = signToken({
      sub: uid,
      email: 'sync@umay.app',
      name: 'Sync Tester',
      role: 'user',
    });

    await createShoppingItem(uid, {
      listId: 'shl_1',
      itemId: null,
      freeText: 'Eski Alınan Süt',
      qty: 2,
      unit: 'Litre',
      source: 'receipt_ai',
      done: true,
    });

    const res1 = await syncDoneShoppingRoute(
      new NextRequest('http://localhost:3000/api/inventory/shopping/sync', {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
        body: JSON.stringify({ listId: 'shl_1' }),
      }),
    );
    expect(res1.status).toBe(200);
    const json1 = (await res1.json()) as { count: number };
    expect(json1.count).toBe(1);
    expect((await listItems(uid)).map((i) => i.name)).toEqual(['Eski Alınan Süt']);

    // Second call is idempotent (0 remaining unsynced)
    const res2 = await syncDoneShoppingRoute(
      new NextRequest('http://localhost:3000/api/inventory/shopping/sync', {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
        body: JSON.stringify({ listId: 'shl_1' }),
      }),
    );
    const json2 = (await res2.json()) as { count: number };
    expect(json2.count).toBe(0);
  });
});
