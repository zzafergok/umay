import type {
  Item,
  Part,
  ReplacementLog,
  StockMovement,
} from '@/features/inventory/types';
import type { PartReplaceInput } from '@/features/inventory/schemas';
import { getAdminFirestore, isFirebaseConfigured } from '@/lib/firebase/admin';
import { getUserVault } from '@/lib/inventory/memory-store';
import { computeNextReplacementAt, computePartHealth } from '@/lib/lifecycle';
import { InventoryRepoError, newId } from './errors';

function userCol(uid: string, name: string) {
  return getAdminFirestore().collection('users').doc(uid).collection(name);
}

export async function replacePart(
  uid: string,
  partId: string,
  input: PartReplaceInput,
): Promise<{
  part: Part;
  log: ReplacementLog;
  spareDeducted: boolean;
  suggestShopping: boolean;
}> {
  const now = new Date().toISOString();
  const replacedAt = input.replacedAt ?? now;

  if (!isFirebaseConfigured()) {
    const vault = getUserVault(uid);
    const current = vault.parts.get(partId);
    if (!current) throw new InventoryRepoError(404, 'Parça bulunamadı.');

    let spareDeducted = false;
    let suggestShopping = false;

    if (input.deductSpare && current.spareItemId) {
      const spare = vault.items.get(current.spareItemId);
      if (spare && spare.quantity > 0) {
        const nextQty = spare.quantity - 1;
        vault.items.set(spare.id, { ...spare, quantity: nextQty, updatedAt: now });
        const mov: StockMovement = {
          id: newId('mov'),
          itemId: spare.id,
          type: 'replace_part',
          delta: -1,
          quantityAfter: nextQty,
          reason: `${current.name} değişimi`,
          relatedPartId: partId,
          at: now,
        };
        vault.stockMovements.set(mov.id, mov);
        spareDeducted = true;
        if (nextQty <= spare.minQuantity) suggestShopping = true;
      } else {
        suggestShopping = true;
      }
    }

    const log: ReplacementLog = {
      id: newId('rpl'),
      partId,
      replacedAt,
      oldInstalledAt: current.installedAt,
      usageAtReplacement: current.usageCurrent,
      spareItemId: current.spareItemId,
      cost: input.cost,
      note: input.note,
      createdAt: now,
    };
    const nextReplacementAt = computeNextReplacementAt(
      replacedAt,
      current.lifespan,
    );
    const updatedPart: Part = {
      ...current,
      installedAt: replacedAt,
      lastReplacedAt: replacedAt,
      usageCurrent: 0,
      nextReplacementAt,
      status: 'ok',
      updatedAt: now,
    };
    updatedPart.status = computePartHealth(updatedPart).status;

    vault.parts.set(partId, updatedPart);
    vault.replacementLogs.set(log.id, log);
    return { part: updatedPart, log, spareDeducted, suggestShopping };
  }

  const db = getAdminFirestore();
  return db.runTransaction(async (tx) => {
    const partRef = userCol(uid, 'parts').doc(partId);
    const partDoc = await tx.get(partRef);
    if (!partDoc.exists) throw new InventoryRepoError(404, 'Parça bulunamadı.');
    const current = { ...(partDoc.data() as Part), id: partDoc.id };

    let spareDeducted = false;
    let suggestShopping = false;

    if (input.deductSpare && current.spareItemId) {
      const spareRef = userCol(uid, 'items').doc(current.spareItemId);
      const spareDoc = await tx.get(spareRef);
      if (spareDoc.exists) {
        const spare = { ...(spareDoc.data() as Item), id: spareDoc.id };
        if (spare.quantity > 0) {
          const nextQty = spare.quantity - 1;
          tx.set(spareRef, { ...spare, quantity: nextQty, updatedAt: now });
          const movId = newId('mov');
          const mov: StockMovement = {
            id: movId,
            itemId: spare.id,
            type: 'replace_part',
            delta: -1,
            quantityAfter: nextQty,
            reason: `${current.name} değişimi`,
            relatedPartId: partId,
            at: now,
          };
          tx.set(userCol(uid, 'stockMovements').doc(movId), mov);
          spareDeducted = true;
          if (nextQty <= spare.minQuantity) suggestShopping = true;
        } else {
          suggestShopping = true;
        }
      }
    }

    const logId = newId('rpl');
    const log: ReplacementLog = {
      id: logId,
      partId,
      replacedAt,
      oldInstalledAt: current.installedAt,
      usageAtReplacement: current.usageCurrent,
      spareItemId: current.spareItemId,
      cost: input.cost,
      note: input.note,
      createdAt: now,
    };
    const nextReplacementAt = computeNextReplacementAt(
      replacedAt,
      current.lifespan,
    );
    const updatedPart: Part = {
      ...current,
      installedAt: replacedAt,
      lastReplacedAt: replacedAt,
      usageCurrent: 0,
      nextReplacementAt,
      status: 'ok',
      updatedAt: now,
    };
    updatedPart.status = computePartHealth(updatedPart).status;

    tx.set(partRef, updatedPart);
    tx.set(userCol(uid, 'replacementLogs').doc(logId), log);
    return { part: updatedPart, log, spareDeducted, suggestShopping };
  });
}
