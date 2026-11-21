import type {
  ShoppingListItem,
  UserSettings,
} from '@/features/inventory/types';
import type {
  ShoppingItemInput,
  ShoppingItemPatchInput,
  UserSettingsInput,
} from '@/features/inventory/schemas';
import { getAdminFirestore, isFirebaseConfigured } from '@/lib/firebase/admin';
import { getUserVault } from '@/lib/inventory/memory-store';
import { InventoryRepoError, newId } from './errors';

function omitUndefined<T extends object>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined),
  ) as T;
}

function userCol(uid: string, name: string) {
  return getAdminFirestore().collection('users').doc(uid).collection(name);
}

export async function listShoppingItems(
  uid: string,
  listId?: string,
): Promise<ShoppingListItem[]> {
  if (!isFirebaseConfigured()) {
    const all = Array.from(getUserVault(uid).shoppingList.values()).sort(
      (a, b) => b.createdAt.localeCompare(a.createdAt),
    );
    return listId ? all.filter((item) => item.listId === listId) : all;
  }
  const snap = await userCol(uid, 'shoppingList').get();
  const all = snap.docs
    .map((d) => ({ ...(d.data() as ShoppingListItem), id: d.id }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return listId ? all.filter((item) => item.listId === listId) : all;
}

const FIRESTORE_BATCH_LIMIT = 500;

function buildShoppingEntry(
  input: ShoppingItemInput,
  now: string,
): ShoppingListItem {
  return omitUndefined<ShoppingListItem>({
    id: newId('shp'),
    ...input,
    priority: input.priority ?? 'normal',
    boughtAt: input.done ? now : undefined,
    createdAt: now,
    updatedAt: now,
  });
}

export async function createShoppingItem(
  uid: string,
  input: ShoppingItemInput,
): Promise<ShoppingListItem> {
  const entry = buildShoppingEntry(input, new Date().toISOString());
  if (!isFirebaseConfigured()) {
    getUserVault(uid).shoppingList.set(entry.id, entry);
    return entry;
  }
  await userCol(uid, 'shoppingList').doc(entry.id).set(entry);
  return entry;
}

export async function createShoppingItemsBulk(
  uid: string,
  inputs: ShoppingItemInput[],
): Promise<ShoppingListItem[]> {
  if (inputs.length === 0) return [];
  const now = new Date().toISOString();
  const entries = inputs.map((input) => buildShoppingEntry(input, now));

  if (!isFirebaseConfigured()) {
    const store = getUserVault(uid).shoppingList;
    for (const entry of entries) {
      store.set(entry.id, entry);
    }
    return entries;
  }

  const db = getAdminFirestore();
  const col = userCol(uid, 'shoppingList');
  for (let i = 0; i < entries.length; i += FIRESTORE_BATCH_LIMIT) {
    const batch = db.batch();
    for (const entry of entries.slice(i, i + FIRESTORE_BATCH_LIMIT)) {
      batch.set(col.doc(entry.id), entry);
    }
    await batch.commit();
  }
  return entries;
}

export async function updateShoppingItem(
  uid: string,
  id: string,
  input: ShoppingItemPatchInput,
): Promise<ShoppingListItem> {
  const all = await listShoppingItems(uid);
  const current = all.find((s) => s.id === id);
  if (!current)
    throw new InventoryRepoError(404, 'Alışveriş öğesi bulunamadı.');

  const now = new Date().toISOString();
  const { estimatedPrice, ...rest } = input;
  const nextEstimatedPrice =
    estimatedPrice === null
      ? undefined
      : estimatedPrice !== undefined
        ? estimatedPrice
        : current.estimatedPrice;
  const nextBoughtAt =
    input.done === true
      ? (current.boughtAt ?? now)
      : input.done === false
        ? undefined
        : current.boughtAt;

  const updated = omitUndefined<ShoppingListItem>({
    ...current,
    ...rest,
    estimatedPrice: nextEstimatedPrice,
    boughtAt: nextBoughtAt,
    updatedAt: now,
  });
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
    if (!deleted)
      throw new InventoryRepoError(404, 'Alışveriş öğesi bulunamadı.');
    return;
  }
  const ref = userCol(uid, 'shoppingList').doc(id);
  const doc = await ref.get();
  if (!doc.exists)
    throw new InventoryRepoError(404, 'Alışveriş öğesi bulunamadı.');
  await ref.delete();
}

const DEFAULT_USER_SETTINGS: Omit<UserSettings, 'updatedAt'> = {
  currency: 'TRY',
  dateFormat: 'dd.MM.yyyy',
  defaultUnit: 'adet',
  compactMode: false,
};

export async function getUserSettings(uid: string): Promise<UserSettings> {
  if (!isFirebaseConfigured()) {
    return {
      ...DEFAULT_USER_SETTINGS,
      ...getUserVault(uid).settings,
    };
  }
  const doc = await userCol(uid, 'settings').doc('preferences').get();
  if (!doc.exists) {
    return {
      ...DEFAULT_USER_SETTINGS,
      updatedAt: new Date().toISOString(),
    };
  }
  const docData = doc.data() as Partial<UserSettings>;
  return {
    ...DEFAULT_USER_SETTINGS,
    ...docData,
    updatedAt: docData.updatedAt ?? new Date().toISOString(),
  };
}

export async function updateUserSettings(
  uid: string,
  input: UserSettingsInput,
): Promise<UserSettings> {
  const current = await getUserSettings(uid);
  const updated: UserSettings = omitUndefined<UserSettings>({
    ...DEFAULT_USER_SETTINGS,
    ...current,
    ...omitUndefined(input),
    updatedAt: new Date().toISOString(),
  });
  if (!isFirebaseConfigured()) {
    getUserVault(uid).settings = updated;
    return updated;
  }
  await userCol(uid, 'settings').doc('preferences').set(updated);
  return updated;
}
