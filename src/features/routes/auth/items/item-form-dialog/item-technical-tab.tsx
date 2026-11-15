'use client';

import { Badge } from '@/components/core/badge';
import { TextField, TextareaField } from '@/components/forms';
import { CustomFieldInput } from '@/features/inventory/components';
import type { Category, CustomFieldValue } from '@/features/inventory/types';
import { TagsInput } from './tags-input';

interface ItemTechnicalTabProps {
  activeCategory?: Category;
  customValues: Record<string, CustomFieldValue>;
  customErrors: Record<string, string>;
  onCustomValueChange: (
    key: string,
    next: CustomFieldValue | undefined,
  ) => void;
  tags: string[];
  onTagsChange: (next: string[]) => void;
}

export function ItemTechnicalTab({
  activeCategory,
  customValues,
  customErrors,
  onCustomValueChange,
  tags,
  onTagsChange,
}: ItemTechnicalTabProps) {
  const defaults = activeCategory?.itemDefaults;
  const customFields = activeCategory?.customFields ?? [];

  return (
    <div className="space-y-4">
      {activeCategory && customFields.length > 0 ? (
        <div className="bg-surface-sunken/30 space-y-3 rounded-md border border-border p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-text-muted text-xs font-semibold uppercase tracking-wider">
              {activeCategory.name} Özel Alanları
            </p>
            <Badge variant="secondary" className="text-[11px]">
              {customFields.length} alan
            </Badge>
          </div>
          <div className="space-y-3">
            {customFields.map((field) => (
              <CustomFieldInput
                key={field.key}
                field={field}
                value={customValues[field.key]}
                error={customErrors[field.key]}
                onChange={(next) => onCustomValueChange(field.key, next)}
              />
            ))}
          </div>
        </div>
      ) : (
        <p className="text-text-muted rounded-md border border-dashed border-border p-3 text-xs">
          Seçili kategoride henüz özel alan tanımlı değil. Kategoriler
          sayfasından bu kategoriye özel inputlar ekleyebilirsiniz.
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextField
          name="model"
          label={defaults?.trackBrandModel ? 'Model (Önerilen)' : 'Model'}
          placeholder="Örn. PowerLine III"
        />
        <TextField
          name="serialNumber"
          label={
            defaults?.trackSerialNumber
              ? 'Seri Numarası (Önerilen)'
              : 'Seri Numarası'
          }
          placeholder="Örn. SN-2026-001"
        />
      </div>

      <TagsInput tags={tags} onChange={onTagsChange} />

      <TextareaField
        name="notes"
        label="Notlar"
        placeholder="Bakım, kullanım veya saklama notları..."
      />
    </div>
  );
}
