import type { Item, StockMovement } from '@/features/inventory/types';
import type {
  ItemInput,
  StockMovementInput,
} from '@/features/inventory/schemas';
import { getAdminFirestore, isFirebaseConfigured } from '@/lib/firebase/admin';
import { getUserVault } from '@/lib/inventory/memory-store';
import { InventoryRepoError, newId } from './errors';

function userCol(uid: string, name: string) {
  return getAdminFirestore().collection('users').doc(uid).collection(name);
}

export async function listItems(
  uid: string,
  includeArchived = false,
): Promise<Item[]> {
  if (!isFirebaseConfigured()) {
    return Array.from(getUserVault(uid).items.values())
      .filter((item) => includeArchived || !item.archivedAt)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }
  const snap = await userCol(uid, 'items').get();
  return snap.docs
    .map((d) => ({ ...(d.data() as Item), id: d.id }))
    .filter((item) => includeArchived || !item.archivedAt)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getItemById(
  uid: string,
  id: string,
): Promise<Item | null> {
  if (!isFirebaseConfigured()) {
    return getUserVault(uid).items.get(id) ?? null;
  }
  const doc = await userCol(uid, 'items').doc(id).get();
  if (!doc.exists) return null;
  return { ...(doc.data() as Item), id: doc.id };
}

export async function createItem(uid: string, input: ItemInput): Promise<Item> {
  const now = new Date().toISOString();
  const id = newId('itm');
  const item: Item = {
    id,
    ...input,
    createdAt: now,
    updatedAt: now,
  };

  if (!isFirebaseConfigured()) {
    const vault = getUserVault(uid);
    vault.items.set(id, item);
    if (input.quantity > 0) {
      const mov: StockMovement = {
        id: newId('mov'),
        itemId: id,
        type: 'in',
        delta: input.quantity,
        quantityAfter: input.quantity,
        reason: 'İlk stok kaydı',
        at: now,
      };
      vault.stockMovements.set(mov.id, mov);
    }
    return item;
  }

  const db = getAdminFirestore();
  await db.runTransaction(async (tx) => {
    tx.set(userCol(uid, 'items').doc(id), item);
    if (input.quantity > 0) {
      const movId = newId('mov');
      const mov: StockMovement = {
        id: movId,
        itemId: id,
        type: 'in',
        delta: input.quantity,
        quantityAfter: input.quantity,
        reason: 'İlk stok kaydı',
        at: now,
      };
      tx.set(userCol(uid, 'stockMovements').doc(movId), mov);
    }
  });
  return item;
}

export async function updateItem(
  uid: string,
  id: string,
  input: Partial<ItemInput> & { archivedAt?: string },
): Promise<Item> {
  const current = await getItemById(uid, id);
  if (!current) throw new InventoryRepoError(404, 'Ürün bulunamadı.');

  const updated: Item = {
    ...current,
    ...input,
    id,
    updatedAt: new Date().toISOString(),
  };

  if (!isFirebaseConfigured()) {
    getUserVault(uid).items.set(id, updated);
    return updated;
  }
  await userCol(uid, 'items').doc(id).set(updated);
  return updated;
}

export async function deleteItem(uid: string, id: string): Promise<void> {
  if (!isFirebaseConfigured()) {
    const deleted = getUserVault(uid).items.delete(id);
    if (!deleted) throw new InventoryRepoError(404, 'Ürün bulunamadı.');
    return;
  }
  const ref = userCol(uid, 'items').doc(id);
  const doc = await ref.get();
  if (!doc.exists) throw new InventoryRepoError(404, 'Ürün bulunamadı.');
  await ref.delete();
}

export async function listStockMovements(
  uid: string,
  itemId?: string,
): Promise<StockMovement[]> {
  if (!isFirebaseConfigured()) {
    return Array.from(getUserVault(uid).stockMovements.values())
      .filter((m) => !itemId || m.itemId === itemId)
      .sort((a, b) => b.at.localeCompare(a.at));
  }
  const col = userCol(uid, 'stockMovements');
  const snap = itemId
    ? await col.where('itemId', '==', itemId).get()
    : await col.get();
  return snap.docs
    .map((d) => ({ ...(d.data() as StockMovement), id: d.id }))
    .sort((a, b) => b.at.localeCompare(a.at));
}

/**
 * Atomically records a StockMovement and updates Item.quantity inside a transaction.
 * Prevents negative stock.
 */
export async function recordStockMovement(
  uid: string,
  input: StockMovementInput,
): Promise<{ item: Item; movement: StockMovement }> {
  const now = new Date().toISOString();

  if (!isFirebaseConfigured()) {
    const vault = getUserVault(uid);
    const item = vault.items.get(input.itemId);
    if (!item) throw new InventoryRepoError(404, 'Ürün bulunamadı.');

    const nextQty = item.quantity + input.delta;
    if (nextQty < 0) {
      throw new InventoryRepoError(
        400,
        'Stok miktarı 0 altına düşemez.',
      );
    }

    const updatedItem: Item = {
      ...item,
      quantity: nextQty,
      updatedAt: now,
    };
    const movement: StockMovement = {
      id: newId('mov'),
      itemId: input.itemId,
      type: input.type,
      delta: input.delta,
      quantityAfter: nextQty,
      reason: input.reason,
      relatedPartId: input.relatedPartId,
      at: now,
    };
    vault.items.set(item.id, updatedItem);
    vault.stockMovements.set(movement.id, movement);
    return { item: updatedItem, movement };
  }

  const db = getAdminFirestore();
  return db.runTransaction(async (tx) => {
    const itemRef = userCol(uid, 'items').doc(input.itemId);
    const itemDoc = await tx.get(itemRef);
    if (!itemDoc.exists) {
      throw new InventoryRepoError(404, 'Ürün bulunamadı.');
    }
    const item = { ...(itemDoc.data() as Item), id: itemDoc.id };
    const nextQty = item.quantity + input.delta;
    if (nextQty < 0) {
      throw new InventoryRepoError(
        400,
        'Stok miktarı 0 altına düşemez.',
      );
    }
    const updatedItem: Item = {
      ...item,
      quantity: nextQty,
      updatedAt: now,
    };
    const movId = newId('mov');
    const movement: StockMovement = {
      id: movId,
      itemId: input.itemId,
      type: input.type,
      delta: input.delta,
      quantityAfter: nextQty,
      reason: input.reason,
      relatedPartId: input.relatedPartId,
      at: now,
    };
    tx.set(itemRef, updatedItem);
    tx.set(userCol(uid, 'stockMovements').doc(movId), movement);
    return { item: updatedItem, movement };
  });
}
