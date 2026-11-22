'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/core/dialog';
import type { ShoppingItemInput } from '@/features/inventory/schemas';
import type {
  Category,
  CurrencyCode,
  Item,
  Location,
} from '@/features/inventory/types';
import { ShoppingAddForm } from './shopping-add-form';
import { ShoppingReceiptCard } from './shopping-receipt-card';
import {
  ShoppingSuggestionsCard,
  type ShoppingSuggestion,
} from './shopping-suggestions';

interface ShoppingAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: Item[];
  categories: Category[];
  locations: Location[];
  currency: CurrencyCode;
  onAdd: (input: ShoppingItemInput) => Promise<boolean>;
}

export function ShoppingAddDialog({
  open,
  onOpenChange,
  items,
  categories,
  locations,
  currency,
  onAdd,
}: ShoppingAddDialogProps) {
  const handleAdd = async (input: ShoppingItemInput): Promise<boolean> => {
    const ok = await onAdd(input);
    if (ok) {
      onOpenChange(false);
    }
    return ok;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        mobilePresentation="sheet"
        className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"
      >
        <DialogHeader>
          <DialogTitle>Listeye Ürün Ekle</DialogTitle>
        </DialogHeader>
        <ShoppingAddForm
          items={items}
          categories={categories}
          locations={locations}
          currency={currency}
          onAdd={handleAdd}
          embedded
        />
      </DialogContent>
    </Dialog>
  );
}

interface ShoppingReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listId?: string;
}

export function ShoppingReceiptDialog({
  open,
  onOpenChange,
  listId,
}: ShoppingReceiptDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        mobilePresentation="sheet"
        className="sm:max-w-2xl md:max-w-3xl"
      >
        <DialogHeader>
          <DialogTitle>Fiş Tara (AI)</DialogTitle>
        </DialogHeader>
        <ShoppingReceiptCard
          listId={listId}
          onApplied={() => onOpenChange(false)}
          embedded
        />
      </DialogContent>
    </Dialog>
  );
}

interface ShoppingSuggestionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suggestions: ShoppingSuggestion[];
  onAccept: (s: ShoppingSuggestion) => void;
  onAcceptAll: () => void;
}

export function ShoppingSuggestionsDialog({
  open,
  onOpenChange,
  suggestions,
  onAccept,
  onAcceptAll,
}: ShoppingSuggestionsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent mobilePresentation="sheet" className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Akıllı Öneriler ({suggestions.length})</DialogTitle>
        </DialogHeader>
        <ShoppingSuggestionsCard
          suggestions={suggestions}
          onAccept={onAccept}
          onAcceptAll={() => {
            onAcceptAll();
            onOpenChange(false);
          }}
          embedded
        />
      </DialogContent>
    </Dialog>
  );
}
