import type {
  InventoryNotification,
  ShoppingListItem,
  UserSettings,
} from '@/features/inventory/types';
import type {
  ShoppingItemInput,
  UserSettingsInput,
} from '@/features/inventory/schemas';
import { getAdminFirestore, isFirebaseConfigured } from '@/lib/firebase/admin';
import { getUserVault } from '@/lib/inventory/memory-store';
import { InAppNotificationChannel } from '@/lib/inventory/notification-channel';
import { computePartHealth } from '@/lib/lifecycle';
import { InventoryRepoError, newId } from './errors';
import { listItems } from './item-stock-repo';
import { listParts, updatePart } from './part-lifecycle-repo';

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

export async function listNotifications(
  uid: string,
): Promise<InventoryNotification[]> {
  if (!isFirebaseConfigured()) {
    return Array.from(getUserVault(uid).notifications.values()).sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
  }
  const snap = await userCol(uid, 'notifications').get();
  return snap.docs
    .map((d) => ({ ...(d.data() as InventoryNotification), id: d.id }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

async function persistNotification(
  uid: string,
  input: Omit<InventoryNotification, 'id' | 'createdAt'>,
): Promise<InventoryNotification> {
  const notif: InventoryNotification = {
    id: newId('ntf'),
    ...input,
    createdAt: new Date().toISOString(),
  };
  if (!isFirebaseConfigured()) {
    getUserVault(uid).notifications.set(notif.id, notif);
    return notif;
  }
  await userCol(uid, 'notifications').doc(notif.id).set(notif);
  return notif;
}

export async function markNotificationRead(
  uid: string,
  id: string,
): Promise<InventoryNotification> {
  const all = await listNotifications(uid);
  const current = all.find((n) => n.id === id);
  if (!current) throw new InventoryRepoError(404, 'Bildirim bulunamadı.');
  const updated: InventoryNotification = {
    ...current,
    readAt: new Date().toISOString(),
  };
  if (!isFirebaseConfigured()) {
    getUserVault(uid).notifications.set(id, updated);
    return updated;
  }
  await userCol(uid, 'notifications').doc(id).set(updated);
  return updated;
}

/**
 * Idempotent job: refreshes part statuses and emits in-app notifications
 * for due_soon / overdue parts and low-stock items without duplicating unread alerts.
 */
export async function refreshPartsForUser(
  uid: string,
): Promise<{ updatedParts: number; createdNotifications: number }> {
  const [parts, items, existingNotifs] = await Promise.all([
    listParts(uid),
    listItems(uid),
    listNotifications(uid),
  ]);
  const channel = new InAppNotificationChannel(persistNotification);
  let updatedParts = 0;
  let createdNotifications = 0;

  for (const part of parts) {
    const health = computePartHealth(part);
    if (health.status !== part.status) {
      await updatePart(uid, part.id, {
        usageCurrent: part.usageCurrent,
      });
      updatedParts += 1;
    }

    if (health.status === 'due_soon' || health.status === 'overdue') {
      const notifType =
        health.status === 'overdue' ? 'part_overdue' : 'part_due';
      const alreadyExists = existingNotifs.some(
        (n) => n.refId === part.id && n.type === notifType && !n.readAt,
      );
      if (!alreadyExists) {
        await channel.send(uid, {
          type: notifType,
          refId: part.id,
          title:
            health.status === 'overdue'
              ? `${part.name} değişimi gecikti`
              : `${part.name} değişimi yaklaşıyor`,
          message:
            health.daysRemaining !== null
              ? `Kalan süre: ${health.daysRemaining} gün`
              : `Kalan kullanım: ${health.remainingPercent}%`,
          dueAt: part.nextReplacementAt ?? new Date().toISOString(),
        });
        createdNotifications += 1;
      }
    }
  }

  for (const item of items) {
    if (item.minQuantity > 0 && item.quantity <= item.minQuantity) {
      const alreadyExists = existingNotifs.some(
        (n) => n.refId === item.id && n.type === 'low_stock' && !n.readAt,
      );
      if (!alreadyExists) {
        await channel.send(uid, {
          type: 'low_stock',
          refId: item.id,
          title: `${item.name} stoğu azaldı`,
          message: `Mevcut: ${item.quantity} ${item.unit} (Eşik: ${item.minQuantity})`,
          dueAt: new Date().toISOString(),
        });
        createdNotifications += 1;
      }
    }
  }

  return { updatedParts, createdNotifications };
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
      defaultReminderLeadDays: 7,
      notifyInApp: true,
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
