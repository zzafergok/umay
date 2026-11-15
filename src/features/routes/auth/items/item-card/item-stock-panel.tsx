'use client';

import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/core/button';
import { InfoTooltip } from '@/components/shared/info-tooltip';
import { MIN_QUANTITY_TOOLTIP } from '@/features/inventory/constants';
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
  const fillWidth = item.quantity > 0 ? Math.max(8, stock.percent) : 0;

  return (
    <div className="bg-surface-sunken/55 space-y-2.5 rounded-md border border-border/80 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-baseline gap-1.5">
            <span
              className={cn(
                'font-heading text-metric tabular-nums leading-none',
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
            <div className="text-text-muted mt-1 flex items-center gap-1 text-[11px] tabular-nums">
              <span>{stock.thresholdLabel}</span>
              {!(item.targetQuantity && item.targetQuantity > 0) &&
                item.minQuantity > 0 && (
                  <InfoTooltip
                    content={MIN_QUANTITY_TOOLTIP}
                    ariaLabel="Minimum stok eşiği hakkında bilgi"
                  />
                )}
            </div>
          ) : null}
        </div>

        <div
          className="bg-surface inline-flex shrink-0 items-center rounded-md border border-border p-0.5"
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
            className="h-10 w-10 rounded-sm md:h-8 md:w-8"
          >
            <Minus className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
          <span className="h-5 w-px bg-border md:h-4" aria-hidden="true" />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={isBusy}
            onClick={() => onAdjustStock(item, 1)}
            aria-label={`${item.name} stok artır (+1)`}
            className="h-10 w-10 rounded-sm md:h-8 md:w-8"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
        </div>
      </div>

      {stock.showBar ? (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-border/60">
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
