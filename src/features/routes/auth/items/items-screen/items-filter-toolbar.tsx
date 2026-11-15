'use client';

import { LayoutGrid, List, Plus, Search } from 'lucide-react';
import { Button } from '@/components/core/button';
import { Input } from '@/components/core/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/core/select';
import type { Category, Location } from '@/features/inventory/types';

interface ItemsFilterToolbarProps {
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

/** Search, view-mode switcher, quick filters, and create action bar for ItemsScreen. */
export function ItemsFilterToolbar({
  search,
  onSearchChange,
  viewMode,
  onToggleViewMode,
  onCreateClick,
  lowStockOnly,
  onToggleLowStock,
  expiringOnly,
  onToggleExpiring,
  categoryFilter,
  onCategoryFilterChange,
  locationFilter,
  onLocationFilterChange,
  categories,
  locations,
}: ItemsFilterToolbarProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative min-w-[220px] max-w-md flex-1">
          <Search
            className="text-text-muted pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Ürün, marka, barkod veya etiket ara..."
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={viewMode === 'table' ? 'primary' : 'secondary'}
            size="icon"
            aria-label="Görünüm değiştir"
            onClick={onToggleViewMode}
          >
            {viewMode === 'grid' ? (
              <List className="h-4 w-4" />
            ) : (
              <LayoutGrid className="h-4 w-4" />
            )}
          </Button>
          <Button variant="primary" onClick={onCreateClick}>
            <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Ürün ekle
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={lowStockOnly ? 'primary' : 'secondary'}
          size="sm"
          onClick={onToggleLowStock}
          className="shrink-0"
        >
          Düşük stok
        </Button>
        <Button
          variant={expiringOnly ? 'primary' : 'secondary'}
          size="sm"
          onClick={onToggleExpiring}
          className="shrink-0"
        >
          SKT yaklaşan
        </Button>
        <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
          <SelectTrigger className="text-body-sm h-9 min-h-[36px] w-full sm:w-auto sm:min-w-[185px]">
            <SelectValue placeholder="Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm kategoriler</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={locationFilter} onValueChange={onLocationFilterChange}>
          <SelectTrigger className="text-body-sm h-9 min-h-[36px] w-full sm:w-auto sm:min-w-[200px]">
            <SelectValue placeholder="Konum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm konumlar</SelectItem>
            {locations.map((l) => (
              <SelectItem key={l.id} value={l.id}>
                {l.path.join(' > ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
