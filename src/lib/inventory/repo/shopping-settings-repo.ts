import type { ShoppingListItem } from '@/features/inventory/types';
import type {
  ShoppingItemInput,
  ShoppingItemPatchInput,
} from '@/features/inventory/schemas';
import { getAdminFirestore, isFirebaseConfigured } from '@/lib/firebase/admin';
import { getUserVault } from '@/lib/inventory/memory-store';
import { InventoryRepoError, newId } from './errors';
import { syncShoppingEntriesToInventory } from './shopping-sync-repo';

function omitUndefined<T extends object>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined),
  ) as T;
}

function userCol(uid: string, name: string) {
  return getAdminFirestore().collection('users').doc(uid).collection(name);
}

function normalizeShoppingItem(
  item: ShoppingListItem & { estimatedPrice?: unknown },
): ShoppingListItem {
  const { estimatedPrice, ...current } = item;
  const price =
    current.price ??
    (typeof estimatedPrice === 'number' ? estimatedPrice : undefined);
  return omitUndefined({ ...current, price });
}

export async function listShoppingItems(
  uid: string,
  listId?: string,
): Promise<ShoppingListItem[]> {
  if (!isFirebaseConfigured()) {
    const all = Array.from(getUserVault(uid).shoppingList.values())
      .map(normalizeShoppingItem)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return listId ? all.filter((item) => item.listId === listId) : all;
  }
  const snap = await userCol(uid, 'shoppingList').get();
  const all = snap.docs
    .map((d) =>
      normalizeShoppingItem({ ...(d.data() as ShoppingListItem), id: d.id }),
    )
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
    locationId: input.locationId ?? undefined,
    expiresAt: input.expiresAt ?? undefined,
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

function resolveNullable<T>(
  patchVal: T | null | undefined,
  currentVal: T | undefined,
): T | undefined {
  if (patchVal === null) return undefined;
  return patchVal !== undefined ? patchVal : currentVal;
}

async function saveShoppingEntries(
  uid: string,
  entries: ShoppingListItem[],
): Promise<void> {
  if (!isFirebaseConfigured()) {
    const store = getUserVault(uid).shoppingList;
    for (const entry of entries) store.set(entry.id, entry);
    return;
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
}

export async function updateShoppingItem(
  uid: string,
  id: string,
  input: ShoppingItemPatchInput,
): Promise<ShoppingListItem> {
  const all = await listShoppingItems(uid);
  const current = all.find((s) => s.id === id);
  if (!current) {
    throw new InventoryRepoError(404, 'Alışveriş öğesi bulunamadı.');
  }

  const now = new Date().toISOString();
  const { price, locationId, minQuantity, expiresAt, ...rest } = input;
  const nextBoughtAt =
    input.done === true
      ? (current.boughtAt ?? now)
      : input.done === false
        ? undefined
        : current.boughtAt;

  let updated = omitUndefined<ShoppingListItem>({
    ...current,
    ...rest,
    price: resolveNullable(price, current.price),
    locationId: resolveNullable(locationId, current.locationId),
    minQuantity: resolveNullable(minQuantity, current.minQuantity),
    expiresAt: resolveNullable(expiresAt, current.expiresAt),
    boughtAt: nextBoughtAt,
    updatedAt: now,
  });

  if (!current.done && updated.done) {
    const [synced] = await syncShoppingEntriesToInventory(uid, [updated]);
    if (synced) updated = synced;
  }

  await saveShoppingEntries(uid, [updated]);
  return updated;
}

export async function updateShoppingItemsBulk(
  uid: string,
  ids: string[],
  done: boolean,
): Promise<ShoppingListItem[]> {
  const uniqueIds = Array.from(new Set(ids));
  if (uniqueIds.length === 0) return [];

  const idSet = new Set(uniqueIds);
  const all = await listShoppingItems(uid);
  const targets = all.filter((item) => idSet.has(item.id));
  if (targets.length === 0) {
    throw new InventoryRepoError(
      404,
      'Güncellenecek alışveriş öğesi bulunamadı.',
    );
  }

  const now = new Date().toISOString();
  const newlyDoneIds = new Set(
    done ? targets.filter((item) => !item.done).map((item) => item.id) : [],
  );
  let updatedEntries = targets.map((current) =>
    omitUndefined<ShoppingListItem>({
      ...current,
      done,
      boughtAt: done ? (current.boughtAt ?? now) : undefined,
      updatedAt: now,
    }),
  );

  if (newlyDoneIds.size > 0) {
    const toSync = updatedEntries.filter((entry) => newlyDoneIds.has(entry.id));
    const syncedList = await syncShoppingEntriesToInventory(uid, toSync);
    const syncedMap = new Map(syncedList.map((entry) => [entry.id, entry]));
    updatedEntries = updatedEntries.map(
      (entry) => syncedMap.get(entry.id) ?? entry,
    );
  }

  await saveShoppingEntries(uid, updatedEntries);
  return updatedEntries;
}

/** Daha önce alındı işaretlenmiş ancak Ürünler'e aktarılmamış kalemleri tek seferlik eşitler. */
export async function syncPendingDoneShoppingItems(
  uid: string,
  listId?: string,
): Promise<ShoppingListItem[]> {
  const all = await listShoppingItems(uid, listId);
  const unsynced = all.filter((item) => item.done && !item.itemId);
  if (unsynced.length === 0) return [];

  const synced = await syncShoppingEntriesToInventory(uid, unsynced);
  await saveShoppingEntries(uid, synced);
  return synced;
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
