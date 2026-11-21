'use client';

import * as React from 'react';
import { Plus, X } from 'lucide-react';
import { Badge } from '@/components/core/badge';
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
import type { CustomFieldDraft } from '@/features/routes/auth/categories/types';

interface SelectOptionsEditorProps {
  draft: CustomFieldDraft;
  onChange: React.Dispatch<React.SetStateAction<CustomFieldDraft>>;
}

export function SelectOptionsEditor({
  draft,
  onChange,
}: SelectOptionsEditorProps) {
  const addOption = () => {
    const trimmed = draft.optionInput.trim();
    if (!trimmed || draft.options.includes(trimmed)) return;
    onChange((prev) => ({
      ...prev,
      options: [...prev.options, trimmed],
      optionInput: '',
    }));
  };

  const removeOption = (option: string) => {
    onChange((prev) => ({
      ...prev,
      options: prev.options.filter((o) => o !== option),
      defaultValue:
        prev.defaultValue === option ? undefined : prev.defaultValue,
    }));
  };

  return (
    <div className="bg-surface space-y-3 rounded-md border border-border p-3">
      <div className="space-y-1.5">
        <Label htmlFor="cf-draft-option" className="text-xs">
          Liste Seçenekleri
        </Label>
        <div className="flex gap-2">
          <Input
            id="cf-draft-option"
            value={draft.optionInput}
            onChange={(e) =>
              onChange((prev) => ({ ...prev, optionInput: e.target.value }))
            }
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (e.nativeEvent.isComposing || e.keyCode === 229) return;
                addOption();
              }
            }}
            placeholder="Örn. USB-C (Enter ile ekle)"
            className="h-9 text-xs"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="min-h-[38px] sm:min-h-0"
            onClick={addOption}
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            Ekle
          </Button>
        </div>
      </div>

      {draft.options.length > 0 ? (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {draft.options.map((opt) => (
              <Badge
                key={opt}
                variant="secondary"
                className="gap-1 py-1 pr-1 text-xs sm:py-0.5"
              >
                <span>{opt}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => removeOption(opt)}
                  aria-label={`${opt} seçeneğini kaldır`}
                  className="hover:bg-danger/15 hover:text-danger h-7 w-7 rounded-full p-0 sm:h-5 sm:w-5"
                >
                  <X className="h-3.5 w-3.5 sm:h-3 sm:w-3" />
                </Button>
              </Badge>
            ))}
          </div>
          <div className="space-y-1">
            <Label htmlFor="cf-draft-default-select" className="text-xs">
              Varsayılan Seçenek (Opsiyonel)
            </Label>
            <Select
              value={
                typeof draft.defaultValue === 'string' && draft.defaultValue
                  ? draft.defaultValue
                  : '__none__'
              }
              onValueChange={(val) =>
                onChange((prev) => ({
                  ...prev,
                  defaultValue: val === '__none__' ? undefined : val,
                }))
              }
            >
              <SelectTrigger
                id="cf-draft-default-select"
                className="h-9 text-xs"
              >
                <SelectValue placeholder="Varsayılan yok" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__" className="text-xs">
                  Varsayılan yok
                </SelectItem>
                {draft.options.map((opt) => (
                  <SelectItem key={opt} value={opt} className="text-xs">
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      ) : (
        <p className="text-text-muted text-xs">
          En az bir seçenek ekleyin (örn. USB-C, Lightning, HDMI).
        </p>
      )}
    </div>
  );
}
