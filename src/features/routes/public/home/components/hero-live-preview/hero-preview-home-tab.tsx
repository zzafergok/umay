'use client';

import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/core/button';
import { StatusPill } from '@/components/core/status-pill';
import type { HeroItemPreviewRow, HeroPreviewData } from '../../types';

interface HeroPreviewHomeTabProps {
  homeView: HeroPreviewData['homeView'];
  items: HeroItemPreviewRow[];
  lowStockItems: HeroItemPreviewRow[];
  openShoppingCount: number;
  onJumpToItems: () => void;
}

export function HeroPreviewHomeTab({
  homeView,
  items,
  lowStockItems,
  openShoppingCount,
  onJumpToItems,
}: HeroPreviewHomeTabProps) {
  const stats = [
    {
      id: 'total',
      label: homeView.statsLabels.totalItems,
      value: items.length,
      accent: 'text-text',
    },
    {
      id: 'low',
      label: homeView.statsLabels.lowStock,
      value: lowStockItems.length,
      accent: lowStockItems.length > 0 ? 'text-warning' : 'text-success',
    },
    {
      id: 'parts',
      label: homeView.statsLabels.dueParts,
      value: homeView.duePartsBaseCount,
      accent: 'text-danger',
    },
    {
      id: 'shopping',
      label: homeView.statsLabels.openShopping,
      value: openShoppingCount,
      accent: 'text-accent',
    },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.id}
            className="rounded-lg border border-border bg-surface-sunken/70 px-2.5 py-2"
          >
            <p className="truncate text-[11px] font-medium text-text-muted">
              {stat.label}
            </p>
            <p
              className={`mt-0.5 text-lg font-semibold tabular-nums ${stat.accent}`}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-surface-sunken/40 p-3">
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <p className="text-xs font-semibold text-text">
            {homeView.attentionTitle}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-surface px-2.5 py-2">
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-text">
                {homeView.duePartRow.title}
              </p>
              <p className="truncate text-[11px] text-text-muted">
                {homeView.duePartRow.subtitle}
              </p>
            </div>
            <StatusPill
              tone={homeView.duePartRow.status}
              label={homeView.duePartRow.statusLabel}
            />
          </div>

          {lowStockItems.length === 0 ? (
            <div className="rounded-lg border border-success/25 bg-success-subtle px-3 py-2.5 text-xs text-text">
              {homeView.itemOkBanner}
            </div>
          ) : (
            lowStockItems.map((item) => {
              const isOut = item.quantity <= 0;
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-border bg-surface px-2.5 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-text">
                      {item.name}
                    </p>
                    <p className="truncate text-[11px] text-text-muted">
                      {item.quantity} / {item.minQuantity} {item.unit} ·{''}
                      {homeView.itemLowFallbackSubtitle}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <StatusPill
                      tone={isOut ? 'out_of_stock' : 'low_stock'}
                      label={isOut ? item.statusOutLabel : item.statusLowLabel}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={onJumpToItems}
                      aria-label={item.name}
                      className="h-6 w-6"
                    >
                      <ArrowUpRight
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
