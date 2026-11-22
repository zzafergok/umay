'use client';

import * as React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/core/toast';
import type { ShoppingItemPatchInput } from '@/features/inventory/schemas';
import type { ShoppingListItem } from '@/features/inventory/types';
import { inventoryService } from '@/services/inventory-service';

/** Manages single and bulk status/qty/edit mutations for shopping list items. */
export function useShoppingMutations(
  invalidateShopping: () => Promise<unknown>,
) {
  const qc = useQueryClient();
  const [isBulkUpdatingDone, setIsBulkUpdatingDone] = React.useState(false);
  const [isSyncingDoneItems, setIsSyncingDoneItems] = React.useState(false);

  const invalidateInventoryAndShopping = async () => {
    await Promise.all([
      invalidateShopping(),
      qc.invalidateQueries({ queryKey: ['inventory', 'items'] }),
      qc.invalidateQueries({ queryKey: ['inventory', 'movements'] }),
      qc.invalidateQueries({ queryKey: ['inventory', 'categories'] }),
      qc.invalidateQueries({ queryKey: ['inventory', 'locations'] }),
    ]);
  };

  const handleToggleDone = async (entry: ShoppingListItem) => {
    const nextDone = !entry.done;
    try {
      await inventoryService.updateShopping(entry.id, { done: nextDone });
      if (nextDone) {
        await invalidateInventoryAndShopping();
      } else {
        await invalidateShopping();
      }
      toast.success(
        nextDone
          ? 'Alındı olarak işaretlendi ve Ürünler ekranına işlendi.'
          : 'Alınacaklara geri taşındı.',
      );
    } catch {
      toast.error('Durum güncellenemedi.');
    }
  };

  const handleBulkToggleDone = async (
    entries: ShoppingListItem[],
    nextDone: boolean,
  ) => {
    const targets = entries.filter((entry) => entry.done !== nextDone);
    if (targets.length === 0) return;

    setIsBulkUpdatingDone(true);
    try {
      await inventoryService.bulkUpdateShoppingDone(
        targets.map((entry) => entry.id),
        nextDone,
      );
      if (nextDone) {
        await invalidateInventoryAndShopping();
      } else {
        await invalidateShopping();
      }
      toast.success(
        nextDone
          ? `${targets.length} kalem alındı olarak işaretlendi ve Ürünler ekranına eklendi.`
          : `${targets.length} kalem alınacaklara geri taşındı.`,
      );
    } catch {
      toast.error('Toplu durum güncellenemedi.');
    } finally {
      setIsBulkUpdatingDone(false);
    }
  };

  const handleAdjustQty = async (entry: ShoppingListItem, delta: number) => {
    const nextQty = Math.max(1, entry.qty + delta);
    if (nextQty === entry.qty) return;
    try {
      await inventoryService.updateShopping(entry.id, { qty: nextQty });
      await invalidateShopping();
    } catch {
      toast.error('Miktar güncellenemedi.');
    }
  };

  const handleSaveEdit = async (
    id: string,
    patch: ShoppingItemPatchInput,
  ): Promise<boolean> => {
    try {
      await inventoryService.updateShopping(id, patch);
      await invalidateShopping();
      toast.success('Alışveriş kalemi güncellendi.');
      return true;
    } catch {
      toast.error('Değişiklikler kaydedilemedi.');
      return false;
    }
  };

  const handleSyncDoneToInventory = async (listId?: string) => {
    setIsSyncingDoneItems(true);
    try {
      const res = await inventoryService.syncDoneShoppingToItems(listId);
      await invalidateInventoryAndShopping();
      toast.success(
        res.count > 0
          ? `${res.count} alınan kalem Ürünler ekranına aktarıldı.`
          : 'Aktarılacak yeni kalem bulunamadı.',
      );
    } catch {
      toast.error('Alınan kalemler Ürünler ekranına aktarılamadı.');
    } finally {
      setIsSyncingDoneItems(false);
    }
  };

  return {
    isBulkUpdatingDone,
    isSyncingDoneItems,
    handleToggleDone,
    handleBulkToggleDone,
    handleSyncDoneToInventory,
    handleAdjustQty,
    handleSaveEdit,
  };
}
