'use client';

import { Link2, MapPin, Minus, Pencil, Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/core/badge';
import { Button } from '@/components/core/button';
import { Checkbox } from '@/components/core/checkbox';
import { TableCell, TableRow } from '@/components/core/table';
import { TableActionButton } from '@/components/shared/table-action-button';
import type {
  Category,
  CurrencyCode,
  Item,
  ShoppingListItem,
} from '@/features/inventory/types';
import { cn, formatCurrency } from '@/lib/utils';
import { SHOPPING_PRIORITY_META, SHOPPING_SOURCE_LABELS } from './constants';
import {
  formatShoppingUnit,
  resolveShoppingCategory,
  resolveShoppingTitle,
} from './shopping-utils';

interface ShoppingListRowProps {
  entry: ShoppingListItem;
  itemMap: Map<string, Item>;
  categoryMap: Map<string, Category>;
  currency: CurrencyCode;
  onToggleDone: (entry: ShoppingListItem) => void;
  onAdjustQty: (entry: ShoppingListItem, delta: number) => void;
  onEdit: (entry: ShoppingListItem) => void;
  onDelete: (id: string) => void;
}

export function ShoppingListRow({
  entry,
  itemMap,
  categoryMap,
  currency,
  onToggleDone,
  onAdjustQty,
  onEdit,
  onDelete,
}: ShoppingListRowProps) {
  const title = resolveShoppingTitle(entry, itemMap);
  const categoryLabel = resolveShoppingCategory(entry, itemMap, categoryMap);
  const linked = entry.itemId ? itemMap.get(entry.itemId) : undefined;
  const priority = entry.priority ?? 'normal';
  const priorityMeta = SHOPPING_PRIORITY_META[priority];
  const hasPrice =
    typeof entry.estimatedPrice === 'number' && entry.estimatedPrice > 0;
  const lineTotal = hasPrice ? (entry.estimatedPrice ?? 0) * entry.qty : null;

  return (
    <TableRow
      data-state={entry.done ? 'selected' : undefined}
      className={cn(entry.done && 'opacity-70')}
    >
      <TableCell>
        <Checkbox
          checked={entry.done}
          onCheckedChange={() => onToggleDone(entry)}
          aria-label={`${title} alındı durumunu değiştir`}
        />
      </TableCell>
      <TableCell className="whitespace-normal">
        <div className="min-w-[180px] space-y-1">
          <p
            className={cn(
              'text-body-sm font-medium text-text',
              entry.done && 'text-text-muted line-through',
            )}
          >
            {title}
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            {categoryLabel && (
              <Badge variant="secondary" size="sm">
                {categoryLabel}
              </Badge>
            )}
            <Badge variant="outline" size="sm">
              {SHOPPING_SOURCE_LABELS[entry.source]}
            </Badge>
            {entry.store && (
              <span className="inline-flex items-center gap-1 text-caption text-text-muted">
                <MapPin className="h-3 w-3" />
                {entry.store}
              </span>
            )}
            {linked && (
              <span className="inline-flex items-center gap-1 text-caption text-accent">
                <Link2 className="h-3 w-3" />
                {entry.done ? 'Stoğa işlendi' : `Alınınca +${entry.qty} stok`}
              </span>
            )}
          </div>
          {entry.note && (
            <p className="text-caption text-text-muted">{entry.note}</p>
          )}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={priorityMeta.badgeVariant} size="sm">
          {priorityMeta.label}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="inline-flex items-center gap-1 rounded-sm border border-border bg-surface-sunken px-1 py-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            disabled={entry.done || entry.qty <= 1}
            onClick={() => onAdjustQty(entry, -1)}
            aria-label={`${title} miktarını azalt`}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="min-w-[5.25rem] whitespace-nowrap px-1.5 text-center font-mono text-caption tabular-nums text-text">
            {entry.qty} {formatShoppingUnit(entry.unit)}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            disabled={entry.done}
            onClick={() => onAdjustQty(entry, 1)}
            aria-label={`${title} miktarını artır`}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </TableCell>
      <TableCell className="text-right font-mono tabular-nums">
        {lineTotal !== null ? (
          <div className="space-y-0.5">
            <p className="text-body-sm font-medium text-text">
              {formatCurrency(lineTotal, { currency, locale: 'tr' })}
            </p>
            <p className="text-2xs text-text-muted">
              {formatCurrency(entry.estimatedPrice ?? 0, {
                currency,
                locale: 'tr',
              })}
              /{formatShoppingUnit(entry.unit)}
            </p>
          </div>
        ) : (
          <span className="text-text-subtle">—</span>
        )}
      </TableCell>
      <TableCell className="text-right">
        <div className="inline-flex items-center justify-end gap-1">
          <TableActionButton
            icon={Pencil}
            tooltip="Düzenle"
            iconClassName="h-4 w-4 text-text-muted"
            aria-label={`${title} düzenle`}
            onClick={() => onEdit(entry)}
          />
          <TableActionButton
            icon={Trash2}
            tooltip="Listeden sil"
            tone="danger"
            iconClassName="h-4 w-4"
            aria-label={`${title} listeden sil`}
            onClick={() => onDelete(entry.id)}
          />
        </div>
      </TableCell>
    </TableRow>
  );
}
