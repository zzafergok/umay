'use client';

import * as React from 'react';
import { Badge } from '@/components/core/badge';
import {
  CategoryIcon,
  CustomFieldInput,
} from '@/features/inventory/components';
import { ITEM_TYPE_OPTIONS } from '@/features/inventory/constants';
import type {
  CategoryDefaultItemConfig,
  CustomFieldDefinition,
  CustomFieldValue,
} from '@/features/inventory/types';
import {
  buildDefaultCustomFieldValues,
  resolveCategoryColorHex,
} from '@/features/inventory/utils';

interface CategoryLivePreviewProps {
  name: string;
  description?: string;
  colorToken: string;
  icon: string;
  customFields: CustomFieldDefinition[];
  itemDefaults: CategoryDefaultItemConfig;
}

export function CategoryLivePreview({
  name,
  description,
  colorToken,
  icon,
  customFields,
  itemDefaults,
}: CategoryLivePreviewProps) {
  const [previewValues, setPreviewValues] = React.useState<
    Record<string, CustomFieldValue>
  >({});

  const effectiveValues = React.useMemo(
    () => buildDefaultCustomFieldValues(customFields, previewValues),
    [customFields, previewValues],
  );

  const color = resolveCategoryColorHex(colorToken);
  const typeLabel =
    ITEM_TYPE_OPTIONS.find((opt) => opt.value === itemDefaults.defaultType)
      ?.label ?? 'Sarf Malzeme';

  const activeTrackingBadges = [
    itemDefaults.trackBrandModel ? 'Marka & Model' : null,
    itemDefaults.trackSerialNumber ? 'Seri No' : null,
    itemDefaults.trackPurchase ? 'Satın Alma & Fiyat' : null,
    itemDefaults.trackWarranty ? 'Garanti' : null,
    itemDefaults.trackExpiry ? 'SKT' : null,
  ].filter(Boolean) as string[];

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border bg-surface-sunken/50 p-3">
        <div className="flex items-start gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-surface"
            style={{ color }}
          >
            <CategoryIcon name={icon} className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: color }}
              />
              <h4 className="text-sm font-semibold text-text">
                {name.trim() || 'Örnek Kategori'}
              </h4>
              <Badge variant="outline" className="text-[11px]">
                {typeLabel}
              </Badge>
              <Badge variant="secondary" className="text-[11px]">
                Birim: {itemDefaults.defaultUnit || 'adet'}
              </Badge>
              {itemDefaults.defaultMinQuantity !== undefined ? (
                <Badge variant="secondary" className="text-[11px]">
                  Min: {itemDefaults.defaultMinQuantity}
                </Badge>
              ) : null}
            </div>
            {description ? (
              <p className="text-xs text-text-muted">{description}</p>
            ) : null}
            {activeTrackingBadges.length > 0 ? (
              <div className="flex flex-wrap gap-1 pt-1">
                {activeTrackingBadges.map((label) => (
                  <Badge key={label} variant="outline" className="text-[10px]">
                    + {label}
                  </Badge>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="space-y-3 rounded-md border border-border p-3">
        <p className="font-mono text-2xs uppercase tracking-wider text-ash">
          Ürün Ekleme Formunda Görünecek Özel Alanlar
        </p>
        {customFields.length === 0 ? (
          <p className="text-xs text-text-muted">
            Henüz özel alan eklenmedi. &ldquo;Özel Alanlar&rdquo; sekmesinden bu
            kategoriye özel teknik inputlar ekleyebilirsiniz.
          </p>
        ) : (
          <div className="space-y-3">
            {customFields.map((field) => (
              <CustomFieldInput
                key={field.key}
                field={field}
                idPrefix="preview-cf"
                value={effectiveValues[field.key]}
                onChange={(next) =>
                  setPreviewValues((prev) => {
                    const updated = { ...prev };
                    if (next === undefined) {
                      delete updated[field.key];
                    } else {
                      updated[field.key] = next;
                    }
                    return updated;
                  })
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
