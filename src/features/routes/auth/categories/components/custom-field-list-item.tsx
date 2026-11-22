'use client';

import { ArrowDown, ArrowUp, Copy, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/core/badge';
import { Button } from '@/components/core/button';
import type { CustomFieldDefinition } from '@/features/inventory/types';
import { formatCustomFieldBadge } from '@/features/inventory/utils';

interface CustomFieldListItemProps {
  field: CustomFieldDefinition;
  index: number;
  total: number;
  isEditing?: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
}

export function CustomFieldListItem({
  field,
  index,
  total,
  isEditing = false,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDuplicate,
  onRemove,
}: CustomFieldListItemProps) {
  return (
    <div
      className={`flex flex-col gap-3 rounded-md border px-3 py-2.5 transition-colors sm:flex-row sm:items-center sm:justify-between sm:gap-2 sm:py-2 ${
        isEditing
          ? 'border-accent bg-accent-subtle/40'
          : 'border-border bg-surface-sunken/50'
      }`}
    >
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-mono text-2xs tabular-nums text-text-subtle">
            #{index + 1}
          </span>
          <span className="truncate text-sm font-medium text-text">
            {field.label}
          </span>
          <Badge variant="secondary" className="text-[11px]">
            {formatCustomFieldBadge(field)}
          </Badge>
          {field.required ? (
            <Badge
              variant="outline"
              className="border-accent/40 text-[11px] text-accent"
            >
              Zorunlu
            </Badge>
          ) : null}
          {field.showInSummary ? (
            <Badge variant="outline" className="text-[11px]">
              Kartta
            </Badge>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-text-muted">
          <code className="rounded-xs bg-surface px-1.5 py-0.5 font-mono text-[10px]">
            {field.key}
          </code>
          {field.helpText ? (
            <span className="truncate">{field.helpText}</span>
          ) : null}
        </div>
      </div>

      <div className="grid w-full shrink-0 grid-cols-5 gap-1.5 border-t border-border/60 pt-2 sm:flex sm:w-auto sm:items-center sm:gap-0.5 sm:border-t-0 sm:pt-0">
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="h-9 w-full sm:h-7 sm:w-7"
          disabled={index === 0}
          onClick={onMoveUp}
          aria-label={`${field.label} alanını yukarı taşı`}
        >
          <ArrowUp className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="h-9 w-full sm:h-7 sm:w-7"
          disabled={index === total - 1}
          onClick={onMoveDown}
          aria-label={`${field.label} alanını aşağı taşı`}
        >
          <ArrowDown className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="h-9 w-full sm:h-7 sm:w-7"
          onClick={onEdit}
          aria-label={`${field.label} alanını düzenle`}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="h-9 w-full sm:h-7 sm:w-7"
          onClick={onDuplicate}
          aria-label={`${field.label} alanını çoğalt`}
        >
          <Copy className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="h-9 w-full text-danger/80 hover:bg-danger-subtle hover:text-danger sm:h-7 sm:w-7"
          onClick={onRemove}
          aria-label={`${field.label} alanını sil`}
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
