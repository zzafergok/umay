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
  const [nowMs] = React.useState(() => Date.now());
  const pill = getItemExceptionPill(item, nowMs);
  const typeLabel = getItemTypeLabel(item.type);
  const locationText = location ? location.path.join(' > ') : 'Konum yok';
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
    <Card className="hover:border-border-strong flex flex-col justify-between transition-colors">
      <CardHeader className="flex flex-wrap items-start justify-between gap-2.5 pb-0">
        <div className="flex min-w-0 flex-1 items-start gap-2.5">
          <div
            className="bg-surface-sunken flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border"
            style={{ color: categoryColor }}
            aria-hidden="true"
          >
            {category ? (
              <CategoryIcon name={category.icon} className="h-4 w-4" />
            ) : (
              <Package className="h-4 w-4" />
            )}
          </div>
          <div className="min-w-0 flex-1 space-y-0.5">
            <Button
              type="button"
              variant="link"
              onClick={() => onDetail(item)}
              className="font-heading text-title text-text h-auto max-w-full justify-start whitespace-normal break-words p-0 text-left leading-snug hover:text-accent"
            >
              <span>{item.name}</span>
            </Button>
            <div className="text-text-muted flex items-start gap-1.5 text-caption">
              <span
                className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: categoryColor }}
                aria-hidden="true"
              />
              <span className="break-words leading-snug">
                {subtitleParts.join(' · ')}
              </span>
            </div>
          </div>
        </div>

        {pill ? (
          <StatusPill tone={pill.tone} label={pill.label} />
        ) : (
          <Badge
            variant="outline"
            className="text-text-muted shrink-0 text-[11px] font-normal"
          >
            {typeLabel}
          </Badge>
        )}
      </CardHeader>

      <CardContent className="flex flex-1 flex-col justify-between gap-3">
        <div className="space-y-3">
          <ItemStockPanel
            item={item}
            isBusy={isBusy}
            onAdjustStock={onAdjustStock}
          />

          <div className="text-text-muted flex flex-wrap items-start justify-between gap-x-3 gap-y-1.5 text-caption">
            <span className="inline-flex min-w-0 items-start gap-1.5">
              <MapPin
                className="mt-0.5 h-3.5 w-3.5 shrink-0"
                aria-hidden="true"
              />
              <span className="break-words leading-snug">{locationText}</span>
            </span>
            {item.expiresAt ? (
              <span className="inline-flex shrink-0 items-center gap-1 tabular-nums">
                <CalendarClock className="h-3 w-3" aria-hidden="true" />
                SKT: {new Date(item.expiresAt).toLocaleDateString('tr-TR')}
              </span>
            ) : null}
          </div>

          {summaryFields.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {summaryFields.map((field) => (
                <Badge
                  key={field.key}
                  variant="secondary"
                  className="bg-surface-sunken/70 h-auto max-w-full whitespace-normal break-words border border-border/70 px-2 py-0.5 text-left text-[11px] font-normal leading-snug"
                >
                  <span className="text-text-muted">{field.label}:</span>{' '}
                  <span className="text-text font-medium">
                    {formatCustomFieldValue(
                      field,
                      item.customFieldValues[field.key],
                    )}
                  </span>
                </Badge>
              ))}
            </div>
          ) : item.notes ? (
            <p className="text-text-muted break-words text-xs leading-relaxed">
              {item.notes}
            </p>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border pt-2.5">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => onDetail(item)}
          >
            <Eye className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
            Detay
          </Button>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => onEdit(item)}
            >
              <Pencil className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
              Düzenle
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              aria-label={`${item.name} ürününü sil`}
              onClick={() => onDelete(item)}
            >
              <Trash2
                className="text-text-muted hover:text-danger h-3.5 w-3.5"
                aria-hidden="true"
              />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
