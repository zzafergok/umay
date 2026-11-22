'use client';

import * as React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/core/toast';
import type {
  ShoppingItemInput,
  ShoppingSortField,
} from '@/features/inventory/schemas';
import type { ShoppingListItem } from '@/features/inventory/types';
import {
  useCategoriesQuery,
  useItemsQuery,
  useLocationsQuery,
  useSettingsQuery,
  useShoppingListsQuery,
  useShoppingPaginatedQuery,
} from '@/hooks/use-inventory-hooks';
import { useServerListState } from '@/hooks/use-server-list-state';
import type { ShoppingPaginatedSummary } from '@/lib/inventory/repo';
import { inventoryService } from '@/services/inventory-service';
import type { ShoppingSuggestion } from './shopping-suggestions';
import {
  buildShoppingSuggestions,
  type ShoppingPriorityFilter,
  type ShoppingStatusFilter,
} from './shopping-utils';
import { useShoppingDelete } from './use-shopping-delete';
import { useShoppingMutations } from './use-shopping-mutations';

const EMPTY_SUMMARY: ShoppingPaginatedSummary = {
  totalCount: 0,
  pendingCount: 0,
  doneCount: 0,
  highPriorityPendingCount: 0,
  linkedPendingCount: 0,
  pendingTotal: 0,
  pricedPendingCount: 0,
  completionRate: 0,
  unsyncedDoneCount: 0,
};

const INITIAL_FILTERS: {
  status: ShoppingStatusFilter;
  priority: ShoppingPriorityFilter;
} = {
  status: 'all',
  priority: 'all',
};

export function useShoppingScreen(listId?: string) {
  const qc = useQueryClient();
  const isUnassigned = listId === 'unassigned';
  const scopedListId = listId && !isUnassigned ? listId : undefined;

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
  } = useServerListState<typeof INITIAL_FILTERS, ShoppingSortField>({
    initialFilters: INITIAL_FILTERS,
    initialSort: { sortBy: 'done', sortOrder: 'asc' },
    initialPageSize: 20,
    searchDebounceMs: 300,
  });

  const paginatedQuery = React.useMemo(
    () => ({
      ...queryParams,
      ...(listId ? { listId } : {}),
    }),
    [queryParams, listId],
  );

  const { data: lists = [], isLoading: isListsLoading } =
    useShoppingListsQuery();
  const {
    data: paginatedData,
    isLoading,
    isFetching,
    isPlaceholderData,
  } = useShoppingPaginatedQuery(paginatedQuery);
  const { data: items = [] } = useItemsQuery();
  const { data: categories = [] } = useCategoriesQuery();
  const { data: locations = [] } = useLocationsQuery();
  const { data: settings } = useSettingsQuery();

  const activeList = React.useMemo(() => {
    if (isUnassigned) {
      return {
        id: 'unassigned',
        name: 'Genel Liste',
        description: 'Önceden eklenmiş listeden bağımsız kalemler',
        createdAt: '',
        updatedAt: '',
      };
    }
    return listId ? (lists.find((l) => l.id === listId) ?? null) : null;
  }, [isUnassigned, listId, lists]);

  const list = React.useMemo(
    () => paginatedData?.items ?? [],
    [paginatedData?.items],
  );
  const summary = paginatedData?.summary ?? EMPTY_SUMMARY;
  const totalFiltered = paginatedData?.total ?? 0;
  const totalPages = paginatedData?.totalPages ?? 0;

  const [editingEntry, setEditingEntry] =
    React.useState<ShoppingListItem | null>(null);

  const invalidateShopping = React.useCallback(
    () => qc.invalidateQueries({ queryKey: ['inventory', 'shopping'] }),
    [qc],
  );
  const deleteState = useShoppingDelete(listId, invalidateShopping);
  const currency = settings?.currency ?? 'TRY';
  const itemMap = React.useMemo(
    () => new Map(items.map((i) => [i.id, i])),
    [items],
  );
  const categoryMap = React.useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories],
  );

  const suggestions = React.useMemo<ShoppingSuggestion[]>(
    () => buildShoppingSuggestions(list, items, categoryMap),
    [list, items, categoryMap],
  );

  const handleAddManual = async (
    input: ShoppingItemInput,
  ): Promise<boolean> => {
    try {
      await inventoryService.createShopping({
        ...input,
        listId: scopedListId ?? input.listId,
      });
      await invalidateShopping();
      toast.success('Ürün alışveriş listesine eklendi.');
      return true;
    } catch {
      toast.error('Ürün eklenemedi.');
      return false;
    }
  };

  const toSuggestionInput = (s: ShoppingSuggestion): ShoppingItemInput => ({
    listId: scopedListId,
    itemId: s.itemId,
    freeText: s.label,
    qty: s.suggestedQty,
    unit: s.unit,
    category: s.category,
    priority: 'high',
    source: s.source,
    done: false,
  });

  const handleAcceptSuggestion = async (s: ShoppingSuggestion) => {
    try {
      await inventoryService.createShopping(toSuggestionInput(s));
      await invalidateShopping();
      toast.success(`${s.label} listeye eklendi.`);
    } catch {
      toast.error('Öneri eklenemedi.');
    }
  };

  const handleAcceptAllSuggestions = async () => {
    if (suggestions.length === 0) return;
    try {
      await inventoryService.createShoppingBulk(
        suggestions.map(toSuggestionInput),
      );
      await invalidateShopping();
      toast.success(`${suggestions.length} öneri listeye eklendi.`);
    } catch {
      toast.error('Öneriler eklenirken hata oluştu.');
    }
  };

  const mutationState = useShoppingMutations(invalidateShopping);

  return {
    activeList,
    isListsLoading,
    list,
    totalFiltered,
    totalPages,
    page: paginatedData?.page ?? page,
    pageSize: paginatedData?.pageSize ?? pageSize,
    items,
    categories,
    locations,
    itemMap,
    categoryMap,
    suggestions,
    summary,
    currency,
    isLoading,
    isFetching,
    isPlaceholderData,
    isSearchPending,
    hasActiveFilters,
    statusFilter: filters.status,
    priorityFilter: filters.priority,
    searchQuery: searchInput,
    sortState,
    editingEntry,
    setStatusFilter: (value: ShoppingStatusFilter) =>
      setFilter('status', value),
    setPriorityFilter: (value: ShoppingPriorityFilter) =>
      setFilter('priority', value),
    setSearchQuery: setSearchInput,
    setSort,
    handlePageChange,
    handlePageSizeChange,
    resetFilters: resetAll,
    setEditingEntry,
    handleAddManual,
    handleAcceptSuggestion,
    handleAcceptAllSuggestions,
    ...mutationState,
    ...deleteState,
  };
}
