'use client';

import { Dialog, DialogContent } from '@/components/core/dialog';
import type { Category, Item, Location } from '@/features/inventory/types';
import { ItemDetailBody } from './item-detail-body';

interface ItemDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId: string | null;
  categories?: Category[];
  locations?: Location[];
  onEdit?: (item: Item) => void;
}

/** Modal displaying item details, stock adjustments, technical specs, movements, QR, edit, and delete actions. */
export function ItemDetailDialog({
  open,
  onOpenChange,
  itemId,
  categories,
  locations,
  onEdit,
}: ItemDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        {open && itemId ? (
          <ItemDetailBody
            key={itemId}
            itemId={itemId}
            onOpenChange={onOpenChange}
            categories={categories}
            locations={locations}
            onEdit={onEdit}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
