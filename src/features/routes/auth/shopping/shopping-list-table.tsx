'use client';

import { Trash2 } from 'lucide-react';
import { Button } from '@/components/core/button';
import { Card, CardContent } from '@/components/core/card';
import { ServerPaginationFooter } from '@/components/shared/server-pagination-footer';
import { ServerListToolbar } from '@/components/shared/server-list-toolbar';
import { cn, formatCurrency } from '@/lib/utils';
import { ShoppingDesktopTable } from './shopping-desktop-table';
import { ShoppingMobileCards } from './shopping-mobile-cards';
import {
  ShoppingTableBulkActions,
  ShoppingTableState,
} from './shopping-table-states';
import type { ShoppingListTableProps } from './shopping-table-types';
import type {
  ShoppingPriorityFilter,
  ShoppingStatusFilter,
} from './shopping-utils';

export function ShoppingListTable({
  entries,
  summary,
  totalFiltered,
  page,
  pageSize,
  totalPages,
  itemMap,
  categoryMap,
  currency,
  isLoading,
  isFetching,
  isPlaceholderData,
  isSearchPending,
  hasActiveFilters,
  isClearingDone,
  isBulkUpdatingDone,
  isSyncingDoneItems = false,
  statusFilter,
  priorityFilter,
  searchQuery,
  sortBy,
  sortOrder,
  onStatusChange,
  onPriorityChange,
  onSearchChange,
  onSort,
  onPageChange,
  onPageSizeChange,
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
  const pendingPageCount = entries.filter((e) => !e.done).length;
  const allPageDone = entries.length > 0 && pendingPageCount === 0;
  const somePageDone = entries.length > 0 && pendingPageCount < entries.length;
  const headerDoneState: boolean | 'indeterminate' = allPageDone
    ? true
    : somePageDone
      ? 'indeterminate'
      : false;
  const pageTotal = entries.reduce((sum, entry) => {
    if (typeof entry.price === 'number') {
      return sum + entry.price * entry.qty;
    }
    return sum;
  }, 0);

  return (
    <Card>
      <CardContent className="space-y-4 pt-4 sm:pt-5">
        <ServerListToolbar
          tabs={{
            value: statusFilter,
            onChange: (value) => onStatusChange(value as ShoppingStatusFilter),
            options: [
              { value: 'all', label: `Tümü (${summary.totalCount})` },
              { value: 'pending', label: `Alınacak (${summary.pendingCount})` },
              { value: 'done', label: `Alınan (${summary.doneCount})` },
            ],
          }}
          search={{
            value: searchQuery,
            onChange: onSearchChange,
            placeholder: 'Ürün, kategori veya mağaza ara',
            ariaLabel: 'Alışveriş listesinde ara',
            isLoading: isSearchPending || (isFetching && isPlaceholderData),
          }}
          filters={[
            {
              key: 'priority',
              value: priorityFilter,
              placeholder: 'Tüm Öncelikler',
              ariaLabel: 'Öncelik filtresi',
              widthClass: 'w-full shrink-0 sm:w-[180px]',
              onChange: (value) =>
                onPriorityChange(value as ShoppingPriorityFilter),
              options: [
                { value: 'all', label: 'Tüm Öncelikler' },
                { value: 'high', label: 'Acil' },
                { value: 'normal', label: 'Normal' },
                { value: 'low', label: 'Düşük' },
              ],
            },
          ]}
          countLabel={
            summary.totalCount > 0
              ? `${totalFiltered} / ${summary.totalCount} kalem`
              : undefined
          }
          hasActiveFilters={hasActiveFilters}
          onResetFilters={onResetFilters}
          actions={
            summary.totalCount > 0 ? (
              <>
                <ShoppingTableBulkActions
                  filteredCount={entries.length}
                  pendingFilteredCount={pendingPageCount}
                  allFilteredDone={allPageDone}
                  isBulkUpdatingDone={isBulkUpdatingDone}
                  unsyncedDoneCount={summary.unsyncedDoneCount}
                  isSyncingDoneItems={isSyncingDoneItems}
                  onBulkToggle={() => onBulkToggleDone(entries, !allPageDone)}
                  onSyncDoneToInventory={onSyncDoneToInventory}
                />
                {summary.doneCount > 0 ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isClearingDone}
                    onClick={onClearDone}
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                    Alınanları Temizle
                  </Button>
                ) : null}
              </>
            ) : undefined
          }
        />

        {isLoading ? (
          <ShoppingTableState variant="loading" />
        ) : summary.totalCount === 0 ? (
          <ShoppingTableState variant="empty" onAddClick={onAddClick} />
        ) : entries.length === 0 ? (
          <ShoppingTableState
            variant="no-matches"
            onResetFilters={onResetFilters}
          />
        ) : (
          <div
            className={cn(
              'space-y-4 transition-opacity duration-150',
              isPlaceholderData && isFetching ? 'opacity-60' : 'opacity-100',
            )}
          >
            <ShoppingMobileCards
              entries={entries}
              itemMap={itemMap}
              categoryMap={categoryMap}
              currency={currency}
              onToggleDone={onToggleDone}
              onAdjustQty={onAdjustQty}
              onEdit={onEdit}
              onDelete={onDelete}
            />

            <ShoppingDesktopTable
              entries={entries}
              itemMap={itemMap}
              categoryMap={categoryMap}
              currency={currency}
              headerDoneState={headerDoneState}
              allPageDone={allPageDone}
              isBulkUpdatingDone={isBulkUpdatingDone}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={onSort}
              onBulkToggleDone={onBulkToggleDone}
              onToggleDone={onToggleDone}
              onAdjustQty={onAdjustQty}
              onEdit={onEdit}
              onDelete={onDelete}
            />

            {entries.some((entry) => typeof entry.price === 'number') ? (
              <div className="flex justify-end text-caption text-text-muted">
                <span className="font-mono tabular-nums text-text">
                  Sayfadaki tutar:{' '}
                  {formatCurrency(pageTotal, {
                    currency,
                    locale: 'tr',
                  })}
                </span>
              </div>
            ) : null}

            <ServerPaginationFooter
              page={page}
              pageSize={pageSize}
              total={totalFiltered}
              totalPages={totalPages}
              disabled={isFetching && isPlaceholderData}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
