'use client';

import * as React from 'react';
import { Button } from '@/components/core/button';
import { Input } from '@/components/core/input';
import { Label } from '@/components/core/label';
import { Switch } from '@/components/core/switch';
import { NUMBER_UNIT_SUGGESTIONS } from '@/features/inventory/constants';
import type { CustomFieldDraft } from '@/features/routes/auth/categories/types';
import { SelectOptionsEditor } from './select-options-editor';

interface CustomFieldTypeOptionsProps {
  draft: CustomFieldDraft;
  onChange: React.Dispatch<React.SetStateAction<CustomFieldDraft>>;
}

export function CustomFieldTypeOptions({
  draft,
  onChange,
}: CustomFieldTypeOptionsProps) {
  if (draft.type === 'number') {
    return (
      <div className="space-y-3 rounded-md border border-border bg-surface p-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="space-y-1">
            <Label htmlFor="cf-draft-unit" className="text-xs">
              Birim (Opsiyonel)
            </Label>
            <Input
              id="cf-draft-unit"
              value={draft.unit}
              onChange={(e) =>
                onChange((prev) => ({ ...prev, unit: e.target.value }))
              }
              placeholder="Örn. m, W, gr"
              className="h-9 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="cf-draft-min" className="text-xs">
              Min. Değer
            </Label>
            <Input
              id="cf-draft-min"
              type="number"
              step="any"
              value={draft.min !== undefined ? String(draft.min) : ''}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  min: e.target.value === '' ? undefined : Number(e.target.value),
                }))
              }
              placeholder="—"
              className="h-9 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="cf-draft-max" className="text-xs">
              Max. Değer
            </Label>
            <Input
              id="cf-draft-max"
              type="number"
              step="any"
              value={draft.max !== undefined ? String(draft.max) : ''}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  max: e.target.value === '' ? undefined : Number(e.target.value),
                }))
              }
              placeholder="—"
              className="h-9 text-xs"
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-1">
          <span className="mr-1 text-[11px] text-text-muted">Hızlı birim:</span>
          {NUMBER_UNIT_SUGGESTIONS.map((unit) => (
            <Button
              key={unit}
              type="button"
              size="xs"
              variant={draft.unit === unit ? 'default' : 'outline'}
              onClick={() =>
                onChange((prev) => ({
                  ...prev,
                  unit: prev.unit === unit ? '' : unit,
                }))
              }
              className="min-h-[36px] px-2.5 text-xs sm:h-6 sm:min-h-0 sm:px-2 sm:text-[11px]"
            >
              {unit}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  if (draft.type === 'select') {
    return <SelectOptionsEditor draft={draft} onChange={onChange} />;
  }

  if (draft.type === 'boolean') {
    const checked = draft.defaultValue === true;
    return (
      <div className="flex items-center justify-between rounded-md border border-border bg-surface p-3">
        <div className="space-y-0.5">
          <Label htmlFor="cf-draft-default-bool" className="text-xs font-medium">
            Varsayılan Durum
          </Label>
          <p className="text-[11px] text-text-muted">
            Yeni ürün eklenirken başlangıçta {checked ? 'Evet' : 'Hayır'} olur.
          </p>
        </div>
        <Switch
          id="cf-draft-default-bool"
          checked={checked}
          onCheckedChange={(val) =>
            onChange((prev) => ({ ...prev, defaultValue: val }))
          }
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 rounded-md border border-border bg-surface p-3 sm:grid-cols-2">
      <div className="space-y-1">
        <Label htmlFor="cf-draft-placeholder" className="text-xs">
          İpucu (Placeholder)
        </Label>
        <Input
          id="cf-draft-placeholder"
          value={draft.placeholder}
          onChange={(e) =>
            onChange((prev) => ({ ...prev, placeholder: e.target.value }))
          }
          placeholder="Örn. 220V / 65W"
          className="h-9 text-xs"
        />
      </div>
      {draft.type !== 'date' ? (
        <div className="space-y-1">
          <Label htmlFor="cf-draft-default-text" className="text-xs">
            Varsayılan Değer (Opsiyonel)
          </Label>
          <Input
            id="cf-draft-default-text"
            value={
              draft.defaultValue !== undefined ? String(draft.defaultValue) : ''
            }
            onChange={(e) =>
              onChange((prev) => ({
                ...prev,
                defaultValue: e.target.value || undefined,
              }))
            }
            placeholder="Boş bırakılabilir"
            className="h-9 text-xs"
          />
        </div>
      ) : null}
    </div>
  );
}
