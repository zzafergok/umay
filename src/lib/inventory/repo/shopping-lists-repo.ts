import type { ShoppingList } from '@/features/inventory/types';
import type {
  ShoppingListInput,
  ShoppingListPatchInput,
} from '@/features/inventory/schemas';
import { getAdminFirestore, isFirebaseConfigured } from '@/lib/firebase/admin';
import { getUserVault } from '@/lib/inventory/memory-store';
import { InventoryRepoError, newId } from './errors';
import { listShoppingItems } from './shopping-settings-repo';

function omitUndefined<T extends object>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined),
  ) as T;
}

function userCol(uid: string, name: string) {
  return getAdminFirestore().collection('users').doc(uid).collection(name);
}

export async function listShoppingLists(uid: string): Promise<ShoppingList[]> {
  if (!isFirebaseConfigured()) {
    return Array.from(getUserVault(uid).shoppingLists.values()).sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
  }
  const snap = await userCol(uid, 'shoppingLists').get();
  return snap.docs
    .map((d) => ({ ...(d.data() as ShoppingList), id: d.id }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getShoppingList(
  uid: string,
  id: string,
): Promise<ShoppingList | null> {
  if (!isFirebaseConfigured()) {
    return getUserVault(uid).shoppingLists.get(id) ?? null;
  }
  const doc = await userCol(uid, 'shoppingLists').doc(id).get();
  if (!doc.exists) return null;
  return { ...(doc.data() as ShoppingList), id: doc.id };
}

export async function createShoppingList(
  uid: string,
  input: ShoppingListInput,
): Promise<ShoppingList> {
  const now = new Date().toISOString();
  const entry = omitUndefined<ShoppingList>({
    id: newId('shl'),
    name: input.name,
    description: input.description || undefined,
    store: input.store || undefined,
    createdAt: now,
    updatedAt: now,
  });
  if (!isFirebaseConfigured()) {
    getUserVault(uid).shoppingLists.set(entry.id, entry);
    return entry;
  }
  await userCol(uid, 'shoppingLists').doc(entry.id).set(entry);
  return entry;
}

export async function updateShoppingList(
  uid: string,
  id: string,
  input: ShoppingListPatchInput,
): Promise<ShoppingList> {
  const current = await getShoppingList(uid, id);
  if (!current) {
    throw new InventoryRepoError(404, 'Alışveriş listesi bulunamadı.');
  }
  const updated = omitUndefined<ShoppingList>({
    ...current,
    ...input,
    description:
      input.description !== undefined
        ? input.description || undefined
        : current.description,
    store: input.store !== undefined ? input.store || undefined : current.store,
    updatedAt: new Date().toISOString(),
  });
  if (!isFirebaseConfigured()) {
    getUserVault(uid).shoppingLists.set(id, updated);
    return updated;
  }
  await userCol(uid, 'shoppingLists').doc(id).set(updated);
  return updated;
}

export async function deleteShoppingList(
  uid: string,
  id: string,
): Promise<void> {
  if (!isFirebaseConfigured()) {
    const vault = getUserVault(uid);
    const deleted = vault.shoppingLists.delete(id);
    if (!deleted) {
      throw new InventoryRepoError(404, 'Alışveriş listesi bulunamadı.');
    }
    for (const [itemId, item] of vault.shoppingList.entries()) {
      if (item.listId === id) {
        vault.shoppingList.delete(itemId);
      }
    }
    return;
  }

  const ref = userCol(uid, 'shoppingLists').doc(id);
  const doc = await ref.get();
  if (!doc.exists) {
    throw new InventoryRepoError(404, 'Alışveriş listesi bulunamadı.');
  }
  const items = await listShoppingItems(uid, id);
  const db = getAdminFirestore();
  const batch = db.batch();
  batch.delete(ref);
  for (const item of items) {
    batch.delete(userCol(uid, 'shoppingList').doc(item.id));
  }
  await batch.commit();
}
