'use client';

import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/core/button';
import type { Item } from '@/features/inventory/types';
import { cn } from '@/lib/utils';
import { getItemStockBarState } from './item-card-utils';

interface ItemStockPanelProps {
  item: Item;
  isBusy?: boolean;
  onAdjustStock: (item: Item, delta: number) => void;
}

/** Compact stock readout, threshold progress bar, and bidirectional (-1 / +1) quick stock control. */
export function ItemStockPanel({
  item,
  isBusy = false,
  onAdjustStock,
}: ItemStockPanelProps) {
  const stock = getItemStockBarState(item);
  const fillWidth =
    item.quantity > 0 ? Math.max(8, stock.percent) : 0;

  return (
    <div className="bg-surface-sunken/55 space-y-2.5 rounded-md border border-border/80 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-baseline gap-1.5">
            <span
              className={cn(
                'font-heading text-metric leading-none tabular-nums',
                stock.valueColorClass,
              )}
            >
              {item.quantity}
            </span>
            <span className="text-body-sm text-text-muted font-medium">
              {item.unit}
            </span>
          </div>
          {stock.thresholdLabel ? (
            <p className="text-text-muted mt-1 text-[11px] tabular-nums">
              {stock.thresholdLabel}
            </p>
          ) : null}
        </div>

        <div
          className="inline-flex shrink-0 items-center rounded-md border border-border bg-surface p-0.5"
          role="group"
          aria-label={`${item.name} hızlı stok kontrolü`}
        >
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={isBusy || item.quantity <= 0}
            onClick={() => onAdjustStock(item, -1)}
            aria-label={`${item.name} stok azalt (-1)`}
            className="h-8 w-8 rounded-sm"
          >
            <Minus className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
          <span className="h-4 w-px bg-border" aria-hidden="true" />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={isBusy}
            onClick={() => onAdjustStock(item, 1)}
            aria-label={`${item.name} stok artır (+1)`}
            className="h-8 w-8 rounded-sm"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
        </div>
      </div>

      {stock.showBar ? (
        <div className="bg-border/60 h-1.5 w-full overflow-hidden rounded-full">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-300',
              stock.barColorClass,
            )}
            style={{ width: `${fillWidth}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}
