'use client';

import {
  AmountField,
  DateField,
  SelectField,
  TextField,
  type SelectOption,
} from '@/components/forms';
import type { CurrencyCode } from '@/features/inventory/types';
import { SHOPPING_PRIORITY_OPTIONS } from './constants';
import {
  getLinkedItemFieldMeta,
  SHOPPING_ITEM_TYPE_OPTIONS,
} from './shopping-form-schema';

interface ShoppingProductFieldsProps {
  currency: CurrencyCode;
  categoryOptions: SelectOption[];
  locationOptions: SelectOption[];
  itemOptions: SelectOption[];
}

/** Ürünler ekranıyla uyumlu ortak alışveriş kalemi detay alanları. */
export function ShoppingProductFields({
  currency,
  categoryOptions,
  locationOptions,
  itemOptions,
}: ShoppingProductFieldsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <SelectField
        name="priority"
        label="Öncelik"
        options={SHOPPING_PRIORITY_OPTIONS}
      />
      <SelectField
        name="type"
        label="Ürün Türü"
        options={SHOPPING_ITEM_TYPE_OPTIONS}
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
        name="locationId"
        label="Konum (Alınınca Eklenecek)"
        allowNone
        noneLabel="Varsayılan konum"
        placeholder="Konum seçin"
        options={locationOptions}
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
        placeholder="Örn. Migros, Yunus Market"
      />
      <AmountField
        name="estimatedPrice"
        label={`Tahmini Birim Fiyat (${currency})`}
        placeholder="0,00"
        inputClassName="font-medium tabular-nums"
      />
      <AmountField
        name="minQuantity"
        label="Minimum Stok"
        placeholder="0"
        inputClassName="tabular-nums"
      />
      <TextField name="brand" label="Marka" placeholder="Örn. Torku, Eti" />
      <TextField name="model" label="Model" placeholder="İsteğe bağlı" />
      <TextField
        name="barcode"
        label="Barkod"
        placeholder="869..."
        inputClassName="font-mono"
      />
      <DateField
        name="expiresAt"
        label="Son Kullanma Tarihi"
        placeholder="Tarih seçin"
      />
    </div>
  );
}
