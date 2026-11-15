import type { Part, ReplacementLog } from '@/features/inventory/types';
import type { PartInput } from '@/features/inventory/schemas';
import { getAdminFirestore, isFirebaseConfigured } from '@/lib/firebase/admin';
import { getUserVault } from '@/lib/inventory/memory-store';
import { computeNextReplacementAt, computePartHealth } from '@/lib/lifecycle';
import { InventoryRepoError, newId } from './errors';

function userCol(uid: string, name: string) {
  return getAdminFirestore().collection('users').doc(uid).collection(name);
}

export async function listParts(uid: string): Promise<Part[]> {
  if (!isFirebaseConfigured()) {
    return Array.from(getUserVault(uid).parts.values())
      .filter((p) => !p.archivedAt)
      .map((p) => ({ ...p, status: computePartHealth(p).status }));
  }
  const snap = await userCol(uid, 'parts').get();
  return snap.docs
    .map((d) => ({ ...(d.data() as Part), id: d.id }))
    .filter((p) => !p.archivedAt)
    .map((p) => ({ ...p, status: computePartHealth(p).status }));
}

export async function getPartById(
  uid: string,
  id: string,
): Promise<Part | null> {
  if (!isFirebaseConfigured()) {
    const part = getUserVault(uid).parts.get(id);
    return part ? { ...part, status: computePartHealth(part).status } : null;
  }
  const doc = await userCol(uid, 'parts').doc(id).get();
  if (!doc.exists) return null;
  const part = { ...(doc.data() as Part), id: doc.id };
  return { ...part, status: computePartHealth(part).status };
}

export async function createPart(uid: string, input: PartInput): Promise<Part> {
  const now = new Date().toISOString();
  const nextReplacementAt = computeNextReplacementAt(
    input.installedAt,
    input.lifespan,
  );
  const draft: Part = {
    id: newId('prt'),
    ...input,
    nextReplacementAt,
    status: 'ok',
    createdAt: now,
    updatedAt: now,
  };
  draft.status = computePartHealth(draft).status;

  if (!isFirebaseConfigured()) {
    getUserVault(uid).parts.set(draft.id, draft);
    return draft;
  }
  await userCol(uid, 'parts').doc(draft.id).set(draft);
  return draft;
}

export async function updatePart(
  uid: string,
  id: string,
  input: Partial<PartInput>,
): Promise<Part> {
  const current = await getPartById(uid, id);
  if (!current) throw new InventoryRepoError(404, 'Parça bulunamadı.');

  const mergedLifespan = input.lifespan ?? current.lifespan;
  const mergedInstalledAt = input.installedAt ?? current.installedAt;
  const nextReplacementAt = computeNextReplacementAt(
    mergedInstalledAt,
    mergedLifespan,
  );

  const updated: Part = {
    ...current,
    ...input,
    lifespan: mergedLifespan,
    installedAt: mergedInstalledAt,
    nextReplacementAt,
    updatedAt: new Date().toISOString(),
  };
  updated.status = computePartHealth(updated).status;

  if (!isFirebaseConfigured()) {
    getUserVault(uid).parts.set(id, updated);
    return updated;
  }
  await userCol(uid, 'parts').doc(id).set(updated);
  return updated;
}

export async function deletePart(uid: string, id: string): Promise<void> {
  if (!isFirebaseConfigured()) {
    const deleted = getUserVault(uid).parts.delete(id);
    if (!deleted) throw new InventoryRepoError(404, 'Parça bulunamadı.');
    return;
  }
  const ref = userCol(uid, 'parts').doc(id);
  const doc = await ref.get();
  if (!doc.exists) throw new InventoryRepoError(404, 'Parça bulunamadı.');
  await ref.delete();
}

export async function listReplacementLogs(
  uid: string,
  partId?: string,
): Promise<ReplacementLog[]> {
  if (!isFirebaseConfigured()) {
    return Array.from(getUserVault(uid).replacementLogs.values())
      .filter((l) => !partId || l.partId === partId)
      .sort((a, b) => b.replacedAt.localeCompare(a.replacedAt));
  }
  const col = userCol(uid, 'replacementLogs');
  const snap = partId
    ? await col.where('partId', '==', partId).get()
    : await col.get();
  return snap.docs
    .map((d) => ({ ...(d.data() as ReplacementLog), id: d.id }))
    .sort((a, b) => b.replacedAt.localeCompare(a.replacedAt));
}
