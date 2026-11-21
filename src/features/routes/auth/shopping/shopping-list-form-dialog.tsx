'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/core/dialog';
import { Form, SubmitButton, TextField } from '@/components/forms';
import {
  shoppingListInputSchema,
  type ShoppingListInput,
} from '@/features/inventory/schemas';
import type { ShoppingList } from '@/features/inventory/types';

interface ShoppingListFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editList?: ShoppingList | null;
  onSubmit: (values: ShoppingListInput) => Promise<boolean>;
}

/** Modal dialog for creating or renaming a shopping list. */
export function ShoppingListFormDialog({
  open,
  onOpenChange,
  editList,
  onSubmit,
}: ShoppingListFormDialogProps) {
  const [saving, setSaving] = React.useState(false);

  const handleSubmit = async (values: ShoppingListInput) => {
    setSaving(true);
    try {
      const ok = await onSubmit(values);
      if (ok) {
        onOpenChange(false);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent mobilePresentation="sheet">
        <DialogHeader>
          <DialogTitle>
            {editList ? 'Listeyi Düzenle' : 'Yeni Alışveriş Listesi'}
          </DialogTitle>
        </DialogHeader>
        <Form
          key={editList?.id ?? (open ? 'new-open' : 'new-closed')}
          schema={shoppingListInputSchema}
          defaultValues={{
            name: editList?.name ?? '',
            store: editList?.store ?? '',
            description: editList?.description ?? '',
          }}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <TextField
            name="name"
            label="Liste Adı"
            placeholder="Örn. Haftalık Market, Yapı Market..."
            required
          />
          <TextField
            name="store"
            label="Mağaza / Market (Opsiyonel)"
            placeholder="Örn. Migros, Koçtaş"
          />
          <TextField
            name="description"
            label="Açıklama (Opsiyonel)"
            placeholder="Örn. Cumartesi sabah alışverişi"
          />
          <SubmitButton isLoading={saving} fullWidth>
            {editList ? 'Değişiklikleri Kaydet' : 'Liste Oluştur'}
          </SubmitButton>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
