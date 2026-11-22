'use client';

import * as React from 'react';
import { DEFAULT_PAGE_SIZE } from '@/lib/pagination';
import { useDebouncedValue } from './use-debounced-value';

export interface UseServerListStateOptions<
  TFilters extends Record<string, string>,
> {
  initialFilters: TFilters;
  initialPageSize?: number;
  searchDebounceMs?: number;
}

/**
 * Shared client state for server-paginated, server-filtered, and debounced-search lists.
 * Automatically resets `page` to `1` whenever filters, search, or pageSize change.
 */
export function useServerListState<TFilters extends Record<string, string>>({
  initialFilters,
  initialPageSize = DEFAULT_PAGE_SIZE,
  searchDebounceMs = 300,
}: UseServerListStateOptions<TFilters>) {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(initialPageSize);
  const [searchInput, setSearchInputState] = React.useState('');
  const [filters, setFiltersState] = React.useState<TFilters>(initialFilters);

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
    setPage(1);
  }, [initialFilters]);

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
      ...filters,
    }),
    [page, pageSize, debouncedSearch, filters],
  );

  return {
    page,
    pageSize,
    searchInput,
    debouncedSearch,
    filters,
    hasActiveFilters,
    isSearchPending: searchInput !== debouncedSearch,
    queryParams,
    setSearchInput,
    setFilter,
    handlePageChange,
    handlePageSizeChange,
    resetAll,
  };
}
