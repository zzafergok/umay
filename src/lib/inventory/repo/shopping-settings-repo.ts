import type { ShoppingListItem, UserSettings } from '@/features/inventory/types';
import type {
  ShoppingItemInput,
  UserSettingsInput,
} from '@/features/inventory/schemas';
import { getAdminFirestore, isFirebaseConfigured } from '@/lib/firebase/admin';
import { getUserVault } from '@/lib/inventory/memory-store';
import { InventoryRepoError, newId } from './errors';

function userCol(uid: string, name: string) {
  return getAdminFirestore().collection('users').doc(uid).collection(name);
}

export async function listShoppingItems(
  uid: string,
): Promise<ShoppingListItem[]> {
  if (!isFirebaseConfigured()) {
    return Array.from(getUserVault(uid).shoppingList.values()).sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
  }
  const snap = await userCol(uid, 'shoppingList').get();
  return snap.docs
    .map((d) => ({ ...(d.data() as ShoppingListItem), id: d.id }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createShoppingItem(
  uid: string,
  input: ShoppingItemInput,
): Promise<ShoppingListItem> {
  const now = new Date().toISOString();
  const entry: ShoppingListItem = {
    id: newId('shp'),
    ...input,
    createdAt: now,
    updatedAt: now,
  };
  if (!isFirebaseConfigured()) {
    getUserVault(uid).shoppingList.set(entry.id, entry);
    return entry;
  }
  await userCol(uid, 'shoppingList').doc(entry.id).set(entry);
  return entry;
}

export async function updateShoppingItem(
  uid: string,
  id: string,
  input: Partial<ShoppingItemInput>,
): Promise<ShoppingListItem> {
  const all = await listShoppingItems(uid);
  const current = all.find((s) => s.id === id);
  if (!current) throw new InventoryRepoError(404, 'Alışveriş öğesi bulunamadı.');

  const updated: ShoppingListItem = {
    ...current,
    ...input,
    updatedAt: new Date().toISOString(),
  };
  if (!isFirebaseConfigured()) {
    getUserVault(uid).shoppingList.set(id, updated);
    return updated;
  }
  await userCol(uid, 'shoppingList').doc(id).set(updated);
  return updated;
}

export async function deleteShoppingItem(
  uid: string,
  id: string,
): Promise<void> {
  if (!isFirebaseConfigured()) {
    const deleted = getUserVault(uid).shoppingList.delete(id);
    if (!deleted) throw new InventoryRepoError(404, 'Alışveriş öğesi bulunamadı.');
    return;
  }
  const ref = userCol(uid, 'shoppingList').doc(id);
  const doc = await ref.get();
  if (!doc.exists) throw new InventoryRepoError(404, 'Alışveriş öğesi bulunamadı.');
  await ref.delete();
}

export async function getUserSettings(uid: string): Promise<UserSettings> {
  if (!isFirebaseConfigured()) {
    return getUserVault(uid).settings;
  }
  const doc = await userCol(uid, 'settings').doc('preferences').get();
  if (!doc.exists) {
    return {
      currency: 'TRY',
      dateFormat: 'dd.MM.yyyy',
      updatedAt: new Date().toISOString(),
    };
  }
  return doc.data() as UserSettings;
}

export async function updateUserSettings(
  uid: string,
  input: UserSettingsInput,
): Promise<UserSettings> {
  const updated: UserSettings = {
    ...input,
    updatedAt: new Date().toISOString(),
  };
  if (!isFirebaseConfigured()) {
    getUserVault(uid).settings = updated;
    return updated;
  }
  await userCol(uid, 'settings').doc('preferences').set(updated);
  return updated;
}
