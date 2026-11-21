'use client';

import * as React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/core/toast';
import type {
  ShoppingItemInput,
  ShoppingItemPatchInput,
} from '@/features/inventory/schemas';
import type { ShoppingListItem } from '@/features/inventory/types';
import {
  useCategoriesQuery,
  useItemsQuery,
  usePartsQuery,
  useRecordMovementMutation,
  useSettingsQuery,
  useShoppingListsQuery,
  useShoppingQuery,
} from '@/hooks/use-inventory-hooks';
import { inventoryService } from '@/services/inventory-service';
import type { ShoppingSuggestion } from './shopping-suggestions';
import {
  buildShoppingSuggestions,
  computeShoppingSummary,
  filterAndSortShoppingList,
  type ShoppingPriorityFilter,
  type ShoppingStatusFilter,
} from './shopping-utils';
import { useShoppingDelete } from './use-shopping-delete';

export function useShoppingScreen(listId?: string) {
  const qc = useQueryClient();
  const isUnassigned = listId === 'unassigned';
  const scopedListId = listId && !isUnassigned ? listId : undefined;
  const { data: lists = [], isLoading: isListsLoading } =
    useShoppingListsQuery();
  const { data: rawList = [], isLoading } = useShoppingQuery(scopedListId);
  const { data: items = [] } = useItemsQuery();
  const { data: categories = [] } = useCategoriesQuery();
  const { data: partsData } = usePartsQuery();
  const { data: settings } = useSettingsQuery();
  const moveMutation = useRecordMovementMutation();

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
    () => (isUnassigned ? rawList.filter((item) => !item.listId) : rawList),
    [isUnassigned, rawList],
  );

  const [statusFilter, setStatusFilter] =
    React.useState<ShoppingStatusFilter>('all');
  const [priorityFilter, setPriorityFilter] =
    React.useState<ShoppingPriorityFilter>('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [editingEntry, setEditingEntry] =
    React.useState<ShoppingListItem | null>(null);

  const invalidateShopping = React.useCallback(
    () => qc.invalidateQueries({ queryKey: ['inventory', 'shopping'] }),
    [qc],
  );
  const deleteState = useShoppingDelete(list, invalidateShopping);
  const currency = settings?.currency ?? 'TRY';
  const itemMap = React.useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);
  const categoryMap = React.useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  const suggestions = React.useMemo<ShoppingSuggestion[]>(
    () =>
      buildShoppingSuggestions(
        list,
        items,
        partsData?.parts ?? [],
        itemMap,
        categoryMap,
      ),
    [list, items, partsData, itemMap, categoryMap],
  );

  const summary = React.useMemo(() => computeShoppingSummary(list), [list]);
  const filteredList = React.useMemo(
    () =>
      filterAndSortShoppingList(
        list,
        { status: statusFilter, priority: priorityFilter, search: searchQuery },
        itemMap,
        categoryMap,
      ),
    [list, statusFilter, priorityFilter, searchQuery, itemMap, categoryMap],
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

  const handleToggleDone = async (entry: ShoppingListItem) => {
    const nextDone = !entry.done;
    try {
      await inventoryService.updateShopping(entry.id, { done: nextDone });
      if (nextDone && entry.itemId) {
        await moveMutation.mutateAsync({
          itemId: entry.itemId,
          type: 'in',
          delta: entry.qty,
          reason: 'Alışverişten stok girişi',
        });
      }
      await invalidateShopping();
      toast.success(
        nextDone
          ? entry.itemId
            ? 'Alındı ve stoğa eklendi.'
            : 'Alındı olarak işaretlendi.'
          : 'Alınacaklara geri taşındı.',
      );
    } catch {
      toast.error('Durum güncellenemedi.');
    }
  };

  const handleAdjustQty = async (entry: ShoppingListItem, delta: number) => {
    const nextQty = Math.max(1, entry.qty + delta);
    if (nextQty === entry.qty) return;
    try {
      await inventoryService.updateShopping(entry.id, { qty: nextQty });
      await invalidateShopping();
    } catch {
      toast.error('Miktar güncellenemedi.');
    }
  };

  const handleSaveEdit = async (
    id: string,
    patch: ShoppingItemPatchInput,
  ): Promise<boolean> => {
    try {
      await inventoryService.updateShopping(id, patch);
      await invalidateShopping();
      toast.success('Alışveriş kalemi güncellendi.');
      return true;
    } catch {
      toast.error('Değişiklikler kaydedilemedi.');
      return false;
    }
  };

  const resetFilters = () => {
    setStatusFilter('all');
    setPriorityFilter('all');
    setSearchQuery('');
  };

  return {
    activeList,
    isListsLoading,
    list,
    filteredList,
    items,
    categories,
    itemMap,
    categoryMap,
    suggestions,
    summary,
    currency,
    isLoading,
    statusFilter,
    priorityFilter,
    searchQuery,
    editingEntry,
    setStatusFilter,
    setPriorityFilter,
    setSearchQuery,
    setEditingEntry,
    resetFilters,
    handleAddManual,
    handleAcceptSuggestion,
    handleAcceptAllSuggestions,
    handleToggleDone,
    handleAdjustQty,
    handleSaveEdit,
    ...deleteState,
  };
}
