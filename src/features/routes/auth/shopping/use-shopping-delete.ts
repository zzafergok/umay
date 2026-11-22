'use client';

import * as React from 'react';
import { toast } from '@/components/core/toast';
import { inventoryService } from '@/services/inventory-service';

/** Manages direct single deletion and bulk completed-item cleanup for shopping list rows. */
export function useShoppingDelete(
  listId: string | undefined,
  invalidateShopping: () => Promise<unknown>,
) {
  const [clearDoneOpen, setClearDoneOpen] = React.useState(false);
  const [isClearingDone, setIsClearingDone] = React.useState(false);

  const requestDelete = async (id: string) => {
    try {
      await inventoryService.deleteShopping(id);
      await invalidateShopping();
      toast.success('Kalem listeden silindi.');
    } catch {
      toast.error('Silinemedi.');
    }
  };

  const confirmClearDone = async () => {
    setIsClearingDone(true);
    try {
      const isUnassigned = listId === 'unassigned';
      const scopedListId = listId && !isUnassigned ? listId : undefined;
      const allItems = await inventoryService.listShopping(scopedListId);
      const scopedItems = isUnassigned
        ? allItems.filter((item) => !item.listId)
        : allItems;
      const doneItems = scopedItems.filter((item) => item.done);
      if (doneItems.length === 0) {
        setClearDoneOpen(false);
        return;
      }

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
    clearDoneOpen,
    setClearDoneOpen,
    isClearingDone,
    requestDelete,
    confirmClearDone,
  };
}
