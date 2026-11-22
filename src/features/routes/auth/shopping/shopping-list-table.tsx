'use client';

import { Badge } from '@/components/core/badge';
import { Button } from '@/components/core/button';
import { Card, CardContent } from '@/components/core/card';
import { Checkbox } from '@/components/core/checkbox';
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
import { ShoppingMobileCards } from './shopping-mobile-cards';
import { ShoppingTableBulkActions, ShoppingTableState } from './shopping-table-states';
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
  isBulkUpdatingDone: boolean;
  isSyncingDoneItems?: boolean;
  statusFilter: ShoppingStatusFilter;
  priorityFilter: ShoppingPriorityFilter;
  searchQuery: string;
  onStatusChange: (value: ShoppingStatusFilter) => void;
  onPriorityChange: (value: ShoppingPriorityFilter) => void;
  onSearchChange: (value: string) => void;
  onResetFilters: () => void;
  onToggleDone: (entry: ShoppingListItem) => void;
  onBulkToggleDone: (entries: ShoppingListItem[], nextDone: boolean) => void;
  onSyncDoneToInventory?: () => void;
  onAdjustQty: (entry: ShoppingListItem, delta: number) => void;
  onEdit: (entry: ShoppingListItem) => void;
  onDelete: (id: string) => void;
  onClearDone: () => void;
  onAddClick?: () => void;
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
  isBulkUpdatingDone,
  isSyncingDoneItems = false,
  statusFilter,
  priorityFilter,
  searchQuery,
  onStatusChange,
  onPriorityChange,
  onSearchChange,
  onResetFilters,
  onToggleDone,
  onBulkToggleDone,
  onSyncDoneToInventory,
  onAdjustQty,
  onEdit,
  onDelete,
  onClearDone,
  onAddClick,
}: ShoppingListTableProps) {
  const unsyncedDoneCount = list.filter((e) => e.done && !e.itemId).length;
  const pendingFilteredCount = filteredList.filter((e) => !e.done).length;
  const allFilteredDone = filteredList.length > 0 && pendingFilteredCount === 0;
  const someFilteredDone =
    filteredList.length > 0 && pendingFilteredCount < filteredList.length;
  const headerDoneState: boolean | 'indeterminate' = allFilteredDone
    ? true
    : someFilteredDone
      ? 'indeterminate'
      : false;
  const filteredEstimatedTotal = filteredList.reduce((sum, entry) => {
    if (typeof entry.estimatedPrice === 'number' && entry.estimatedPrice > 0) {
      return sum + entry.estimatedPrice * entry.qty;
    }
    return sum;
  }, 0);

  return (
    <Card>
      <CardContent className="space-y-4 pt-4 sm:pt-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
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
          </div>
          {summary.totalCount > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="secondary"
                className="shrink-0 font-mono tabular-nums"
              >
                {summary.pendingCount} alınacak · {summary.doneCount} alındı
              </Badge>
              <ShoppingTableBulkActions
                filteredCount={filteredList.length}
                pendingFilteredCount={pendingFilteredCount}
                allFilteredDone={allFilteredDone}
                isBulkUpdatingDone={isBulkUpdatingDone}
                unsyncedDoneCount={unsyncedDoneCount}
                isSyncingDoneItems={isSyncingDoneItems}
                onBulkToggle={() =>
                  onBulkToggleDone(filteredList, !allFilteredDone)
                }
                onSyncDoneToInventory={onSyncDoneToInventory}
              />
            </div>
          ) : null}
        </div>

        {isLoading ? (
          <ShoppingTableState variant="loading" />
        ) : list.length === 0 ? (
          <ShoppingTableState variant="empty" onAddClick={onAddClick} />
        ) : filteredList.length === 0 ? (
          <ShoppingTableState
            variant="no-matches"
            onResetFilters={onResetFilters}
          />
        ) : (
          <>
            <ShoppingMobileCards
              entries={filteredList}
              itemMap={itemMap}
              categoryMap={categoryMap}
              currency={currency}
              onToggleDone={onToggleDone}
              onAdjustQty={onAdjustQty}
              onEdit={onEdit}
              onDelete={onDelete}
            />

            <div className="hidden overflow-hidden rounded-md border border-border md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={headerDoneState}
                          disabled={
                            isBulkUpdatingDone || filteredList.length === 0
                          }
                          onCheckedChange={() =>
                            onBulkToggleDone(filteredList, !allFilteredDone)
                          }
                          aria-label={
                            allFilteredDone
                              ? 'Listelenen tüm kalemlerin alındı işaretini kaldır'
                              : 'Listelenen tüm kalemleri alındı işaretle'
                          }
                        />
                        <span>Alındı</span>
                      </div>
                    </TableHead>
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
