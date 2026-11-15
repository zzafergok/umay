'use client';

import { useFormContext, useWatch } from 'react-hook-form';
import { Button } from '@/components/core/button';
import {
  AmountField,
  SelectField,
  TextField,
  type SelectOption,
} from '@/components/forms';
import {
  ITEM_STATUS_OPTIONS,
  ITEM_TYPE_OPTIONS,
  UNIT_SUGGESTIONS,
} from '@/features/inventory/constants';

interface ItemBasicTabProps {
  categoryOptions: SelectOption[];
  locationOptions: SelectOption[];
  onCategoryChange?: (categoryId: string | null) => void;
}

export function ItemBasicTab({
  categoryOptions,
  locationOptions,
  onCategoryChange,
}: ItemBasicTabProps) {
  const { setValue, control } = useFormContext();
  const currentUnit = useWatch({ control, name: 'unit' }) as string;

  return (
    <div className="space-y-4">
      <TextField
        name="name"
        label="Ürün Adı"
        placeholder="Örn. USB-C Hızlı Şarj Kablosu (2m)"
        required
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <SelectField
          name="categoryId"
          label="Kategori"
          options={categoryOptions}
          onValueChange={onCategoryChange}
          required
        />
        <SelectField
          name="locationId"
          label="Konum"
          options={locationOptions}
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <SelectField
          name="type"
          label="Ürün Türü"
          options={ITEM_TYPE_OPTIONS.map((opt) => ({
            value: opt.value,
            label: opt.label,
          }))}
        />
        <SelectField
          name="status"
          label="Durum"
          options={ITEM_STATUS_OPTIONS}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <AmountField name="quantity" label="Miktar" required />
        <TextField name="unit" label="Birim" placeholder="adet" required />
        <AmountField name="minQuantity" label="Min. Eşik" />
        <AmountField
          name="targetQuantity"
          label="Hedef Stok"
          placeholder="Opsiyonel"
        />
      </div>

      <div className="flex flex-wrap items-center gap-1">
        <span className="text-text-muted mr-1 text-[11px]">Hızlı birim:</span>
        {UNIT_SUGGESTIONS.slice(0, 7).map((unit) => (
          <Button
            key={unit}
            type="button"
            size="xs"
            variant={currentUnit === unit ? 'default' : 'outline'}
            onClick={() => setValue('unit', unit, { shouldDirty: true })}
            className="h-6 px-2 text-[11px]"
          >
            {unit}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextField
          name="barcode"
          label="Barkod (Opsiyonel)"
          placeholder="869..."
        />
        <TextField
          name="brand"
          label="Marka (Opsiyonel)"
          placeholder="Örn. Anker"
        />
      </div>
    </div>
  );
}
