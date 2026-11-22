import type { TableSortOrder } from '@/components/core/table';
import type { ShoppingSortField } from '@/features/inventory/schemas';
import type {
  Category,
  CurrencyCode,
  Item,
  ShoppingListItem,
} from '@/features/inventory/types';
import type { ShoppingPaginatedSummary } from '@/lib/inventory/repo';
import type {
  ShoppingPriorityFilter,
  ShoppingStatusFilter,
} from './shopping-utils';

export interface ShoppingListTableProps {
  entries: ShoppingListItem[];
  summary: ShoppingPaginatedSummary;
  totalFiltered: number;
  page: number;
  pageSize: number;
  totalPages: number;
  itemMap: Map<string, Item>;
  categoryMap: Map<string, Category>;
  currency: CurrencyCode;
  isLoading: boolean;
  isFetching: boolean;
  isPlaceholderData: boolean;
  isSearchPending: boolean;
  hasActiveFilters: boolean;
  isClearingDone: boolean;
  isBulkUpdatingDone: boolean;
  isSyncingDoneItems?: boolean;
  statusFilter: ShoppingStatusFilter;
  priorityFilter: ShoppingPriorityFilter;
  searchQuery: string;
  sortBy?: ShoppingSortField;
  sortOrder?: TableSortOrder;
  onStatusChange: (value: ShoppingStatusFilter) => void;
  onPriorityChange: (value: ShoppingPriorityFilter) => void;
  onSearchChange: (value: string) => void;
  onSort: (column: ShoppingSortField, defaultOrder?: TableSortOrder) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
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
