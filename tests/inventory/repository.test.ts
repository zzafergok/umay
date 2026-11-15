import { beforeEach, describe, expect, it } from 'vitest';
import { clearMemoryStore } from '@/lib/inventory/memory-store';
import {
  createCategory,
  createItem,
  createLocation,
  createPart,
  deleteAllUserData,
  getItemById,
  getUserSettings,
  listItems,
  listLocations,
  listParts,
  listReplacementLogs,
  listStockMovements,
  recordStockMovement,
  replacePart,
  updateUserSettings,
} from '@/lib/inventory/repo';

describe('inventory repository & user isolation', () => {
  const userA = 'uid_user_a';
  const userB = 'uid_user_b';

  beforeEach(() => {
    clearMemoryStore();
  });

  it('maintains stock ledger consistency and prevents negative stock', async () => {
    const loc = await createLocation(userA, { name: 'Mutfak', parentId: null });
    const cat = await createCategory(userA, {
      name: 'Mutfak',
      colorToken: 'emerald',
      icon: 'boxes',
      customFields: [],
    });
    const item = await createItem(userA, {
      name: 'Zeytinyağı',
      categoryId: cat.id,
      locationId: loc.id,
      type: 'consumable',
      quantity: 3,
      unit: 'lt',
      minQuantity: 1,
      currency: 'TRY',
      photos: [],
      documents: [],
      tags: [],
      customFieldValues: {},
      notes: '',
      status: 'active',
    });

    await Promise.all([
      recordStockMovement(userA, {
        itemId: item.id,
        type: 'consume',
        delta: -1,
      }),
      recordStockMovement(userA, {
        itemId: item.id,
        type: 'in',
        delta: 2,
      }),
    ]);

    const updated = await getItemById(userA, item.id);
    expect(updated?.quantity).toBe(4);

    const movements = await listStockMovements(userA, item.id);
    const totalFromLedger = movements.reduce((sum, m) => sum + m.delta, 0);
    expect(totalFromLedger).toBe(4);

    await expect(
      recordStockMovement(userA, {
        itemId: item.id,
        type: 'out',
        delta: -10,
      }),
    ).rejects.toThrow(/0 altına düşemez/);
  });

  it('replaces part, deducts spare item stock, and writes replacement log', async () => {
    const loc = await createLocation(userA, { name: 'Mutfak', parentId: null });
    const cat = await createCategory(userA, {
      name: 'Yedek Parça',
      colorToken: 'umay-blue',
      icon: 'wrench',
      customFields: [],
    });
    const spare = await createItem(userA, {
      name: 'Karbon Filtre Yedeği',
      categoryId: cat.id,
      locationId: loc.id,
      type: 'component',
      quantity: 2,
      unit: 'adet',
      minQuantity: 1,
      currency: 'TRY',
      photos: [],
      documents: [],
      tags: [],
      customFieldValues: {},
      notes: '',
      status: 'active',
    });

    const part = await createPart(userA, {
      name: 'Su Arıtma Karbon Filtresi',
      parentItemId: null,
      spareItemId: spare.id,
      lifespan: { mode: 'time', days: 180 },
      installedAt: '2026-01-01T00:00:00.000Z',
      usageCurrent: 0,
      notes: '',
    });

    const res = await replacePart(userA, part.id, {
      replacedAt: '2026-07-01T00:00:00.000Z',
      cost: 450,
      note: 'Zamanında değişim',
      deductSpare: true,
    });

    expect(res.spareDeducted).toBe(true);
    expect(res.suggestShopping).toBe(true);
    expect(res.part.installedAt).toBe('2026-07-01T00:00:00.000Z');

    const updatedSpare = await getItemById(userA, spare.id);
    expect(updatedSpare?.quantity).toBe(1);

    const logs = await listReplacementLogs(userA, part.id);
    expect(logs).toHaveLength(1);
    expect(logs[0]?.cost).toBe(450);
  });

  it('isolates data strictly by uid (cross-user access denied)', async () => {
    const locA = await createLocation(userA, { name: 'Kiler', parentId: null });
    const catA = await createCategory(userA, {
      name: 'Gıda',
      colorToken: 'emerald',
      icon: 'boxes',
      customFields: [],
    });
    const itemA = await createItem(userA, {
      name: 'Makarna',
      categoryId: catA.id,
      locationId: locA.id,
      type: 'consumable',
      quantity: 5,
      unit: 'paket',
      minQuantity: 2,
      currency: 'TRY',
      photos: [],
      documents: [],
      tags: [],
      customFieldValues: {},
      notes: '',
      status: 'active',
    });

    expect(await listItems(userB)).toHaveLength(0);
    expect(await getItemById(userB, itemA.id)).toBeNull();
    await expect(
      recordStockMovement(userB, {
        itemId: itemA.id,
        type: 'consume',
        delta: -1,
      }),
    ).rejects.toThrow(/bulunamadı/);
  });

  it('deletes all user data on account deletion without affecting other users', async () => {
    const locA = await createLocation(userA, { name: 'Kiler', parentId: null });
    const catA = await createCategory(userA, {
      name: 'Gıda',
      colorToken: 'emerald',
      icon: 'boxes',
      customFields: [],
    });
    await createItem(userA, {
      name: 'Bakliyat',
      categoryId: catA.id,
      locationId: locA.id,
      type: 'consumable',
      quantity: 2,
      unit: 'kg',
      minQuantity: 1,
      currency: 'TRY',
      photos: [],
      documents: [],
      tags: [],
      customFieldValues: {},
      notes: '',
      status: 'active',
    });
    await createPart(userA, {
      name: 'HEPA Filtre',
      parentItemId: null,
      spareItemId: null,
      lifespan: { mode: 'time', days: 90 },
      installedAt: '2026-01-01T00:00:00.000Z',
      usageCurrent: 0,
      notes: '',
    });

    const locB = await createLocation(userB, { name: 'Salon', parentId: null });
    expect(locB.id).toBeTruthy();

    await deleteAllUserData(userA);

    expect(await listItems(userA)).toHaveLength(0);
    expect(await listLocations(userA)).toHaveLength(0);
    expect(await listParts(userA)).toHaveLength(0);
    expect(await listLocations(userB)).toHaveLength(1);
  });

  it('omits undefined optional fields when creating locations', async () => {
    const created = await createLocation(userA, {
      name: 'Çamaşır Odası Buzdolabı',
      parentId: null,
      note: '',
    });

    expect(created.name).toBe('Çamaşır Odası Buzdolabı');
    expect(Object.prototype.hasOwnProperty.call(created, 'icon')).toBe(false);
    expect(Object.values(created)).not.toContain(undefined);
  });

  it('merges partial user settings updates without clobbering existing fields', async () => {
    await updateUserSettings(userA, {
      currency: 'EUR',
      defaultUnit: 'kg',
      compactMode: true,
    });
    const merged = await updateUserSettings(userA, {
      dateFormat: 'yyyy-MM-dd',
    });
    const fetched = await getUserSettings(userA);
    expect(merged).toMatchObject({
      currency: 'EUR',
      dateFormat: 'yyyy-MM-dd',
      defaultUnit: 'kg',
      compactMode: true,
    });
    expect(fetched.currency).toBe('EUR');
    expect(fetched.defaultUnit).toBe('kg');
  });
});
