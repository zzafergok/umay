'use client';

import * as React from 'react';
import { Boxes, LayoutGrid, List, Plus, Search } from 'lucide-react';
import { Button } from '@/components/core/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/core/empty';
import { Input } from '@/components/core/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/core/select';
import { toast } from '@/components/core/toast';
import type { Item } from '@/features/inventory/types';
import {
  useCategoriesQuery,
  useItemsQuery,
  useLocationsQuery,
  useRecordMovementMutation,
} from '@/hooks/use-inventory-hooks';
import { ItemCard } from './item-card';
import { ItemFormDialog } from './item-form-dialog';
import { ItemsTableView } from './items-table';

export function ItemsScreen() {
  const { data: items = [], isLoading } = useItemsQuery();
  const { data: categories = [] } = useCategoriesQuery();
  const { data: locations = [] } = useLocationsQuery();
  const moveMutation = useRecordMovementMutation();

  const [search, setSearch] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('all');
  const [locationFilter, setLocationFilter] = React.useState('all');
  const [lowStockOnly, setLowStockOnly] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<'grid' | 'table'>('grid');
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const categoryMap = React.useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories],
  );
  const locationMap = React.useMemo(
    () => new Map(locations.map((l) => [l.id, l])),
    [locations],
  );

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      if (categoryFilter !== 'all' && item.categoryId !== categoryFilter) {
        return false;
      }
      if (locationFilter !== 'all' && item.locationId !== locationFilter) {
        return false;
      }
      if (lowStockOnly && item.quantity > item.minQuantity) {
        return false;
      }
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        (item.brand?.toLowerCase().includes(q) ?? false) ||
        (item.barcode?.toLowerCase().includes(q) ?? false) ||
        item.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [items, search, categoryFilter, locationFilter, lowStockOnly]);

  const handleConsume = async (item: Item) => {
    try {
      await moveMutation.mutateAsync({
        itemId: item.id,
        type: 'consume',
        delta: -1,
        reason: 'Hızlı tüketim',
      });
      toast.success(`${item.name} (-1 ${item.unit})`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Stok güncellenemedi.');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative min-w-[220px] flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ürün, marka, barkod veya etiket ara..."
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={lowStockOnly ? 'default' : 'outline'}
            size="sm"
            onClick={() => setLowStockOnly((v) => !v)}
          >
            Düşük Stok
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Görünüm değiştir"
            onClick={() =>
              setViewMode((v) => (v === 'grid' ? 'table' : 'grid'))
            }
          >
            {viewMode === 'grid' ? (
              <List className="h-4 w-4" />
            ) : (
              <LayoutGrid className="h-4 w-4" />
            )}
          </Button>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Ürün Ekle
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Kategoriler</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={locationFilter} onValueChange={setLocationFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Konum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Konumlar</SelectItem>
            {locations.map((l) => (
              <SelectItem key={l.id} value={l.id}>
                {l.path.join(' > ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Ürünler yükleniyor...</p>
      ) : filtered.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Boxes />
            </EmptyMedia>
            <EmptyTitle>Ürün bulunamadı</EmptyTitle>
            <EmptyDescription>
              Filtreleri temizle veya evindeki ilk ürünü ekle.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button size="sm" onClick={() => setDialogOpen(true)}>
              Ürün Ekle
            </Button>
          </EmptyContent>
        </Empty>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              category={categoryMap.get(item.categoryId)}
              location={locationMap.get(item.locationId)}
              onConsume={handleConsume}
              isBusy={moveMutation.isPending}
            />
          ))}
        </div>
      ) : (
        <ItemsTableView
          items={filtered}
          locationMap={locationMap}
          onConsume={handleConsume}
          isBusy={moveMutation.isPending}
        />
      )}

      <ItemFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        categories={categories}
        locations={locations}
      />
    </div>
  );
}
