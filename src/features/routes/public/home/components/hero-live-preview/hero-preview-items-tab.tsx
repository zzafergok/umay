'use client';

import { CalendarClock, MapPin, Minus, Plus } from 'lucide-react';
import { Badge } from '@/components/core/badge';
import { Button } from '@/components/core/button';
import { StatusPill } from '@/components/core/status-pill';
import { CategoryIcon } from '@/features/inventory/components/category-icon';
import type { HeroItemPreviewRow, HeroPreviewData } from '../../types';

interface HeroPreviewItemsTabProps {
  itemsView: HeroPreviewData['itemsView'];
  items: HeroItemPreviewRow[];
  onAdjustQuantity: (id: string, delta: -1 | 1) => void;
}

export function HeroPreviewItemsTab({
  itemsView,
  items,
  onAdjustQuantity,
}: HeroPreviewItemsTabProps) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-text-muted text-[11px] font-medium">
          {itemsView.componentRef}
        </span>
        <Badge variant="outline" className="font-mono text-[10px]">
          -1 / +1
        </Badge>
      </div>

      {items.map((item) => {
        const isOut = item.quantity <= 0;
        const isLow = item.quantity > 0 && item.quantity <= item.minQuantity;
        const denominator = Math.max(item.targetQuantity, item.minQuantity, 1);
        const percent = Math.max(
          0,
          Math.min(100, Math.round((item.quantity / denominator) * 100)),
        );
        const barColorClass = isOut
          ? 'bg-danger'
          : isLow
            ? 'bg-warning'
            : 'bg-success';

        const statusTone = isOut ? 'out_of_stock' : isLow ? 'low_stock' : 'ok';
        const statusLabel = isOut
          ? item.statusOutLabel
          : isLow
            ? item.statusLowLabel
            : item.statusGoodLabel;
        const cssVar = item.categoryColor.startsWith('--')
          ? item.categoryColor
          : '--cat-1';

        return (
          <div
            key={item.id}
            className="bg-surface-sunken/40 rounded-xl border border-border p-3 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2.5">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border"
                  style={{
                    backgroundColor: `rgb(var(${cssVar}) / 0.14)`,
                    borderColor: `rgb(var(${cssVar}) / 0.35)`,
                    color: `rgb(var(${cssVar}))`,
                  }}
                >
                  <CategoryIcon name={item.categoryIcon} className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-text truncate text-xs font-semibold">
                    {item.name}
                  </p>
                  <p className="text-text-muted truncate text-[11px]">
                    {item.categoryName} · {item.brand}
                  </p>
                </div>
              </div>
              <StatusPill tone={statusTone} label={statusLabel} />
            </div>

            <div className="text-text-muted mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
              <span className="inline-flex items-center gap-1">
                <MapPin
                  className="text-text-subtle h-3 w-3 shrink-0"
                  aria-hidden="true"
                />
                {item.locationPath}
              </span>
              {typeof item.expiresInDays === 'number' && (
                <span className="inline-flex items-center gap-1 font-medium text-warning">
                  <CalendarClock
                    className="h-3 w-3 shrink-0"
                    aria-hidden="true"
                  />
                  {itemsView.expiryPrefix} {item.expiresInDays}{' '}
                  {itemsView.expiryDaysUnit}
                </span>
              )}
            </div>

            {item.customFields.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {item.customFields.map((field) => (
                  <span
                    key={field.label}
                    className="bg-surface text-text-muted rounded-md border border-border px-1.5 py-0.5 text-[10px]"
                  >
                    <strong className="text-text font-medium">
                      {field.label}:
                    </strong>{' '}
                    {field.value}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-2.5 space-y-1.5 border-t border-border/80 pt-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-text text-sm font-semibold tabular-nums">
                    {item.quantity} {item.unit}
                  </span>
                  <span className="text-text-muted text-[11px] tabular-nums">
                    {itemsView.minPrefix} {item.minQuantity} ·{' '}
                    {itemsView.targetPrefix} {item.targetQuantity}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon-sm"
                    onClick={() => onAdjustQuantity(item.id, -1)}
                    disabled={item.quantity === 0}
                    aria-label={`-1 ${item.name}`}
                    className="h-7 w-7 sm:h-6 sm:w-6"
                  >
                    <Minus className="h-3 w-3" aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon-sm"
                    onClick={() => onAdjustQuantity(item.id, 1)}
                    aria-label={`+1 ${item.name}`}
                    className="h-7 w-7 sm:h-6 sm:w-6"
                  >
                    <Plus className="h-3 w-3" aria-hidden="true" />
                  </Button>
                </div>
              </div>

              <div className="bg-surface-sunken h-1.5 w-full overflow-hidden rounded-full">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${barColorClass}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
              {(isLow || isOut) && (
                <p className="text-[10px] font-medium text-warning">
                  {itemsView.lowStockHint}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
