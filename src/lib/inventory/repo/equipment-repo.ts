import type { EquipmentInput } from '@/features/inventory/schemas';
import type { EquipmentItem } from '@/features/inventory/types';
import { getAdminFirestore, isFirebaseConfigured } from '@/lib/firebase/admin';
import { getUserVault } from '@/lib/inventory/memory-store';
import { InventoryRepoError, newId } from './errors';
import { omitUndefinedDeep } from './utils';

function userCol(uid: string, name: string) {
  return getAdminFirestore().collection('users').doc(uid).collection(name);
}

export async function listEquipment(uid: string): Promise<EquipmentItem[]> {
  if (!isFirebaseConfigured()) {
    return Array.from(getUserVault(uid).equipment.values()).sort((a, b) =>
      a.name.localeCompare(b.name, 'tr'),
    );
  }
  const snap = await userCol(uid, 'equipment').get();
  return snap.docs
    .map((d) => ({ ...(d.data() as EquipmentItem), id: d.id }))
    .sort((a, b) => a.name.localeCompare(b.name, 'tr'));
}

export async function createEquipment(
  uid: string,
  input: EquipmentInput,
): Promise<EquipmentItem> {
  const now = new Date().toISOString();
  const entry = omitUndefinedDeep<EquipmentItem>({
    id: newId('eqp'),
    kind: input.kind,
    name: input.name,
    categoryId: input.categoryId,
    locationId: input.locationId,
    status: input.status,
    quantity: input.kind === 'device' ? 1 : input.quantity,
    unit: input.kind === 'device' ? 'adet' : input.unit,
    brand: input.brand,
    model: input.model,
    serialNumber: input.kind === 'device' ? input.serialNumber : undefined,
    notes: input.notes,
    createdAt: now,
    updatedAt: now,
  });

  if (!isFirebaseConfigured()) {
    getUserVault(uid).equipment.set(entry.id, entry);
    return entry;
  }

  await userCol(uid, 'equipment').doc(entry.id).set(entry);
  return entry;
}

export async function updateEquipment(
  uid: string,
  id: string,
  input: Partial<EquipmentInput>,
): Promise<EquipmentItem> {
  const now = new Date().toISOString();

  if (!isFirebaseConfigured()) {
    const vault = getUserVault(uid);
    const current = vault.equipment.get(id);
    if (!current) throw new InventoryRepoError(404, 'Cihaz / yedek bulunamadı.');
    const nextKind = input.kind ?? current.kind;
    const updated = omitUndefinedDeep<EquipmentItem>({
      ...current,
      ...input,
      kind: nextKind,
      quantity:
        nextKind === 'device' ? 1 : (input.quantity ?? current.quantity),
      unit: nextKind === 'device' ? 'adet' : (input.unit ?? current.unit),
      serialNumber:
        nextKind === 'device'
          ? (input.serialNumber ?? current.serialNumber)
          : undefined,
      updatedAt: now,
    });
    vault.equipment.set(id, updated);
    return updated;
  }

  const ref = userCol(uid, 'equipment').doc(id);
  const doc = await ref.get();
  if (!doc.exists) throw new InventoryRepoError(404, 'Cihaz / yedek bulunamadı.');
  const current = { ...(doc.data() as EquipmentItem), id: doc.id };
  const nextKind = input.kind ?? current.kind;
  const updated = omitUndefinedDeep<EquipmentItem>({
    ...current,
    ...input,
    kind: nextKind,
    quantity: nextKind === 'device' ? 1 : (input.quantity ?? current.quantity),
    unit: nextKind === 'device' ? 'adet' : (input.unit ?? current.unit),
    serialNumber:
      nextKind === 'device'
        ? (input.serialNumber ?? current.serialNumber)
        : undefined,
    updatedAt: now,
  });
  await ref.set(updated);
  return updated;
}

export async function deleteEquipment(uid: string, id: string): Promise<void> {
  if (!isFirebaseConfigured()) {
    const deleted = getUserVault(uid).equipment.delete(id);
    if (!deleted) throw new InventoryRepoError(404, 'Cihaz / yedek bulunamadı.');
    return;
  }

  const ref = userCol(uid, 'equipment').doc(id);
  const doc = await ref.get();
  if (!doc.exists) throw new InventoryRepoError(404, 'Cihaz / yedek bulunamadı.');
  await ref.delete();
}
