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
    <div className="bg-surface-sunken/55 space-y-1.5 rounded-md border border-border/80 px-2.5 py-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <div className="flex items-baseline gap-1">
            <span
              className={cn(
                'font-heading text-base font-semibold tabular-nums leading-none',
                stock.valueColorClass,
              )}
            >
              {item.quantity}
            </span>
            <span className="text-text-muted text-xs font-medium">
              {item.unit}
            </span>
          </div>
          {stock.thresholdLabel ? (
            <div className="text-text-muted flex items-center gap-1 text-[11px] tabular-nums">
              <span>· {stock.thresholdLabel}</span>
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
          className="bg-surface inline-flex shrink-0 items-center rounded border border-border p-0.5"
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
            className="h-7 w-7 rounded-sm md:h-6 md:w-6"
          >
            <Minus className="h-3 w-3" aria-hidden="true" />
          </Button>
          <span className="h-3.5 w-px bg-border" aria-hidden="true" />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={isBusy}
            onClick={() => onAdjustStock(item, 1)}
            aria-label={`${item.name} stok artır (+1)`}
            className="h-7 w-7 rounded-sm md:h-6 md:w-6"
          >
            <Plus className="h-3 w-3" aria-hidden="true" />
          </Button>
        </div>
      </div>

      {stock.showBar ? (
        <div className="h-1 w-full overflow-hidden rounded-full bg-border/60">
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
