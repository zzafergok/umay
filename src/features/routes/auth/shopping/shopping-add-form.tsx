'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronDown, ChevronUp, Plus, SlidersHorizontal } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { Button } from '@/components/core/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/core/card';
import { Label } from '@/components/core/label';
import {
  AmountField,
  Form,
  SelectField,
  SubmitButton,
  TextField,
} from '@/components/forms';
import type { ShoppingItemInput } from '@/features/inventory/schemas';
import type { Category, CurrencyCode, Item } from '@/features/inventory/types';
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
import { formatShoppingUnit, parseOptionalPrice } from './shopping-utils';

interface ShoppingAddFormProps {
  items: Item[];
  categories: Category[];
  currency: CurrencyCode;
  onAdd: (input: ShoppingItemInput) => Promise<boolean>;
}

export function ShoppingAddForm({
  items,
  categories,
  currency,
  onAdd,
}: ShoppingAddFormProps) {
  const [showDetails, setShowDetails] = React.useState(false);

  const methods = useForm<ShoppingFormValues>({
    resolver: zodResolver(shoppingFormSchema),
    defaultValues: SHOPPING_FORM_DEFAULT_VALUES,
    mode: 'onSubmit',
  });

  const selectedItemId = useWatch({
    control: methods.control,
    name: 'itemId',
  });
  const selectedUnit = useWatch({
    control: methods.control,
    name: 'unit',
  });
  const unitOptions = React.useMemo(
    () => buildShoppingUnitOptions(selectedUnit),
    [selectedUnit],
  );
  const categoryOptions = React.useMemo(
    () => buildShoppingCategoryOptions(categories),
    [categories],
  );
  const itemOptions = React.useMemo(
    () => buildLinkedItemOptions(items),
    [items],
  );

  React.useEffect(() => {
    if (!selectedItemId) return;
    const match = items.find((item) => item.id === selectedItemId);
    if (!match) return;
    if (!methods.getValues('freeText').trim()) {
      methods.setValue('freeText', match.name, { shouldValidate: true });
    }
    if (match.unit) {
      methods.setValue('unit', formatShoppingUnit(match.unit));
    }
    const catName = categories.find((c) => c.id === match.categoryId)?.name;
    if (catName && !methods.getValues('category')) {
      methods.setValue('category', catName);
    }
  }, [selectedItemId, items, categories, methods]);

  const handleSubmit = async (values: ShoppingFormValues) => {
    const ok = await onAdd({
      itemId: values.itemId || null,
      freeText: values.freeText.trim(),
      qty: values.qty,
      unit: formatShoppingUnit(values.unit),
      category: values.category?.trim() || undefined,
      priority: values.priority,
      estimatedPrice: parseOptionalPrice(values.estimatedPrice),
      store: values.store?.trim() || undefined,
      note: values.note?.trim() || undefined,
      source: 'manual',
      done: false,
    });
    if (ok) {
      methods.reset(SHOPPING_FORM_DEFAULT_VALUES);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 space-y-0 pb-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-1">
          <CardTitle className="font-display text-base">
            Listeye Ürün Ekle
          </CardTitle>
          <CardDescription className="text-caption">
            Hızlıca ürün ekleyin veya öncelik, mağaza, fiyat ve stok bağlantısı
            tanımlayın.
          </CardDescription>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full shrink-0 sm:w-auto"
          onClick={() => setShowDetails((prev) => !prev)}
          aria-expanded={showDetails}
        >
          <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" />
          Detaylar
          {showDetails ? (
            <ChevronUp className="ml-1 h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="ml-1 h-3.5 w-3.5" />
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <Form
          schema={shoppingFormSchema}
          methods={methods}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_120px_minmax(165px,auto)_auto] lg:items-start">
            <TextField
              name="freeText"
              label="Ürün Adı"
              placeholder="Örn. Bulaşık makinesi tableti"
              className="sm:col-span-2 lg:col-span-1"
              inputClassName="text-body"
              required
            />
            <TextField
              name="qty"
              label="Miktar"
              type="number"
              min={0.1}
              step="any"
              inputClassName="text-body tabular-nums"
              required
            />
            <SelectField
              name="unit"
              label="Birim"
              triggerClassName="text-body"
              options={unitOptions}
            />
            <div className="space-y-1.5 sm:col-span-2 sm:space-y-2 lg:col-span-1">
              <Label
                aria-hidden="true"
                className="pointer-events-none hidden select-none font-mono text-2xs uppercase tracking-wider opacity-0 lg:inline"
              >
                İşlem
              </Label>
              <div>
                <SubmitButton
                  loadingText="Ekleniyor..."
                  icon={<Plus className="h-4 w-4" />}
                  className="w-full shrink-0 lg:w-auto"
                >
                  Ekle
                </SubmitButton>
              </div>
            </div>
          </div>

          {showDetails && (
            <div className="grid grid-cols-1 gap-3 border-t border-border pt-4 sm:grid-cols-2 lg:grid-cols-3">
              <SelectField
                name="priority"
                label="Öncelik"
                triggerClassName="text-body"
                options={SHOPPING_PRIORITY_OPTIONS}
              />
              <SelectField
                name="category"
                label="Kategori"
                triggerClassName="text-body"
                allowNone
                noneLabel="Kategori seçilmedi"
                placeholder="Kategori seçin"
                options={categoryOptions}
              />
              <SelectField
                name="itemId"
                label="Ev Stoğu ile Eşleştir"
                triggerClassName="text-body"
                options={itemOptions}
                {...getLinkedItemFieldMeta(itemOptions.length > 0)}
              />
              <TextField
                name="store"
                label="Mağaza / Market"
                placeholder="Örn. Migros, BİM, Eczane"
                inputClassName="text-body"
              />
              <AmountField
                name="estimatedPrice"
                label={`Tahmini Birim Fiyat (${currency})`}
                placeholder="0,00"
                inputClassName="text-body font-medium tabular-nums"
              />
              <TextField
                name="note"
                label="Not (İsteğe Bağlı)"
                placeholder="Örn. 60'lı ekonomik paket"
                inputClassName="text-body"
              />
            </div>
          )}
        </Form>
      </CardContent>
    </Card>
  );
}
