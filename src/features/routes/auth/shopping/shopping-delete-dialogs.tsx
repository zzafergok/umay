'use client';

import {
  DeleteConfirmationDialog,
  type DeleteConfirmationDetailItem,
} from '@/components/shared/delete-confirmation-dialog';
import type {
  Category,
  CurrencyCode,
  Item,
  ShoppingListItem,
} from '@/features/inventory/types';
import { formatCurrency } from '@/lib/utils';
import {
  formatShoppingUnit,
  resolveShoppingCategory,
  resolveShoppingTitle,
  type ShoppingSummary,
} from './shopping-utils';

interface ShoppingDeleteDialogsProps {
  deleteTarget: ShoppingListItem | null;
  onCloseDelete: () => void;
  onConfirmDelete: () => Promise<void>;
  clearDoneOpen: boolean;
  onClearDoneOpenChange: (open: boolean) => void;
  onConfirmClearDone: () => Promise<void>;
  summary: ShoppingSummary;
  itemMap: Map<string, Item>;
  categoryMap: Map<string, Category>;
  currency: CurrencyCode;
}

/** Confirmation modals for single and bulk shopping list item deletions. */
export function ShoppingDeleteDialogs({
  deleteTarget,
  onCloseDelete,
  onConfirmDelete,
  clearDoneOpen,
  onClearDoneOpenChange,
  onConfirmClearDone,
  summary,
  itemMap,
  categoryMap,
  currency,
}: ShoppingDeleteDialogsProps) {
  const details: DeleteConfirmationDetailItem[] | undefined = deleteTarget
    ? [
        {
          label: 'Miktar',
          value: `${deleteTarget.qty} ${formatShoppingUnit(deleteTarget.unit)}`,
        },
        {
          label: 'Kategori',
          value:
            resolveShoppingCategory(deleteTarget, itemMap, categoryMap) ??
            'Genel',
        },
        ...(typeof deleteTarget.estimatedPrice === 'number' &&
        deleteTarget.estimatedPrice > 0
          ? [
              {
                label: 'Tahmini Tutar',
                value: formatCurrency(
                  deleteTarget.estimatedPrice * deleteTarget.qty,
                  { currency, locale: 'tr' },
                ),
              },
            ]
          : []),
      ]
    : undefined;

  return (
    <>
      <DeleteConfirmationDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) onCloseDelete();
        }}
        entityLabel="Alışveriş Kalemi"
        itemName={deleteTarget ? resolveShoppingTitle(deleteTarget, itemMap) : ''}
        details={details}
        onConfirm={onConfirmDelete}
      />

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
    </>
  );
}
