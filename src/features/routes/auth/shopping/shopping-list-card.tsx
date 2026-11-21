'use client';

import { ArrowRight, Pencil, ShoppingCart, Store, Trash2 } from 'lucide-react';
import { Badge } from '@/components/core/badge';
import { Button } from '@/components/core/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/core/card';
import { Link } from '@/components/core/link';
import type {
  CurrencyCode,
  ShoppingList,
  ShoppingListItem,
} from '@/features/inventory/types';
import { cn, formatCurrency } from '@/lib/utils';
import { computeShoppingSummary } from './shopping-utils';

interface ShoppingListCardProps {
  list: ShoppingList;
  items: ShoppingListItem[];
  currency: CurrencyCode;
  href?: string;
  readOnlyMeta?: boolean;
  onEdit?: (list: ShoppingList) => void;
  onDelete?: (list: ShoppingList) => void;
}

/** Compact summary card for an individual shopping list on /shopping. */
export function ShoppingListCard({
  list,
  items,
  currency,
  href = `/shopping/${list.id}`,
  readOnlyMeta = false,
  onEdit,
  onDelete,
}: ShoppingListCardProps) {
  const summary = computeShoppingSummary(items);
  const hasItems = summary.totalCount > 0;
  const allDone = hasItems && summary.pendingCount === 0;

  return (
    <Card
      size="sm"
      className="hover:border-border-strong flex flex-col justify-between gap-2.5 py-3 transition-colors"
    >
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-0">
        <div className="flex min-w-0 flex-1 items-start gap-2.5">
          <div
            className="bg-surface-sunken text-accent flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border"
            aria-hidden="true"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate text-sm font-semibold">
              <Link
                href={href}
                variant="link"
                className="text-text h-auto justify-start p-0 text-left font-semibold hover:text-accent"
              >
                <span className="truncate">{list.name}</span>
              </Link>
            </CardTitle>
            {list.description ? (
              <p className="text-text-muted mt-0.5 line-clamp-1 text-[11px]">
                {list.description}
              </p>
            ) : null}
          </div>
        </div>
        {list.store ? (
          <Badge
            variant="outline"
            className="text-text-muted shrink-0 gap-1 px-1.5 py-0 text-[10px] font-normal"
          >
            <Store className="h-2.5 w-2.5" aria-hidden="true" />
            <span className="max-w-[90px] truncate">{list.store}</span>
          </Badge>
        ) : null}
      </CardHeader>

      <CardContent className="flex flex-1 flex-col justify-between gap-2.5">
        <div className="bg-surface-sunken/55 space-y-1.5 rounded-md border border-border/80 px-2.5 py-2">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-text-muted tabular-nums">
              {hasItems
                ? `${summary.doneCount} / ${summary.totalCount} alındı`
                : 'Henüz ürün yok'}
            </span>
            {summary.estimatedPendingTotal > 0 ? (
              <span className="text-text font-medium tabular-nums">
                {formatCurrency(summary.estimatedPendingTotal, {
                  currency,
                  locale: 'tr',
                })}
              </span>
            ) : null}
          </div>
          {hasItems ? (
            <div className="h-1 w-full overflow-hidden rounded-full bg-border/60">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-300',
                  allDone ? 'bg-success' : 'bg-accent',
                )}
                style={{ width: `${summary.completionRate}%` }}
              />
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-1.5 border-t border-border/70 pt-2">
          <Button
            asChild
            size="sm"
            variant="secondary"
            className="h-8 px-2.5 text-xs md:h-7"
          >
            <Link href={href}>
              <span>Listeyi Aç</span>
              <ArrowRight className="ml-1 h-3 w-3" aria-hidden="true" />
            </Link>
          </Button>
          {!readOnlyMeta ? (
            <div className="flex items-center gap-1">
              {onEdit ? (
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  className="h-8 w-8 md:h-7 md:w-7"
                  aria-label={`${list.name} listesini düzenle`}
                  onClick={() => onEdit(list)}
                >
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                </Button>
              ) : null}
              {onDelete ? (
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  className="text-danger/80 hover:bg-danger-subtle hover:text-danger h-8 w-8 md:h-7 md:w-7"
                  aria-label={`${list.name} listesini sil`}
                  onClick={() => onDelete(list)}
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
