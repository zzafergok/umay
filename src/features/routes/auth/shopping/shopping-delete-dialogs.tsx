'use client';

import { DeleteConfirmationDialog } from '@/components/shared/delete-confirmation-dialog';
import type { ShoppingSummary } from './shopping-utils';

interface ShoppingDeleteDialogsProps {
  clearDoneOpen: boolean;
  onClearDoneOpenChange: (open: boolean) => void;
  onConfirmClearDone: () => Promise<void>;
  summary: ShoppingSummary;
}

/** Confirmation modal for bulk completed shopping list item cleanup. */
export function ShoppingDeleteDialogs({
  clearDoneOpen,
  onClearDoneOpenChange,
  onConfirmClearDone,
  summary,
}: ShoppingDeleteDialogsProps) {
  return (
    <DeleteConfirmationDialog
      open={clearDoneOpen}
      onOpenChange={onClearDoneOpenChange}
      entityLabel="Alınan Kalemler"
      itemName={`${summary.doneCount} tamamlanan kalem`}
      title="Alınanları Temizleme Onayı"
      description="Alındı olarak işaretlenen tüm kalemler alışveriş listesinden kalıcı olarak silinecektir. Bu işlem geri alınamaz."
      details={[
        { label: 'Tamamlanan Kalem', value: `${summary.doneCount} adet` },
        { label: 'Bekleyen Kalem', value: `${summary.pendingCount} adet` },
      ]}
      onConfirm={onConfirmClearDone}
    />
  );
}
