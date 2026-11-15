'use client';

import * as React from 'react';
import { Eye, Pencil } from 'lucide-react';
import { Badge } from '@/components/core/badge';
import { Button } from '@/components/core/button';
import { Card, CardContent } from '@/components/core/card';
import { StatusPill, type StatusTone } from '@/components/core/status-pill';
import type { Category, Item, Location } from '@/features/inventory/types';
import {
  formatCustomFieldValue,
  resolveCategoryColorHex,
} from '@/features/inventory/utils';
import { resolveCategoryCssVar } from '@/lib/design/tokens';

function getItemExceptionPill(
  item: Item,
  nowMs: number,
): { tone: StatusTone; label: string } | null {
  if (item.quantity <= 0) {
    return { tone: 'out_of_stock', label: 'Tükendi' };
  }
  if (item.minQuantity > 0 && item.quantity <= item.minQuantity) {
    return { tone: 'low_stock', label: 'Düşük stok' };
  }
  if (item.status === 'in_repair') {
    return { tone: 'in_repair', label: 'Tamirde' };
  }
  if (item.status === 'lent') {
    return { tone: 'lent', label: 'Ödünç' };
  }
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  const expMs = item.expiresAt ? Date.parse(item.expiresAt) : NaN;
  if (!Number.isNaN(expMs)) {
    if (expMs < nowMs) {
      return { tone: 'overdue', label: 'SKT geçti' };
    }
    if (expMs - nowMs <= thirtyDaysMs) {
      return { tone: 'due_soon', label: 'SKT yaklaşıyor' };
    }
  }
  return null;
}

interface ItemCardProps {
  item: Item;
  category?: Category;
  location?: Location;
  onConsume: (item: Item) => void;
  onDetail: (item: Item) => void;
  onEdit: (item: Item) => void;
  isBusy?: boolean;
}

export function ItemCard({
  item,
  category,
  location,
  onConsume,
  onDetail,
  onEdit,
  isBusy = false,
}: ItemCardProps) {
  const [nowMs] = React.useState(() => Date.now());
  const pill = getItemExceptionPill(item, nowMs);
  const locationText = location ? location.path.join(' > ') : 'Konum yok';
  const dotColor = category?.colorToken
    ? resolveCategoryColorHex(category.colorToken)
    : resolveCategoryCssVar(category?.name);
  const summaryFields = (category?.customFields ?? [])
    .filter(
      (field) =>
        field.showInSummary &&
        item.customFieldValues[field.key] !== undefined &&
        item.customFieldValues[field.key] !== '',
    )
    .slice(0, 3);

  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-heading text-title text-text line-clamp-1">
            {item.name}
          </h3>
          {pill ? <StatusPill tone={pill.tone} label={pill.label} /> : null}
        </div>

        <div className="flex items-baseline justify-between gap-2">
          <span className="font-heading text-metric text-text tabular-nums">
            {item.quantity}{' '}
            <span className="text-body-sm text-text-muted font-sans font-normal">
              {item.unit}
            </span>
          </span>
          {item.minQuantity > 0 ? (
            <span className="text-text-muted text-caption tabular-nums">
              Eşik: {item.minQuantity} {item.unit}
            </span>
          ) : null}
        </div>

        <div className="text-text-muted flex items-center gap-2 truncate text-caption">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: dotColor }}
            aria-hidden="true"
          />
          <span className="truncate">
            {locationText} · {category?.name ?? 'Genel'}
          </span>
        </div>

        {summaryFields.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {summaryFields.map((field) => (
              <Badge
                key={field.key}
                variant="secondary"
                className="text-[11px]"
              >
                {field.label}:{' '}
                {formatCustomFieldValue(
                  field,
                  item.customFieldValues[field.key],
                )}
              </Badge>
            ))}
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-2 pt-1">
          <Button
            size="sm"
            variant="secondary"
            disabled={isBusy || item.quantity <= 0}
            onClick={() => onConsume(item)}
            className="min-h-[44px] md:min-h-0"
          >
            Tüket (-1)
          </Button>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="ghost" onClick={() => onDetail(item)}>
              <Eye className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
              Detay
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onEdit(item)}>
              <Pencil className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
              Düzenle
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
