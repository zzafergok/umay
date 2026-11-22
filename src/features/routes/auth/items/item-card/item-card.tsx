'use client';

import * as React from 'react';
import {
  CalendarClock,
  Eye,
  MapPin,
  Package,
  Pencil,
  Trash2,
} from 'lucide-react';
import { Badge } from '@/components/core/badge';
import { Button } from '@/components/core/button';
import { Card, CardContent, CardHeader } from '@/components/core/card';
import { StatusPill } from '@/components/core/status-pill';
import { CategoryIcon } from '@/features/inventory/components';
import type { Category, Item, Location } from '@/features/inventory/types';
import {
  formatCustomFieldValue,
  resolveCategoryColorHex,
} from '@/features/inventory/utils';
import { resolveCategoryCssVar } from '@/lib/design/tokens';
import { useUserPreferences } from '@/hooks/use-user-preferences';
import { getItemExceptionPill, getItemTypeLabel } from './item-card-utils';
import { ItemStockPanel } from './item-stock-panel';

interface ItemCardProps {
  item: Item;
  category?: Category;
  location?: Location;
  onAdjustStock: (item: Item, delta: number) => void;
  onDetail: (item: Item) => void;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
  isBusy?: boolean;
}

/** Displays a structured inventory card with category identity, live stock controls, specs, and modal actions. */
export function ItemCard({
  item,
  category,
  location,
  onAdjustStock,
  onDetail,
  onEdit,
  onDelete,
  isBusy = false,
}: ItemCardProps) {
  const { formatDate } = useUserPreferences();
  const [nowMs] = React.useState(() => Date.now());
  const pill = getItemExceptionPill(item, nowMs);
  const typeLabel = getItemTypeLabel(item.type);
  const locationText = location ? location.path.join('>') : 'Konum yok';
  const categoryColor = category?.colorToken
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

  const subtitleParts = [category?.name ?? 'Genel', item.brand].filter(Boolean);

  return (
    <Card
      size="sm"
      className="flex flex-col justify-between gap-2.5 py-3 transition-colors hover:border-border-strong"
    >
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-0">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-surface-sunken"
            style={{ color: categoryColor }}
            aria-hidden="true"
          >
            {category ? (
              <CategoryIcon name={category.icon} className="h-3.5 w-3.5" />
            ) : (
              <Package className="h-3.5 w-3.5" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <Button
              type="button"
              variant="link"
              onClick={() => onDetail(item)}
              className="h-auto max-w-full justify-start truncate p-0 text-left font-heading text-sm font-semibold leading-tight text-text hover:text-accent"
            >
              <span className="truncate">{item.name}</span>
            </Button>
            <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-text-muted">
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: categoryColor }}
                aria-hidden="true"
              />
              <span className="truncate leading-tight">
                {subtitleParts.join('·')}
              </span>
            </div>
          </div>
        </div>

        {pill ? (
          <StatusPill tone={pill.tone} label={pill.label} />
        ) : (
          <Badge
            variant="outline"
            className="shrink-0 px-1.5 py-0 text-[10px] font-normal text-text-muted"
          >
            {typeLabel}
          </Badge>
        )}
      </CardHeader>

      <CardContent className="flex flex-1 flex-col justify-between gap-2">
        <div className="space-y-2">
          <ItemStockPanel
            item={item}
            isBusy={isBusy}
            onAdjustStock={onAdjustStock}
          />

          <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-[11px] text-text-muted">
            <span className="inline-flex min-w-0 items-center gap-1">
              <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span className="truncate">{locationText}</span>
            </span>
            {item.expiresAt ? (
              <span className="inline-flex shrink-0 items-center gap-1 tabular-nums">
                <CalendarClock className="h-3 w-3" aria-hidden="true" />
                SKT: {formatDate(item.expiresAt)}
              </span>
            ) : null}
          </div>

          {summaryFields.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {summaryFields.map((field) => (
                <Badge
                  key={field.key}
                  variant="secondary"
                  className="h-auto max-w-full truncate border border-border/70 bg-surface-sunken/70 px-1.5 py-0 text-left text-[10px] font-normal leading-snug"
                >
                  <span className="text-text-muted">{field.label}:</span>
                  {''}
                  <span className="font-medium text-text">
                    {formatCustomFieldValue(
                      field,
                      item.customFieldValues[field.key],
                    )}
                  </span>
                </Badge>
              ))}
            </div>
          ) : item.notes ? (
            <p className="line-clamp-1 text-[11px] leading-snug text-text-muted">
              {item.notes}
            </p>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-1.5 border-t border-border/70 pt-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => onDetail(item)}
            className="h-8 px-2.5 text-xs md:h-7"
          >
            <Eye className="mr-1 h-3 w-3" aria-hidden="true" />
            Detay
          </Button>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => onEdit(item)}
              className="h-8 px-2 text-xs md:h-7"
            >
              <Pencil className="mr-1 h-3 w-3" aria-hidden="true" />
              Düzenle
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              className="h-8 w-8 text-danger/80 hover:bg-danger-subtle hover:text-danger md:h-7 md:w-7"
              aria-label={`${item.name} ürününü sil`}
              onClick={() => onDelete(item)}
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
