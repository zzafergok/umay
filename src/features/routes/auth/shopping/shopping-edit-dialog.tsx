'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { Button } from '@/components/core/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/core/dialog';
import {
  AmountField,
  Form,
  SelectField,
  SubmitButton,
  TextField,
} from '@/components/forms';
import type { ShoppingItemPatchInput } from '@/features/inventory/schemas';
import type {
  Category,
  CurrencyCode,
  Item,
  ShoppingListItem,
} from '@/features/inventory/types';
import { formatAmountInput } from '@/lib/utils';
import { SHOPPING_PRIORITY_OPTIONS } from './constants';
import {
  buildLinkedItemOptions,
  buildShoppingCategoryOptions,
  buildShoppingUnitOptions,
  getLinkedItemFieldMeta,
  SHOPPING_FORM_DEFAULT_VALUES,
  shoppingFormSchema,
  type ShoppingFormValues,
} from './shopping-form-schema';
import {
  formatShoppingUnit,
  parseOptionalPrice,
  resolveShoppingTitle,
} from './shopping-utils';

interface ShoppingEditDialogProps {
  entry: ShoppingListItem | null;
  items: Item[];
  categories: Category[];
  currency: CurrencyCode;
  onClose: () => void;
  onSave: (id: string, patch: ShoppingItemPatchInput) => Promise<boolean>;
}

export function ShoppingEditDialog({
  entry,
  items,
  categories,
  currency,
  onClose,
  onSave,
}: ShoppingEditDialogProps) {
  const itemMap = React.useMemo(
    () => new Map(items.map((item) => [item.id, item])),
    [items],
  );
  const categoryOptions = React.useMemo(
    () => buildShoppingCategoryOptions(categories),
    [categories],
  );
  const itemOptions = React.useMemo(
    () => buildLinkedItemOptions(items),
    [items],
  );

  const methods = useForm<ShoppingFormValues>({
    resolver: zodResolver(shoppingFormSchema),
    defaultValues: SHOPPING_FORM_DEFAULT_VALUES,
    mode: 'onChange',
  });

  const selectedUnit = useWatch({
    control: methods.control,
    name: 'unit',
  });
  const unitOptions = React.useMemo(
    () => buildShoppingUnitOptions(selectedUnit),
    [selectedUnit],
  );

  React.useEffect(() => {
    if (!entry) return;
    methods.reset({
      freeText: resolveShoppingTitle(entry, itemMap),
      qty: entry.qty,
      unit: formatShoppingUnit(entry.unit),
      priority: entry.priority ?? 'normal',
      category: entry.category ?? null,
      itemId: entry.itemId ?? null,
      store: entry.store ?? '',
      estimatedPrice:
        typeof entry.estimatedPrice === 'number'
          ? formatAmountInput(entry.estimatedPrice)
          : '',
      note: entry.note ?? '',
    });
  }, [entry, itemMap, methods]);

  const handleSubmit = async (values: ShoppingFormValues) => {
    if (!entry) return;
    const parsedPrice = parseOptionalPrice(values.estimatedPrice);
    const ok = await onSave(entry.id, {
      itemId: values.itemId || null,
      freeText: values.freeText.trim(),
      qty: values.qty,
      unit: formatShoppingUnit(values.unit),
      priority: values.priority,
      category: values.category?.trim() || '',
      store: values.store?.trim() || '',
      estimatedPrice: parsedPrice ?? null,
      note: values.note?.trim() || '',
    });
    if (ok) {
      onClose();
    }
  };

  return (
    <Dialog open={Boolean(entry)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent mobilePresentation="sheet" className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Alışveriş Kalemini Düzenle</DialogTitle>
          <DialogDescription>
            Miktar, öncelik, kategori, mağaza ve tahmini birim fiyat bilgilerini
            güncelleyin.
          </DialogDescription>
        </DialogHeader>
        <Form
          schema={shoppingFormSchema}
          methods={methods}
          onSubmit={handleSubmit}
          className="min-w-0 space-y-3"
        >
          <TextField name="freeText" label="Ürün Adı" required />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <TextField
              name="qty"
              label="Miktar"
              type="number"
              min={0.1}
              step="any"
              inputClassName="tabular-nums"
              required
            />
            <SelectField name="unit" label="Birim" options={unitOptions} />
            <SelectField
              name="priority"
              label="Öncelik"
              options={SHOPPING_PRIORITY_OPTIONS}
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <SelectField
              name="category"
              label="Kategori"
              allowNone
              noneLabel="Kategori seçilmedi"
              placeholder="Kategori seçin"
              options={categoryOptions}
            />
            <SelectField
              name="itemId"
              label="Ev Stoğu ile Eşleştir"
              options={itemOptions}
              {...getLinkedItemFieldMeta(itemOptions.length > 0)}
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TextField
              name="store"
              label="Mağaza / Market"
              placeholder="Örn. Migros"
            />
            <AmountField
              name="estimatedPrice"
              label={`Tahmini Birim Fiyat (${currency})`}
              placeholder="0,00"
              inputClassName="font-medium tabular-nums"
            />
          </div>
          <TextField name="note" label="Not" placeholder="Ek açıklama" />
          <DialogFooter className="bg-surface-raised/95 sticky bottom-0 grid grid-cols-2 gap-2 border-t border-border pt-2.5 backdrop-blur-md sm:static sm:flex sm:justify-end sm:gap-2 sm:bg-transparent sm:pt-3 sm:backdrop-blur-none">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              İptal
            </Button>
            <SubmitButton
              size="sm"
              loadingText="Kaydediliyor..."
              icon={<Save className="h-3.5 w-3.5" />}
              className="w-full sm:w-auto"
            >
              Değişiklikleri Kaydet
            </SubmitButton>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
