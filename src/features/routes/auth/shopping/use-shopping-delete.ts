'use client';

import * as React from 'react';
import { toast } from '@/components/core/toast';
import type { ShoppingListItem } from '@/features/inventory/types';
import { inventoryService } from '@/services/inventory-service';

/** Manages modal-confirmed single and bulk deletions for shopping list rows. */
export function useShoppingDelete(
  list: ShoppingListItem[],
  invalidateShopping: () => Promise<unknown>,
) {
  const [deleteTarget, setDeleteTarget] =
    React.useState<ShoppingListItem | null>(null);
  const [clearDoneOpen, setClearDoneOpen] = React.useState(false);
  const [isClearingDone, setIsClearingDone] = React.useState(false);

  const requestDelete = (id: string) => {
    const target = list.find((entry) => entry.id === id) ?? null;
    setDeleteTarget(target);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await inventoryService.deleteShopping(deleteTarget.id);
      await invalidateShopping();
      toast.success('Kalem listeden silindi.');
      setDeleteTarget(null);
    } catch (err) {
      toast.error('Silinemedi.');
      throw err;
    }
  };

  const confirmClearDone = async () => {
    const doneItems = list.filter((item) => item.done);
    if (doneItems.length === 0) return;
    setIsClearingDone(true);
    try {
      await Promise.all(
        doneItems.map((item) => inventoryService.deleteShopping(item.id)),
      );
      await invalidateShopping();
      toast.success(`${doneItems.length} tamamlanan kalem temizlendi.`);
      setClearDoneOpen(false);
    } catch (err) {
      toast.error('Tamamlanan kalemler temizlenemedi.');
      throw err;
    } finally {
      setIsClearingDone(false);
    }
  };

  return {
    deleteTarget,
    setDeleteTarget,
    clearDoneOpen,
    setClearDoneOpen,
    isClearingDone,
    requestDelete,
    confirmDelete,
    confirmClearDone,
  };
}
