'use client';

import { Plus, Sparkles } from 'lucide-react';
import { Badge } from '@/components/core/badge';
import { Button } from '@/components/core/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/core/card';
import { formatShoppingUnit } from './shopping-utils';

export interface ShoppingSuggestion {
  key: string;
  itemId: string | null;
  label: string;
  suggestedQty: number;
  unit: string;
  category?: string;
  reason?: string;
  source: 'auto_low_stock' | 'auto_part_due';
}

export function ShoppingSuggestionsCard({
  suggestions,
  onAccept,
  onAcceptAll,
  embedded = false,
}: {
  suggestions: ShoppingSuggestion[];
  onAccept: (s: ShoppingSuggestion) => void;
  onAcceptAll?: () => void;
  embedded?: boolean;
}) {
  if (suggestions.length === 0) return null;

  const listNode = (
    <div className={embedded ? 'grid grid-cols-1 gap-2' : 'grid gap-2 md:grid-cols-2'}>
      {suggestions.map((s) => (
        <div
          key={s.key}
          className="bg-surface-sunken/40 flex flex-wrap items-center justify-between gap-2.5 rounded-sm border border-border p-2.5 sm:p-3"
        >
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <p className="text-text text-sm font-medium">{s.label}</p>
              <Badge
                variant={
                  s.source === 'auto_part_due' ? 'warning' : 'secondary'
                }
                size="sm"
              >
                {s.source === 'auto_part_due' ? 'Parça Vadesi' : 'Düşük Stok'}
              </Badge>
            </div>
            <p className="text-text-muted text-xs tabular-nums">
              Önerilen: {s.suggestedQty} {formatShoppingUnit(s.unit)}
              {s.reason ? ` · ${s.reason}` : ''}
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="w-full shrink-0 sm:w-auto"
            onClick={() => onAccept(s)}
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            Listeye Ekle
          </Button>
        </div>
      ))}
    </div>
  );

  if (embedded) {
    return (
      <div className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-text-muted text-xs">
            Düşük stoktaki ürünler ve değişim vakti yaklaşan parçalar için
            otomatik öneriler.
          </p>
          {suggestions.length > 1 && onAcceptAll && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="w-full shrink-0 sm:w-auto"
              onClick={onAcceptAll}
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              Tümünü Ekle
            </Button>
          )}
        </div>
        {listNode}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 space-y-0 pb-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-1">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="text-umay-blue h-4 w-4 shrink-0" />
            <span>Akıllı Öneriler ({suggestions.length})</span>
          </CardTitle>
          <CardDescription className="text-caption">
            Düşük stoktaki ürünler ve değişim vakti yaklaşan parçalar için
            otomatik öneriler.
          </CardDescription>
        </div>
        {suggestions.length > 1 && onAcceptAll && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="w-full shrink-0 sm:w-auto"
            onClick={onAcceptAll}
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            Tümünü Ekle
          </Button>
        )}
      </CardHeader>
      <CardContent>{listNode}</CardContent>
    </Card>
  );
}
