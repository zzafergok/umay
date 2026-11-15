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
  MIN_QUANTITY_TOOLTIP,
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
    <div className="space-y-2.5 sm:space-y-4">
      <TextField
        name="name"
        label="Ürün Adı"
        placeholder="Örn. USB-C Hızlı Şarj Kablosu (2m)"
        inputClassName="h-9 min-h-[38px] text-sm sm:h-11 sm:min-h-[44px]"
        required
      />

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        <SelectField
          name="categoryId"
          label="Kategori"
          options={categoryOptions}
          onValueChange={onCategoryChange}
          triggerClassName="h-9 min-h-[38px] w-full sm:h-11 sm:min-h-[44px]"
          required
        />
        <SelectField
          name="locationId"
          label="Konum"
          options={locationOptions}
          triggerClassName="h-9 min-h-[38px] w-full sm:h-11 sm:min-h-[44px]"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        <SelectField
          name="type"
          label="Ürün Türü"
          options={ITEM_TYPE_OPTIONS.map((opt) => ({
            value: opt.value,
            label: opt.label,
          }))}
          triggerClassName="h-9 min-h-[38px] w-full sm:h-11 sm:min-h-[44px]"
        />
        <SelectField
          name="status"
          label="Durum"
          options={ITEM_STATUS_OPTIONS}
          triggerClassName="h-9 min-h-[38px] w-full sm:h-11 sm:min-h-[44px]"
        />
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
        <AmountField
          name="quantity"
          label="Miktar"
          inputClassName="h-9 min-h-[38px] text-sm sm:h-11 sm:min-h-[44px]"
          required
        />
        <TextField
          name="unit"
          label="Birim"
          placeholder="adet"
          inputClassName="h-9 min-h-[38px] text-sm sm:h-11 sm:min-h-[44px]"
          required
        />
        <AmountField
          name="minQuantity"
          label="Min. Eşik"
          labelTooltip={MIN_QUANTITY_TOOLTIP}
          inputClassName="h-9 min-h-[38px] text-sm sm:h-11 sm:min-h-[44px]"
        />
        <AmountField
          name="targetQuantity"
          label="Hedef Stok"
          placeholder="Opsiyonel"
          inputClassName="h-9 min-h-[38px] text-sm sm:h-11 sm:min-h-[44px]"
        />
      </div>

      <div className="hidden flex-wrap items-center gap-1.5 sm:flex">
        <span className="text-text-muted mr-1 text-[11px]">Hızlı birim:</span>
        {UNIT_SUGGESTIONS.slice(0, 7).map((unit) => (
          <Button
            key={unit}
            type="button"
            size="xs"
            variant={currentUnit === unit ? 'default' : 'outline'}
            onClick={() => setValue('unit', unit, { shouldDirty: true })}
            className="h-7 min-h-[28px] px-2 text-[11px]"
          >
            {unit}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        <TextField
          name="barcode"
          label="Barkod (Opsiyonel)"
          placeholder="869..."
          inputClassName="h-9 min-h-[38px] text-sm sm:h-11 sm:min-h-[44px]"
        />
        <TextField
          name="brand"
          label="Marka (Opsiyonel)"
          placeholder="Örn. Anker"
          inputClassName="h-9 min-h-[38px] text-sm sm:h-11 sm:min-h-[44px]"
        />
      </div>
    </div>
  );
}
