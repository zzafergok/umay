'use client';

import { Sparkles } from 'lucide-react';
import { Badge } from '@/components/core/badge';
import { Button } from '@/components/core/button';
import {
  CATEGORY_PRESET_TEMPLATES,
  type CategoryPresetTemplate,
} from '@/features/inventory/constants';

interface CategoryPresetsBarProps {
  onApplyTemplate: (template: CategoryPresetTemplate) => void;
}

export function CategoryPresetsBar({
  onApplyTemplate,
}: CategoryPresetsBarProps) {
  return (
    <div className="space-y-1.5 rounded-md border border-border bg-surface-sunken/50 p-2.5">
      <div className="flex items-center gap-1.5 text-xs font-medium text-text-muted">
        <Sparkles className="h-3.5 w-3.5 text-accent" />
        <span>Hazır Şablondan Hızlı Başlat</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {CATEGORY_PRESET_TEMPLATES.map((tpl) => (
          <Button
            key={tpl.id}
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onApplyTemplate(tpl)}
            className="min-h-[38px] gap-1.5 text-xs sm:h-7 sm:min-h-0"
          >
            <span>{tpl.data.name}</span>
            <Badge variant="secondary" className="px-1 py-0 text-[10px]">
              {tpl.data.customFields.length} alan
            </Badge>
          </Button>
        ))}
      </div>
    </div>
  );
}
