'use client';

import * as React from 'react';
import { toast } from '@/components/core/toast';
import type { ShoppingListItem } from '@/features/inventory/types';
import { inventoryService } from '@/services/inventory-service';

/** Manages direct single deletion and bulk completed-item cleanup for shopping list rows. */
export function useShoppingDelete(
  list: ShoppingListItem[],
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
    clearDoneOpen,
    setClearDoneOpen,
    isClearingDone,
    requestDelete,
    confirmClearDone,
  };
}
