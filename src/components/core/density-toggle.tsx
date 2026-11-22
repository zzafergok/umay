'use client';

import { AlignJustify, Rows3 } from 'lucide-react';
import { Button } from '@/components/core/button';
import { useCurrentLocale } from '@/components/providers/client-locale-provider';

export type DensityMode = 'compact' | 'detailed';

interface DensityToggleProps {
  value: DensityMode;
  onValueChange: (value: DensityMode) => void;
  label?: string;
}

const defaultLabels = {
  tr: {
    label: 'Görünüm Yoğunluğu',
    compact: 'Kompakt',
    detailed: 'Detaylı',
  },
  en: {
    label: 'View Density',
    compact: 'Compact',
    detailed: 'Detailed',
  },
};

export function DensityToggle({
  value,
  onValueChange,
  label,
}: DensityToggleProps) {
  const locale = useCurrentLocale();
  const copy = defaultLabels[locale === 'tr' ? 'tr' : 'en'];
  const toggleLabel = label ?? copy.label;

  return (
    <div
      role="group"
      aria-label={toggleLabel}
      className="inline-flex gap-1 rounded-md border border-border bg-surface p-1"
    >
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onValueChange('compact')}
        aria-pressed={value === 'compact'}
        className={`h-8 gap-1.5 rounded-sm px-3 text-caption font-medium ${
          value === 'compact'
            ? 'bg-accent text-on-accent hover:bg-accent-hover hover:text-on-accent'
            : 'text-text-muted hover:bg-surface-sunken hover:text-text'
        }`}
      >
        <Rows3 className="h-3.5 w-3.5" aria-hidden="true" />
        {copy.compact}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onValueChange('detailed')}
        aria-pressed={value === 'detailed'}
        className={`h-8 gap-1.5 rounded-sm px-3 text-caption font-medium ${
          value === 'detailed'
            ? 'bg-accent text-on-accent hover:bg-accent-hover hover:text-on-accent'
            : 'text-text-muted hover:bg-surface-sunken hover:text-text'
        }`}
      >
        <AlignJustify className="h-3.5 w-3.5" aria-hidden="true" />
        {copy.detailed}
      </Button>
    </div>
  );
}
