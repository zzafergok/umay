'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/core/card';
import { ServerListToolbar } from '@/components/shared/server-list-toolbar';
import { ServerPaginationFooter } from '@/components/shared/server-pagination-footer';
import type { MovementSortField } from '@/features/inventory/schemas';
import { useMovementsPaginatedQuery } from '@/hooks/use-inventory-hooks';
import { useServerListState } from '@/hooks/use-server-list-state';
import { cn } from '@/lib/utils';
import { ActivityListView } from './components/activity-list-view';
import { ActivitySummaryGrid } from './components/activity-summary-grid';
import type {
  ActivityDateFilter,
  ActivityDirectionFilter,
  ActivitySummary,
  ActivityTypeFilter,
} from './types';

const EMPTY_SUMMARY: ActivitySummary = {
  totalCount: 0,
  inflowCount: 0,
  outflowCount: 0,
  inflowUnits: 0,
  outflowUnits: 0,
  netUnits: 0,
  uniqueItemsCount: 0,
  last24hCount: 0,
  partReplaceCount: 0,
};

const INITIAL_FILTERS: {
  direction: ActivityDirectionFilter;
  type: ActivityTypeFilter;
  dateRange: ActivityDateFilter;
} = {
  direction: 'all',
  type: 'all',
  dateRange: 'all',
};

export function ActivityScreen() {
  const {
    page,
    pageSize,
    searchInput,
    filters,
    sortState,
    hasActiveFilters,
    isSearchPending,
    queryParams,
    setSearchInput,
    setFilter,
    setSort,
    handlePageChange,
    handlePageSizeChange,
    resetAll,
  } = useServerListState<typeof INITIAL_FILTERS, MovementSortField>({
    initialFilters: INITIAL_FILTERS,
    initialSort: { sortBy: 'at', sortOrder: 'desc' },
    initialPageSize: 20,
    searchDebounceMs: 300,
  });

  const { data, isFetching, isPlaceholderData } =
    useMovementsPaginatedQuery(queryParams);

  const summary = data?.summary ?? EMPTY_SUMMARY;
  const entries = data?.items ?? [];
  const totalFiltered = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 0;

  return (
    <div className="space-y-5 md:space-y-6">
      <div className="space-y-0.5">
        <h1 className="text-heading font-heading text-text">
          Stok Hareket Günlüğü
        </h1>
        <p className="text-body-sm text-text-muted">
          Envanterdeki tüm stok giriş, çıkış, tüketim ve parça değişim kayıtları
        </p>
      </div>

      <ActivitySummaryGrid summary={summary} />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Hareket Kayıtları</CardTitle>
          <CardDescription>
            Ürün adı, işlem türü veya tarih aralığına göre sunucu üzerinden
            filtreleyin
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <ServerListToolbar
            tabs={{
              value: filters.direction,
              onChange: (value) =>
                setFilter('direction', value as ActivityDirectionFilter),
              options: [
                { value: 'all', label: `Tümü (${summary.totalCount})` },
                { value: 'inflow', label: `Giriş (${summary.inflowCount})` },
                {
                  value: 'outflow',
                  label: `Çıkış / Tüketim (${summary.outflowCount})`,
                },
              ],
            }}
            search={{
              value: searchInput,
              onChange: setSearchInput,
              placeholder: 'Ürün adı, işlem türü veya açıklama ara',
              ariaLabel: 'Stok hareketlerinde ara',
              isLoading: isSearchPending || (isFetching && isPlaceholderData),
            }}
            filters={[
              {
                key: 'type',
                value: filters.type,
                placeholder: 'Tüm İşlem Türleri',
                ariaLabel: 'İşlem türü filtresi',
                widthClass: 'w-full shrink-0 sm:w-[190px]',
                onChange: (value) =>
                  setFilter('type', value as ActivityTypeFilter),
                options: [
                  { value: 'all', label: 'Tüm İşlem Türleri' },
                  { value: 'in', label: 'Stok Girişi' },
                  { value: 'out', label: 'Stok Çıkışı' },
                  { value: 'consume', label: 'Tüketim' },
                  { value: 'adjust', label: 'Düzenleme' },
                  { value: 'replace_part', label: 'Parça Değişimi' },
                  { value: 'discard', label: 'İmha / Fire' },
                ],
              },
              {
                key: 'dateRange',
                value: filters.dateRange,
                placeholder: 'Tüm Zamanlar',
                ariaLabel: 'Tarih aralığı filtresi',
                widthClass: 'w-full shrink-0 sm:w-[160px]',
                onChange: (value) =>
                  setFilter('dateRange', value as ActivityDateFilter),
                options: [
                  { value: 'all', label: 'Tüm Zamanlar' },
                  { value: 'today', label: 'Son 24 Saat' },
                  { value: '7d', label: 'Son 7 Gün' },
                  { value: '30d', label: 'Son 30 Gün' },
                ],
              },
            ]}
            countLabel={`${totalFiltered} / ${summary.totalCount} kayıt`}
            hasActiveFilters={hasActiveFilters}
            onResetFilters={resetAll}
          />

          <div
            className={cn(
              'transition-opacity duration-150',
              isPlaceholderData && isFetching ? 'opacity-60' : 'opacity-100',
            )}
          >
            <ActivityListView
              entries={entries}
              hasAnyMovements={summary.totalCount > 0}
              sortBy={sortState.sortBy}
              sortOrder={sortState.sortOrder}
              onSort={(column) =>
                setSort(
                  column,
                  column === 'itemName' || column === 'type' ? 'asc' : 'desc',
                )
              }
              onResetFilters={resetAll}
            />
          </div>

          <ServerPaginationFooter
            page={data?.page ?? page}
            pageSize={data?.pageSize ?? pageSize}
            total={totalFiltered}
            totalPages={totalPages}
            disabled={isFetching && isPlaceholderData}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </CardContent>
      </Card>
    </div>
  );
}
