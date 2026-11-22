import { describe, expect, it } from 'vitest';
import {
  createLocation,
  listLocations,
  updateLocation,
} from '@/lib/inventory/repo/location-category-repo';

describe('updateLocation', () => {
  it('updates location name, note, and cascades path updates to descendants', async () => {
    const uid = `test-loc-cascade-${Date.now()}`;
    const root = await createLocation(uid, {
      name: 'Mutfak',
      parentId: null,
    });
    const child = await createLocation(uid, {
      name: 'Üst Dolap',
      parentId: root.id,
    });
    const grandchild = await createLocation(uid, {
      name: 'Raf 1',
      parentId: child.id,
    });

    const updatedRoot = await updateLocation(uid, root.id, {
      name: 'Ana Mutfak',
      note: 'Yeni not',
    });

    expect(updatedRoot.path).toEqual(['Ana Mutfak']);
    expect(updatedRoot.note).toBe('Yeni not');

    const all = await listLocations(uid);
    const nextChild = all.find((l) => l.id === child.id);
    const nextGrandchild = all.find((l) => l.id === grandchild.id);

    expect(nextChild?.path).toEqual(['Ana Mutfak', 'Üst Dolap']);
    expect(nextGrandchild?.path).toEqual(['Ana Mutfak', 'Üst Dolap', 'Raf 1']);
  });

  it('rejects moving a location under one of its own descendants', async () => {
    const uid = `test-loc-cycle-${Date.now()}`;
    const root = await createLocation(uid, {
      name: 'Salon',
      parentId: null,
    });
    const child = await createLocation(uid, {
      name: 'TV Ünitesi',
      parentId: root.id,
    });

    await expect(
      updateLocation(uid, root.id, { parentId: child.id }),
    ).rejects.toThrow('Konum kendi alt konumunun altına taşınamaz.');
  });
});
