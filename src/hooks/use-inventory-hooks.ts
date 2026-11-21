'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useApiMutation, useApiQuery } from '@/hooks/use-api-query';
import {
  CACHE_STRATEGIES,
  inventoryService,
} from '@/services/inventory-service';
import type {
  Category,
  Item,
  Location,
  Part,
  ReplacementLog,
  ShoppingList,
  ShoppingListItem,
  StockMovement,
  UserSettings,
} from '@/features/inventory/types';
import type {
  PartReplaceInput,
  StockMovementInput,
} from '@/features/inventory/schemas';

export function useLocationsQuery() {
  return useApiQuery<Location[]>(
    ['inventory', 'locations'],
    '/inventory/locations',
    {},
    CACHE_STRATEGIES.LONG,
  );
}

export function useCategoriesQuery() {
  return useApiQuery<Category[]>(
    ['inventory', 'categories'],
    '/inventory/categories',
    {},
    CACHE_STRATEGIES.LONG,
  );
}

export function useItemsQuery(includeArchived = false) {
  return useApiQuery<Item[]>(
    ['inventory', 'items', { includeArchived }],
    '/inventory/items',
    { params: includeArchived ? { includeArchived: 'true' } : undefined },
    CACHE_STRATEGIES.SHORT,
  );
}

export function useItemQuery(id: string) {
  return useApiQuery<Item>(
    ['inventory', 'items', id],
    `/inventory/items/${id}`,
    {},
    CACHE_STRATEGIES.REALTIME,
  );
}

export function useMovementsQuery(itemId?: string) {
  return useApiQuery<StockMovement[]>(
    ['inventory', 'movements', itemId ?? 'all'],
    '/inventory/movements',
    { params: itemId ? { itemId } : undefined },
    CACHE_STRATEGIES.SHORT,
  );
}

export function usePartsQuery() {
  return useApiQuery<{ parts: Part[]; logs: ReplacementLog[] }>(
    ['inventory', 'parts'],
    '/inventory/parts',
    {},
    CACHE_STRATEGIES.SHORT,
  );
}

export function usePartQuery(id: string) {
  return useApiQuery<{ part: Part; logs: ReplacementLog[] }>(
    ['inventory', 'parts', id],
    `/inventory/parts/${id}`,
    {},
    CACHE_STRATEGIES.REALTIME,
  );
}

export function useShoppingListsQuery() {
  return useApiQuery<ShoppingList[]>(
    ['inventory', 'shopping-lists'],
    '/inventory/shopping-lists',
    {},
    CACHE_STRATEGIES.SHORT,
  );
}

export function useShoppingListQuery(id: string) {
  return useApiQuery<ShoppingList>(
    ['inventory', 'shopping-lists', id],
    `/inventory/shopping-lists/${id}`,
    {},
    CACHE_STRATEGIES.REALTIME,
  );
}

export function useShoppingQuery(listId?: string) {
  return useApiQuery<ShoppingListItem[]>(
    listId ? ['inventory', 'shopping', listId] : ['inventory', 'shopping'],
    '/inventory/shopping',
    { params: listId ? { listId } : undefined },
    CACHE_STRATEGIES.SHORT,
  );
}

export function useSettingsQuery() {
  return useApiQuery<UserSettings>(
    ['inventory', 'settings'],
    '/inventory/settings',
    {},
    CACHE_STRATEGIES.MEDIUM,
  );
}

export function useRecordMovementMutation() {
  const qc = useQueryClient();
  return useApiMutation(
    (input: StockMovementInput) => inventoryService.recordMovement(input),
    {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['inventory', 'items'] });
        qc.invalidateQueries({ queryKey: ['inventory', 'movements'] });
      },
    },
  );
}

export function useReplacePartMutation(partId: string) {
  const qc = useQueryClient();
  return useApiMutation(
    (input: PartReplaceInput) => inventoryService.replacePart(partId, input),
    {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['inventory', 'parts'] });
        qc.invalidateQueries({ queryKey: ['inventory', 'items'] });
        qc.invalidateQueries({ queryKey: ['inventory', 'movements'] });
      },
    },
  );
}
