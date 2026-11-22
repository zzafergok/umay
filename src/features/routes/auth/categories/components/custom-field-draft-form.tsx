'use client';

import * as React from 'react';
import { Check, Plus, X } from 'lucide-react';
import { Button } from '@/components/core/button';
import { Input } from '@/components/core/input';
import { Label } from '@/components/core/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/core/select';
import { Switch } from '@/components/core/switch';
import { CUSTOM_FIELD_TYPE_OPTIONS } from '@/features/inventory/constants';
import type {
  CustomFieldDefinition,
  CustomFieldType,
} from '@/features/inventory/types';
import { slugifyFieldKey } from '@/features/inventory/utils';
import type { CustomFieldDraft } from '@/features/routes/auth/categories/types';
import { buildFieldDefinitionFromDraft } from './custom-field-draft-utils';
import { CustomFieldTypeOptions } from './custom-field-type-options';

interface CustomFieldDraftFormProps {
  draft: CustomFieldDraft;
  onChange: React.Dispatch<React.SetStateAction<CustomFieldDraft>>;
  existingFields: CustomFieldDefinition[];
  editingIndex: number | null;
  onSubmitField: (field: CustomFieldDefinition) => void;
  onCancelEdit: () => void;
}

export function CustomFieldDraftForm({
  draft,
  onChange,
  existingFields,
  editingIndex,
  onSubmitField,
  onCancelEdit,
}: CustomFieldDraftFormProps) {
  const [error, setError] = React.useState<string | null>(null);

  const otherKeys = React.useMemo(
    () =>
      existingFields
        .filter((_, idx) => idx !== editingIndex)
        .map((field) => field.key),
    [existingFields, editingIndex],
  );

  const selectedTypeMeta = CUSTOM_FIELD_TYPE_OPTIONS.find(
    (opt) => opt.value === draft.type,
  );

  const handleLabelChange = (value: string) => {
    setError(null);
    onChange((prev) => ({
      ...prev,
      label: value,
      key: prev.keyEditedManually ? prev.key : slugifyFieldKey(value),
    }));
  };

  const handleSave = () => {
    const result = buildFieldDefinitionFromDraft(draft, otherKeys);
    if (result.error || !result.definition) {
      setError(result.error ?? 'Alan doğrulanamadı.');
      return;
    }
    setError(null);
    onSubmitField(result.definition);
  };

  return (
    <div className="space-y-3 rounded-md border border-border bg-surface-sunken/40 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          {editingIndex !== null
            ? 'Seçili Alanı Güncelle'
            : 'Yeni Özel Alan Ekle'}
        </p>
        {editingIndex !== null ? (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={onCancelEdit}
          >
            <X className="mr-1 h-3 w-3" />
            Vazgeç
          </Button>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="space-y-1">
          <Label htmlFor="cf-draft-label" className="text-xs">
            Alan Adı *
          </Label>
          <Input
            id="cf-draft-label"
            value={draft.label}
            onChange={(e) => handleLabelChange(e.target.value)}
            placeholder="Örn. Konnektör veya Uzunluk"
            className="h-9 text-xs"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="cf-draft-type" className="text-xs">
            Alan Tipi
          </Label>
          <Select
            value={draft.type}
            onValueChange={(nextType) => {
              setError(null);
              onChange((prev) => ({
                ...prev,
                type: nextType as CustomFieldType,
                defaultValue: undefined,
              }));
            }}
          >
            <SelectTrigger id="cf-draft-type" className="h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CUSTOM_FIELD_TYPE_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="text-xs"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="cf-draft-key" className="text-xs">
            Teknik Anahtar
          </Label>
          <Input
            id="cf-draft-key"
            value={draft.key}
            onChange={(e) =>
              onChange((prev) => ({
                ...prev,
                key: slugifyFieldKey(e.target.value),
                keyEditedManually: true,
              }))
            }
            placeholder="otomatik_anahtar"
            className="h-9 font-mono text-xs"
          />
        </div>
      </div>

      {selectedTypeMeta ? (
        <p className="text-[11px] text-text-muted">
          {selectedTypeMeta.description}
        </p>
      ) : null}

      <CustomFieldTypeOptions draft={draft} onChange={onChange} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="cf-draft-help" className="text-xs">
            Alan Açıklaması / İpucu (Opsiyonel)
          </Label>
          <Input
            id="cf-draft-help"
            value={draft.helpText}
            onChange={(e) =>
              onChange((prev) => ({ ...prev, helpText: e.target.value }))
            }
            placeholder="Ürün formunda alan altında görünür"
            className="h-9 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-2 sm:pt-5">
          <div className="flex items-center gap-2">
            <Switch
              id="cf-draft-required"
              size="sm"
              checked={draft.required}
              onCheckedChange={(val) =>
                onChange((prev) => ({ ...prev, required: val }))
              }
            />
            <Label
              htmlFor="cf-draft-required"
              className="cursor-pointer text-xs"
            >
              Zorunlu alan
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="cf-draft-summary"
              size="sm"
              checked={draft.showInSummary}
              onCheckedChange={(val) =>
                onChange((prev) => ({ ...prev, showInSummary: val }))
              }
            />
            <Label
              htmlFor="cf-draft-summary"
              className="cursor-pointer text-xs"
            >
              Ürün kartında göster
            </Label>
          </div>
        </div>
      </div>

      {error ? <p className="text-xs text-danger">{error}</p> : null}

      <div className="flex justify-end">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleSave}
        >
          {editingIndex !== null ? (
            <>
              <Check className="mr-1.5 h-3.5 w-3.5" />
              Alanı Güncelle
            </>
          ) : (
            <>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Özel Alan Ekle
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
