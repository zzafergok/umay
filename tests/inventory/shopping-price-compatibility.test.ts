import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('@/lib/firebase/admin', () => ({
  isFirebaseConfigured: () => false,
  getAdminAuth: vi.fn(),
  getAdminFirestore: vi.fn(),
  getAdminStorage: vi.fn(),
}));

import { GET, POST } from '@/app/api/inventory/shopping/route';
import { PATCH } from '@/app/api/inventory/shopping/[id]/route';
import { signToken } from '@/lib/auth/jwt';
import { clearMemoryStore, getUserVault } from '@/lib/inventory/memory-store';
import {
  createShoppingItem,
  listShoppingItems,
  listShoppingItemsPaginated,
  updateShoppingItem,
} from '@/lib/inventory/repo';
import { shoppingListQuerySchema } from '@/features/inventory/schemas';

describe('shopping price compatibility', () => {
  const uid = 'shopping-price-compatibility';
  const id = 'legacy-price';
  const token = signToken({
    sub: uid,
    email: 'test@umay.app',
    name: 'Test',
    role: 'user',
  });
  const headers = {
    authorization: `Bearer ${token}`,
    'content-type': 'application/json',
  };
  const url = 'http://localhost:3000/api/inventory/shopping';

  beforeEach(() => {
    clearMemoryStore();
    const legacy = {
      id,
      itemId: null,
      freeText: 'Eski ürün',
      qty: 2,
      estimatedPrice: 12.5,
      source: 'manual' as const,
      done: false,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };
    getUserVault(uid).shoppingList.set(id, legacy);
  });

  it('reads legacy stored prices and removes the old value when price is cleared', async () => {
    expect((await listShoppingItems(uid))[0]?.price).toBe(12.5);
    expect(
      (await updateShoppingItem(uid, id, { price: null })).price,
    ).toBeUndefined();
    expect((await listShoppingItems(uid))[0]?.price).toBeUndefined();
    expect(getUserVault(uid).shoppingList.get(id)).not.toHaveProperty(
      'estimatedPrice',
    );
  });

  it('counts a zero price as a provided price', async () => {
    await createShoppingItem(uid, {
      itemId: null,
      freeText: 'Ücretsiz ürün',
      qty: 1,
      price: 0,
      source: 'manual',
      done: false,
    });
    const page = await listShoppingItemsPaginated(
      uid,
      shoppingListQuerySchema.parse({}),
    );
    expect(page.summary?.pricedPendingCount).toBe(2);
    expect(page.summary?.pendingTotal).toBe(25);
  });

  it('supports old request and response fields alongside the new price', async () => {
    const list = await GET(
      new NextRequest(`${url}?paginated=true&sortBy=estimatedTotal`, {
        headers,
      }),
    );
    expect(list.status).toBe(200);
    const result = await list.json();
    expect(result.items[0]).toMatchObject({
      price: 12.5,
      estimatedPrice: 12.5,
    });
    expect(result.summary).toMatchObject({
      pendingTotal: 25,
      estimatedPendingTotal: 25,
    });

    const created = await POST(
      new NextRequest(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          freeText: 'Yeni ürün',
          qty: 1,
          estimatedPrice: 40,
        }),
      }),
    );
    expect(created.status).toBe(201);
    expect(await created.json()).toMatchObject({
      price: 40,
      estimatedPrice: 40,
    });

    const updated = await PATCH(
      new NextRequest(`${url}/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ estimatedPrice: null }),
      }),
      { params: Promise.resolve({ id }) },
    );
    expect(updated.status).toBe(200);
    const cleared = await updated.json();
    expect(cleared).not.toHaveProperty('price');
    expect(cleared).not.toHaveProperty('estimatedPrice');
    expect(
      (await listShoppingItems(uid)).find((item) => item.id === id)?.price,
    ).toBeUndefined();
  });
});
