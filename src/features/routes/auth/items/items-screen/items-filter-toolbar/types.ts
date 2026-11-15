import type { Category, Location } from '@/features/inventory/types';

export interface CompactFilterOption {
  value: string;
  label: string;
}

export interface ItemsFilterToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  viewMode: 'grid' | 'table';
  onToggleViewMode: () => void;
  onCreateClick: () => void;
  lowStockOnly: boolean;
  onToggleLowStock: () => void;
  expiringOnly: boolean;
  onToggleExpiring: () => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  locationFilter: string;
  onLocationFilterChange: (value: string) => void;
  categories: Category[];
  locations: Location[];
}
