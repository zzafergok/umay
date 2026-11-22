'use client';

import * as React from 'react';
import { ChevronDown, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/core/button';
import { Input } from '@/components/core/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/core/popover';
import { InfoTooltip } from '@/components/shared/info-tooltip';
import {
  getEffectiveDecrementStep,
  getUnitDefinition,
  MIN_QUANTITY_TOOLTIP,
  roundQuantity,
} from '@/features/inventory/constants';
import type { Item } from '@/features/inventory/types';
import { cn } from '@/lib/utils';
import { getItemStockBarState } from './item-card-utils';

interface ItemStockPanelProps {
  item: Item;
  isBusy?: boolean;
  onAdjustStock: (item: Item, delta: number) => void;
}

/** Compact stock readout, threshold progress bar, and unit-aware quick stock control. */
export function ItemStockPanel({
  item,
  isBusy = false,
  onAdjustStock,
}: ItemStockPanelProps) {
  const [customStep, setCustomStep] = React.useState('');
  const [menuOpen, setMenuOpen] = React.useState(false);

  const stock = getItemStockBarState(item);
  const fillWidth = item.quantity > 0 ? Math.max(8, stock.percent) : 0;
  const unitDef = getUnitDefinition(item.unit);
  const incStep = unitDef.defaultStep;
  const decStep = getEffectiveDecrementStep(item.unit, item.quantity);

  const applyCustomDelta = (sign: 1 | -1) => {
    const parsed = Number(customStep.replace(',', '.'));
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    const delta =
      sign < 0
        ? -getEffectiveDecrementStep(item.unit, item.quantity, parsed)
        : roundQuantity(parsed);
    if (delta === 0) return;
    onAdjustStock(item, delta);
    setCustomStep('');
    setMenuOpen(false);
  };

  return (
    <div className="space-y-1.5 rounded-md border border-border/80 bg-surface-sunken/55 px-2.5 py-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <div className="flex min-w-0 items-baseline gap-1">
            <span
              className={cn(
                'font-heading text-base font-semibold tabular-nums leading-none',
                stock.valueColorClass,
              )}
            >
              {roundQuantity(item.quantity)}
            </span>
            <span className="truncate text-xs font-medium text-text-muted">
              {item.unit}
            </span>
          </div>
          {stock.thresholdLabel ? (
            <div className="flex items-center gap-1 text-[11px] tabular-nums text-text-muted">
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
          className="inline-flex shrink-0 items-center rounded border border-border bg-surface p-0.5"
          role="group"
          aria-label={`${item.name} hızlı stok kontrolü`}
        >
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={isBusy || item.quantity <= 0}
            onClick={() => onAdjustStock(item, -decStep)}
            aria-label={`${item.name} stok azalt (-${decStep} ${item.unit})`}
            className="h-7 w-7 rounded-sm md:h-6 md:w-6"
          >
            <Minus className="h-3 w-3" aria-hidden="true" />
          </Button>
          <span className="h-3.5 w-px bg-border" aria-hidden="true" />
          <Popover open={menuOpen} onOpenChange={setMenuOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isBusy}
                aria-label={`${item.name} birim miktarı seç`}
                className="h-7 min-h-0 gap-0.5 rounded-sm px-1.5 font-mono text-[11px] tabular-nums text-text-muted hover:text-text md:h-6"
              >
                <span>{incStep}</span>
                <ChevronDown className="h-2.5 w-2.5" aria-hidden="true" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-64 max-w-[calc(100vw-2rem)] space-y-2.5 p-3"
            >
              <p className="truncate text-caption font-medium text-text">
                Miktar düş / ekle ({unitDef.shortLabel})
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {unitDef.stepPresets.map((preset) => {
                  const effectiveDec = getEffectiveDecrementStep(
                    item.unit,
                    item.quantity,
                    preset,
                  );
                  return (
                    <Button
                      key={`dec-${preset}`}
                      type="button"
                      size="xs"
                      variant="outline"
                      disabled={isBusy || item.quantity <= 0}
                      onClick={() => {
                        onAdjustStock(item, -effectiveDec);
                        setMenuOpen(false);
                      }}
                      className="h-8 min-h-0 min-w-0 justify-center px-2 font-mono tabular-nums"
                    >
                      <span className="truncate">
                        -{preset} {unitDef.shortLabel}
                      </span>
                    </Button>
                  );
                })}
              </div>
              <div className="flex items-center gap-1.5 border-t border-border pt-2">
                <Input
                  type="number"
                  step={unitDef.allowDecimal ? '0.01' : '1'}
                  min="0"
                  placeholder="Özel"
                  value={customStep}
                  onChange={(e) => setCustomStep(e.target.value)}
                  className="h-8 text-caption"
                />
                <Button
                  type="button"
                  size="xs"
                  variant="secondary"
                  disabled={isBusy || item.quantity <= 0}
                  onClick={() => applyCustomDelta(-1)}
                  className="h-8 min-h-0 shrink-0 px-2"
                >
                  Düş
                </Button>
                <Button
                  type="button"
                  size="xs"
                  variant="primary"
                  disabled={isBusy}
                  onClick={() => applyCustomDelta(1)}
                  className="h-8 min-h-0 shrink-0 px-2"
                >
                  Ekle
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          <span className="h-3.5 w-px bg-border" aria-hidden="true" />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={isBusy}
            onClick={() => onAdjustStock(item, incStep)}
            aria-label={`${item.name} stok artır (+${incStep} ${item.unit})`}
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
