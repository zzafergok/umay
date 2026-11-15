'use client';

import { Check } from 'lucide-react';
import { Button } from '@/components/core/button';
import { TextField, TextareaField } from '@/components/forms';
import {
  CATEGORY_COLOR_OPTIONS,
  CATEGORY_ICON_OPTIONS,
} from '@/features/inventory/constants';
import { resolveCategoryColorHex } from '@/features/inventory/utils';
import { cn } from '@/lib/utils';

interface CategoryAppearancePanelProps {
  colorToken: string;
  icon: string;
  onColorChange: (token: string) => void;
  onIconChange: (iconValue: string) => void;
}

export function CategoryAppearancePanel({
  colorToken,
  icon,
  onColorChange,
  onIconChange,
}: CategoryAppearancePanelProps) {
  const activeColorHex = resolveCategoryColorHex(colorToken);

  return (
    <div className="space-y-4">
      <TextField
        name="name"
        label="Kategori Adı"
        placeholder="Örn. Kablo & Aksesuar"
        required
      />

      <TextareaField
        name="description"
        label="Açıklama (Opsiyonel)"
        placeholder="Bu kategoride hangi ürünlerin tutulduğunu kısaca açıklayın..."
        rows={2}
      />

      <div className="space-y-2">
        <p className="font-mono text-2xs uppercase tracking-wider text-ash">
          Kategori Rengi
        </p>
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
          {CATEGORY_COLOR_OPTIONS.map((opt) => {
            const active = colorToken === opt.value;
            return (
              <Button
                key={opt.value}
                type="button"
                variant={active ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => onColorChange(opt.value)}
                className={cn(
                  'justify-start gap-2 px-2.5 text-xs',
                  active && 'border-accent ring-1 ring-accent',
                )}
              >
                <span
                  aria-hidden="true"
                  className="border-border-strong h-3.5 w-3.5 shrink-0 rounded-full border"
                  style={{ backgroundColor: opt.swatchColor }}
                />
                <span className="truncate">{opt.label}</span>
                {active ? (
                  <Check className="ml-auto h-3.5 w-3.5 text-accent" />
                ) : null}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <p className="font-mono text-2xs uppercase tracking-wider text-text-muted">
          Kategori İkonu
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 sm:gap-1.5">
          {CATEGORY_ICON_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const active = icon === opt.value;
            return (
              <Button
                key={opt.value}
                type="button"
                variant={active ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => onIconChange(opt.value)}
                className={cn(
                  'min-h-[40px] justify-start gap-1.5 px-2.5 text-xs sm:min-h-0 sm:px-2',
                  active && 'border-accent ring-1 ring-accent',
                )}
              >
                <Icon
                  className="h-3.5 w-3.5 shrink-0"
                  style={active ? { color: activeColorHex } : undefined}
                />
                <span className="truncate">{opt.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
