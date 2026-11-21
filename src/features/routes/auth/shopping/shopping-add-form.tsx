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
  embedded?: boolean;
}

export function ShoppingAddForm({
  items,
  categories,
  currency,
  onAdd,
  embedded = false,
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

  const formNode = (
    <Form
      schema={shoppingFormSchema}
      methods={methods}
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <div className="space-y-3">
        <TextField
          name="freeText"
          label="Ürün Adı"
          placeholder="Örn. Bulaşık makinesi tableti"
          required
        />
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
      </div>

      {showDetails && (
        <div className="grid grid-cols-1 gap-3 border-t border-border pt-3 sm:grid-cols-2">
          <SelectField
            name="priority"
            label="Öncelik"
            options={SHOPPING_PRIORITY_OPTIONS}
          />
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
          <TextField
            name="store"
            label="Mağaza / Market"
            placeholder="Örn. Migros, BİM, Eczane"
          />
          <AmountField
            name="estimatedPrice"
            label={`Tahmini Birim Fiyat (${currency})`}
            placeholder="0,00"
            inputClassName="font-medium tabular-nums"
          />
          <TextField
            name="note"
            label="Not (İsteğe Bağlı)"
            placeholder="Örn. 60'lı ekonomik paket"
          />
        </div>
      )}

      <div className="flex flex-col-reverse gap-2 border-t border-border/70 pt-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full sm:w-auto"
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
        <SubmitButton
          size="sm"
          loadingText="Ekleniyor..."
          icon={<Plus className="h-3.5 w-3.5" />}
          className="w-full sm:w-auto"
        >
          Ekle
        </SubmitButton>
      </div>
    </Form>
  );

  if (embedded) {
    return formNode;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="font-display text-base">
          Listeye Ürün Ekle
        </CardTitle>
        <CardDescription className="text-caption">
          Hızlıca ürün ekleyin veya öncelik, mağaza, fiyat ve stok bağlantısı
          tanımlayın.
        </CardDescription>
      </CardHeader>
      <CardContent>{formNode}</CardContent>
    </Card>
  );
}
