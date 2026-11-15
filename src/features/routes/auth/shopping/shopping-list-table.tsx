'use client';

import { ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/core/badge';
import { Button } from '@/components/core/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/core/card';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/core/empty';
import { Skeleton } from '@/components/core/skeleton';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/core/table';
import type {
  Category,
  CurrencyCode,
  Item,
  ShoppingListItem,
} from '@/features/inventory/types';
import { formatCurrency } from '@/lib/utils';
import { ShoppingListRow } from './shopping-list-row';
import { ShoppingListToolbar } from './shopping-list-toolbar';
import type {
  ShoppingPriorityFilter,
  ShoppingStatusFilter,
  ShoppingSummary,
} from './shopping-utils';

interface ShoppingListTableProps {
  list: ShoppingListItem[];
  filteredList: ShoppingListItem[];
  summary: ShoppingSummary;
  itemMap: Map<string, Item>;
  categoryMap: Map<string, Category>;
  currency: CurrencyCode;
  isLoading: boolean;
  isClearingDone: boolean;
  statusFilter: ShoppingStatusFilter;
  priorityFilter: ShoppingPriorityFilter;
  searchQuery: string;
  onStatusChange: (value: ShoppingStatusFilter) => void;
  onPriorityChange: (value: ShoppingPriorityFilter) => void;
  onSearchChange: (value: string) => void;
  onResetFilters: () => void;
  onToggleDone: (entry: ShoppingListItem) => void;
  onAdjustQty: (entry: ShoppingListItem, delta: number) => void;
  onEdit: (entry: ShoppingListItem) => void;
  onDelete: (id: string) => void;
  onClearDone: () => void;
}

export function ShoppingListTable({
  list,
  filteredList,
  summary,
  itemMap,
  categoryMap,
  currency,
  isLoading,
  isClearingDone,
  statusFilter,
  priorityFilter,
  searchQuery,
  onStatusChange,
  onPriorityChange,
  onSearchChange,
  onResetFilters,
  onToggleDone,
  onAdjustQty,
  onEdit,
  onDelete,
  onClearDone,
}: ShoppingListTableProps) {
  const filteredEstimatedTotal = filteredList.reduce((sum, entry) => {
    if (typeof entry.estimatedPrice === 'number' && entry.estimatedPrice > 0) {
      return sum + entry.estimatedPrice * entry.qty;
    }
    return sum;
  }, 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-1">
            <CardTitle className="font-display text-base">
              Alışveriş Listesi
            </CardTitle>
            <CardDescription className="text-caption">
              Kalemleri işaretleyin, miktarları doğrudan güncelleyin veya detay
              düzenleyin.
            </CardDescription>
          </div>
          {summary.totalCount > 0 && (
            <Badge variant="secondary" className="font-mono tabular-nums">
              {summary.pendingCount} alınacak · {summary.doneCount} alındı
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <ShoppingListToolbar
          summary={summary}
          statusFilter={statusFilter}
          priorityFilter={priorityFilter}
          searchQuery={searchQuery}
          isClearingDone={isClearingDone}
          onStatusChange={onStatusChange}
          onPriorityChange={onPriorityChange}
          onSearchChange={onSearchChange}
          onClearDone={onClearDone}
        />

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : list.length === 0 ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ShoppingCart />
              </EmptyMedia>
              <EmptyTitle>Alışveriş listen henüz boş</EmptyTitle>
              <EmptyDescription>
                Yukarıdaki formdan detaylı ürün ekleyebilir, fiş tarayabilir
                veya düşük stok önerilerini listene aktarabilirsin.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : filteredList.length === 0 ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ShoppingCart />
              </EmptyMedia>
              <EmptyTitle>Filtreyle eşleşen ürün yok</EmptyTitle>
              <EmptyDescription>
                Arama metnini veya seçili durum/öncelik filtresini değiştirin.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onResetFilters}
              >
                Filtreleri Temizle
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <>
            <div className="overflow-hidden rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-11">Alındı</TableHead>
                    <TableHead>Ürün & Detaylar</TableHead>
                    <TableHead>Öncelik</TableHead>
                    <TableHead>Miktar</TableHead>
                    <TableHead className="text-right">Tahmini Tutar</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredList.map((entry) => (
                    <ShoppingListRow
                      key={entry.id}
                      entry={entry}
                      itemMap={itemMap}
                      categoryMap={categoryMap}
                      currency={currency}
                      onToggleDone={onToggleDone}
                      onAdjustQty={onAdjustQty}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-caption text-text-muted">
              <span className="font-mono tabular-nums">
                Gösterilen: {filteredList.length} / {list.length} kalem
              </span>
              {filteredEstimatedTotal > 0 && (
                <span className="font-mono tabular-nums text-text">
                  Listelenen tahmini tutar:{' '}
                  {formatCurrency(filteredEstimatedTotal, {
                    currency,
                    locale: 'tr',
                  })}
                </span>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
