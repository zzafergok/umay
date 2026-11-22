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
import { Form, SelectField, SubmitButton, TextField } from '@/components/forms';
import type { ShoppingItemPatchInput } from '@/features/inventory/schemas';
import type {
  Category,
  CurrencyCode,
  Item,
  Location,
  ShoppingListItem,
} from '@/features/inventory/types';
import { formatAmountInput } from '@/lib/utils';
import {
  buildLinkedItemOptions,
  buildShoppingCategoryOptions,
  buildShoppingLocationOptions,
  buildShoppingUnitOptions,
  SHOPPING_FORM_DEFAULT_VALUES,
  shoppingFormSchema,
  type ShoppingFormValues,
} from './shopping-form-schema';
import { ShoppingProductFields } from './shopping-product-fields';
import {
  formatShoppingUnit,
  parseOptionalPrice,
  resolveEditedShoppingPrice,
  resolveShoppingTitle,
} from './shopping-utils';

interface ShoppingEditDialogProps {
  entry: ShoppingListItem | null;
  items: Item[];
  categories: Category[];
  locations: Location[];
  currency: CurrencyCode;
  onClose: () => void;
  onSave: (id: string, patch: ShoppingItemPatchInput) => Promise<boolean>;
}

export function ShoppingEditDialog({
  entry,
  items,
  categories,
  locations,
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
  const locationOptions = React.useMemo(
    () => buildShoppingLocationOptions(locations),
    [locations],
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
  const priceIsDirty = Boolean(methods.formState.dirtyFields.price);

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
      locationId: entry.locationId ?? null,
      type: entry.type ?? 'consumable',
      minQuantity:
        typeof entry.minQuantity === 'number'
          ? formatAmountInput(entry.minQuantity)
          : '',
      itemId: entry.itemId ?? null,
      brand: entry.brand ?? '',
      model: entry.model ?? '',
      barcode: entry.barcode ?? '',
      store: entry.store ?? '',
      price:
        typeof entry.price === 'number'
          ? formatAmountInput(Number(entry.price.toFixed(2)))
          : '',
      expiresAt: entry.expiresAt ? entry.expiresAt.slice(0, 10) : null,
      note: entry.note ?? '',
    });
  }, [entry, itemMap, methods]);

  const handleSubmit = async (values: ShoppingFormValues) => {
    if (!entry) return;
    const parsedPrice = resolveEditedShoppingPrice(
      values.price,
      entry.price,
      priceIsDirty,
    );
    const parsedMinQty = parseOptionalPrice(values.minQuantity);
    const ok = await onSave(entry.id, {
      itemId: values.itemId || null,
      freeText: values.freeText.trim(),
      qty: values.qty,
      unit: formatShoppingUnit(values.unit),
      priority: values.priority,
      category: values.category?.trim() || '',
      locationId: values.locationId || null,
      type: values.type,
      minQuantity: parsedMinQty ?? null,
      brand: values.brand?.trim() || '',
      model: values.model?.trim() || '',
      barcode: values.barcode?.trim() || '',
      currency,
      store: values.store?.trim() || '',
      price: parsedPrice ?? null,
      expiresAt: values.expiresAt || null,
      note: values.note?.trim() || '',
    });
    if (ok) {
      onClose();
    }
  };

  return (
    <Dialog open={Boolean(entry)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        mobilePresentation="sheet"
        className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"
      >
        <DialogHeader>
          <DialogTitle>Alışveriş Kalemini Düzenle</DialogTitle>
          <DialogDescription>
            Miktar, öncelik, kategori, konum, ürün detayları ve birim fiyat
            bilgilerini güncelleyin.
          </DialogDescription>
        </DialogHeader>
        <Form
          schema={shoppingFormSchema}
          methods={methods}
          onSubmit={handleSubmit}
          className="min-w-0 space-y-3"
        >
          <TextField name="freeText" label="Ürün Adı" required />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
          </div>
          <ShoppingProductFields
            currency={currency}
            categoryOptions={categoryOptions}
            locationOptions={locationOptions}
            itemOptions={itemOptions}
          />
          <TextField name="note" label="Not" placeholder="Ek açıklama" />
          <DialogFooter className="sticky bottom-0 grid grid-cols-2 gap-2 border-t border-border bg-surface-raised/95 pt-2.5 backdrop-blur-md sm:static sm:flex sm:justify-end sm:gap-2 sm:bg-transparent sm:pt-3 sm:backdrop-blur-none">
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
