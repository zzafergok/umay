'use client';

import * as React from 'react';
import {
  DEFAULT_PAGE_SIZE,
  toggleSortState,
  type SortOrder,
  type SortState,
} from '@/lib/pagination';
import { useDebouncedValue } from './use-debounced-value';

export interface UseServerListStateOptions<
  TFilters extends Record<string, string>,
  TSortBy extends string = string,
> {
  initialFilters: TFilters;
  initialSort?: SortState<TSortBy>;
  initialPageSize?: number;
  searchDebounceMs?: number;
}

/**
 * Shared client state for server-paginated, server-filtered, sortable, and debounced-search lists.
 * Automatically resets `page` to `1` whenever filters, search, sort, or pageSize change.
 */
export function useServerListState<
  TFilters extends Record<string, string>,
  TSortBy extends string = string,
>({
  initialFilters,
  initialSort = { sortOrder: 'desc' },
  initialPageSize = DEFAULT_PAGE_SIZE,
  searchDebounceMs = 300,
}: UseServerListStateOptions<TFilters, TSortBy>) {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(initialPageSize);
  const [searchInput, setSearchInputState] = React.useState('');
  const [filters, setFiltersState] = React.useState<TFilters>(initialFilters);
  const [sortState, setSortState] =
    React.useState<SortState<TSortBy>>(initialSort);

  const debouncedSearch = useDebouncedValue(searchInput, searchDebounceMs);

  const setSearchInput = React.useCallback((value: string) => {
    setSearchInputState(value);
    setPage(1);
  }, []);

  const setFilter = React.useCallback(
    <K extends keyof TFilters>(key: K, value: TFilters[K]) => {
      setFiltersState((prev) => ({ ...prev, [key]: value }));
      setPage(1);
    },
    [],
  );

  const setSort = React.useCallback(
    (column: TSortBy, defaultOrder: SortOrder = 'desc') => {
      setSortState((prev) => toggleSortState(prev, column, defaultOrder));
      setPage(1);
    },
    [],
  );

  const handlePageChange = React.useCallback((nextPage: number) => {
    setPage(Math.max(1, nextPage));
  }, []);

  const handlePageSizeChange = React.useCallback((nextPageSize: number) => {
    setPageSize(nextPageSize);
    setPage(1);
  }, []);

  const resetAll = React.useCallback(() => {
    setFiltersState(initialFilters);
    setSearchInputState('');
    setSortState(initialSort);
    setPage(1);
  }, [initialFilters, initialSort]);

  const hasActiveFilters = React.useMemo(() => {
    if (searchInput.trim().length > 0) return true;
    return Object.entries(filters).some(
      ([key, value]) => value !== initialFilters[key as keyof TFilters],
    );
  }, [filters, initialFilters, searchInput]);

  const queryParams = React.useMemo(
    () => ({
      page,
      pageSize,
      ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
      ...(sortState.sortBy
        ? { sortBy: sortState.sortBy, sortOrder: sortState.sortOrder }
        : {}),
      ...filters,
    }),
    [page, pageSize, debouncedSearch, sortState, filters],
  );

  return {
    page,
    pageSize,
    searchInput,
    debouncedSearch,
    filters,
    sortState,
    hasActiveFilters,
    isSearchPending: searchInput !== debouncedSearch,
    queryParams,
    setSearchInput,
    setFilter,
    setSort,
    handlePageChange,
    handlePageSizeChange,
    resetAll,
  };
}
