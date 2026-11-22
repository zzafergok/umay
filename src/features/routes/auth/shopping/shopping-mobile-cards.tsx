'use client';

import { Link2, MapPin, Minus, Pencil, Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/core/badge';
import { Button } from '@/components/core/button';
import { Checkbox } from '@/components/core/checkbox';
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

interface ShoppingMobileCardsProps {
  entries: ShoppingListItem[];
  itemMap: Map<string, Item>;
  categoryMap: Map<string, Category>;
  currency: CurrencyCode;
  onToggleDone: (entry: ShoppingListItem) => void;
  onAdjustQty: (entry: ShoppingListItem, delta: number) => void;
  onEdit: (entry: ShoppingListItem) => void;
  onDelete: (id: string) => void;
}

export function ShoppingMobileCards({
  entries,
  itemMap,
  categoryMap,
  currency,
  onToggleDone,
  onAdjustQty,
  onEdit,
  onDelete,
}: ShoppingMobileCardsProps) {
  return (
    <div className="space-y-2.5 md:hidden">
      {entries.map((entry) => {
        const title = resolveShoppingTitle(entry, itemMap);
        const categoryLabel = resolveShoppingCategory(
          entry,
          itemMap,
          categoryMap,
        );
        const linked = entry.itemId ? itemMap.get(entry.itemId) : undefined;
        const priority = entry.priority ?? 'normal';
        const priorityMeta = SHOPPING_PRIORITY_META[priority];
        const hasPrice =
          typeof entry.estimatedPrice === 'number' && entry.estimatedPrice > 0;
        const lineTotal = hasPrice
          ? (entry.estimatedPrice ?? 0) * entry.qty
          : null;

        return (
          <div
            key={entry.id}
            className={cn(
              'space-y-2.5 rounded-xl border border-border bg-surface p-3 transition-opacity',
              entry.done && 'opacity-70',
            )}
          >
            <div className="flex items-start gap-2.5">
              <div className="-ml-1 -mt-1 flex h-10 w-10 shrink-0 items-center justify-center">
                <Checkbox
                  checked={entry.done}
                  onCheckedChange={() => onToggleDone(entry)}
                  aria-label={`${title} alındı durumunu değiştir`}
                  className="relative size-5 after:absolute after:-inset-2.5 after:content-['']"
                />
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <p
                    className={cn(
                      'text-body-sm font-medium leading-snug text-text',
                      entry.done && 'text-text-muted line-through',
                    )}
                  >
                    {title}
                  </p>
                  <Badge
                    variant={priorityMeta.badgeVariant}
                    size="sm"
                    className="shrink-0"
                  >
                    {priorityMeta.label}
                  </Badge>
                </div>

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
                      <MapPin className="h-3 w-3 shrink-0" />
                      {entry.store}
                    </span>
                  )}
                  {linked && (
                    <span className="inline-flex items-center gap-1 text-caption text-accent">
                      <Link2 className="h-3 w-3 shrink-0" />
                      {entry.done
                        ? 'Stoğa işlendi'
                        : `Alınınca +${entry.qty} stok`}
                    </span>
                  )}
                </div>

                {entry.note && (
                  <p className="text-caption text-text-muted">{entry.note}</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-2">
              <div className="inline-flex items-center gap-0.5 rounded-md border border-border bg-surface-sunken p-0.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={entry.done || entry.qty <= 1}
                  onClick={() => onAdjustQty(entry, -1)}
                  aria-label={`${title} miktarını azalt`}
                  className="h-10 w-10"
                >
                  <Minus className="h-3.5 w-3.5" />
                </Button>
                <span className="min-w-[4.5rem] whitespace-nowrap px-1.5 text-center font-mono text-caption tabular-nums text-text">
                  {entry.qty} {formatShoppingUnit(entry.unit)}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={entry.done}
                  onClick={() => onAdjustQty(entry, 1)}
                  aria-label={`${title} miktarını artır`}
                  className="h-10 w-10"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                {lineTotal !== null && (
                  <span className="font-mono text-xs font-medium tabular-nums text-text">
                    {formatCurrency(lineTotal, { currency, locale: 'tr' })}
                  </span>
                )}
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
            </div>
          </div>
        );
      })}
    </div>
  );
}
