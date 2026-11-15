import type { Category, Location } from '@/features/inventory/types';
import type { CategoryInput, LocationInput } from '@/features/inventory/schemas';
import { getAdminFirestore, isFirebaseConfigured } from '@/lib/firebase/admin';
import { getUserVault } from '@/lib/inventory/memory-store';
import { InventoryRepoError, newId } from './errors';

function userCol(uid: string, name: string) {
  return getAdminFirestore().collection('users').doc(uid).collection(name);
}

export async function listLocations(uid: string): Promise<Location[]> {
  if (!isFirebaseConfigured()) {
    return Array.from(getUserVault(uid).locations.values()).filter(
      (loc) => !loc.archivedAt,
    );
  }
  const snap = await userCol(uid, 'locations').get();
  return snap.docs
    .map((d) => d.data() as Location)
    .filter((loc) => !loc.archivedAt);
}

export async function createLocation(
  uid: string,
  input: LocationInput,
): Promise<Location> {
  const existing = await listLocations(uid);
  let path = [input.name];
  if (input.parentId) {
    const parent = existing.find((l) => l.id === input.parentId);
    if (!parent) {
      throw new InventoryRepoError(404, 'Üst konum bulunamadı.');
    }
    path = [...parent.path, input.name];
  }

  const now = new Date().toISOString();
  const location: Location = {
    id: newId('loc'),
    name: input.name,
    parentId: input.parentId,
    path,
    icon: input.icon,
    note: input.note,
    createdAt: now,
    updatedAt: now,
  };

  if (!isFirebaseConfigured()) {
    getUserVault(uid).locations.set(location.id, location);
    return location;
  }

  await userCol(uid, 'locations').doc(location.id).set(location);
  return location;
}

export async function updateLocation(
  uid: string,
  id: string,
  input: Partial<LocationInput>,
): Promise<Location> {
  const all = await listLocations(uid);
  const current = all.find((l) => l.id === id);
  if (!current) {
    throw new InventoryRepoError(404, 'Konum bulunamadı.');
  }

  const nextName = input.name ?? current.name;
  const nextParentId =
    input.parentId !== undefined ? input.parentId : current.parentId;
  if (nextParentId === id) {
    throw new InventoryRepoError(400, 'Konum kendisinin üst konumu olamaz.');
  }

  let path = [nextName];
  if (nextParentId) {
    const parent = all.find((l) => l.id === nextParentId);
    if (!parent) {
      throw new InventoryRepoError(404, 'Üst konum bulunamadı.');
    }
    path = [...parent.path, nextName];
  }

  const updated: Location = {
    ...current,
    name: nextName,
    parentId: nextParentId,
    path,
    icon: input.icon !== undefined ? input.icon : current.icon,
    note: input.note !== undefined ? input.note : current.note,
    updatedAt: new Date().toISOString(),
  };

  if (!isFirebaseConfigured()) {
    getUserVault(uid).locations.set(id, updated);
    return updated;
  }

  await userCol(uid, 'locations').doc(id).set(updated);
  return updated;
}

export async function deleteLocation(uid: string, id: string): Promise<void> {
  const all = await listLocations(uid);
  const hasChild = all.some((l) => l.parentId === id);
  if (hasChild) {
    throw new InventoryRepoError(
      409,
      'Alt konumları olan bir konum silinemez.',
    );
  }
  if (!isFirebaseConfigured()) {
    const deleted = getUserVault(uid).locations.delete(id);
    if (!deleted) throw new InventoryRepoError(404, 'Konum bulunamadı.');
    return;
  }
  const ref = userCol(uid, 'locations').doc(id);
  const doc = await ref.get();
  if (!doc.exists) throw new InventoryRepoError(404, 'Konum bulunamadı.');
  await ref.delete();
}

export async function listCategories(uid: string): Promise<Category[]> {
  if (!isFirebaseConfigured()) {
    return Array.from(getUserVault(uid).categories.values()).filter(
      (cat) => !cat.archivedAt,
    );
  }
  const snap = await userCol(uid, 'categories').get();
  return snap.docs
    .map((d) => d.data() as Category)
    .filter((cat) => !cat.archivedAt);
}

export async function createCategory(
  uid: string,
  input: CategoryInput,
): Promise<Category> {
  const now = new Date().toISOString();
  const category: Category = {
    id: newId('cat'),
    name: input.name,
    colorToken: input.colorToken,
    icon: input.icon,
    customFields: input.customFields,
    createdAt: now,
    updatedAt: now,
  };

  if (!isFirebaseConfigured()) {
    getUserVault(uid).categories.set(category.id, category);
    return category;
  }

  await userCol(uid, 'categories').doc(category.id).set(category);
  return category;
}

export async function updateCategory(
  uid: string,
  id: string,
  input: Partial<CategoryInput>,
): Promise<Category> {
  const all = await listCategories(uid);
  const current = all.find((c) => c.id === id);
  if (!current) throw new InventoryRepoError(404, 'Kategori bulunamadı.');

  const updated: Category = {
    ...current,
    ...input,
    updatedAt: new Date().toISOString(),
  };

  if (!isFirebaseConfigured()) {
    getUserVault(uid).categories.set(id, updated);
    return updated;
  }

  await userCol(uid, 'categories').doc(id).set(updated);
  return updated;
}

export async function deleteCategory(uid: string, id: string): Promise<void> {
  if (!isFirebaseConfigured()) {
    const deleted = getUserVault(uid).categories.delete(id);
    if (!deleted) throw new InventoryRepoError(404, 'Kategori bulunamadı.');
    return;
  }
  const ref = userCol(uid, 'categories').doc(id);
  const doc = await ref.get();
  if (!doc.exists) throw new InventoryRepoError(404, 'Kategori bulunamadı.');
  await ref.delete();
}
