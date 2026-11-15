'use client';

import { Badge } from '@/components/core/badge';
import { Label } from '@/components/core/label';
import { Switch } from '@/components/core/switch';
import type {
  CustomFieldDefinition,
  CustomFieldValue,
} from '@/features/inventory/types';
import { cn } from '@/lib/utils';

interface CustomFieldBooleanProps {
  field: CustomFieldDefinition;
  inputId: string;
  value: CustomFieldValue | undefined;
  onChange: (next: boolean) => void;
  error?: string;
  disabled?: boolean;
}

export function CustomFieldBoolean({
  field,
  inputId,
  value,
  onChange,
  error,
  disabled = false,
}: CustomFieldBooleanProps) {
  const checked = value === true || value === 'true';

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 rounded-md border border-border bg-surface-sunken/60 px-3 py-2.5',
        error && 'border-danger',
      )}
    >
      <div className="min-w-0 space-y-0.5">
        <Label htmlFor={inputId} className="cursor-pointer text-sm font-medium">
          {field.label}
          {field.required && <span className="ml-1 text-umay-blue">*</span>}
        </Label>
        {field.helpText ? (
          <p className="text-xs text-text-muted">{field.helpText}</p>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Badge variant={checked ? 'default' : 'outline'} className="text-[11px]">
          {checked ? 'Evet' : 'Hayır'}
        </Badge>
        <Switch
          id={inputId}
          checked={checked}
          onCheckedChange={onChange}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
