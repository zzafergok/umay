'use client';

import * as React from 'react';
import { LayoutGrid, List, Package, Plus, Search } from 'lucide-react';
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
import { SkeletonCard } from '@/components/core/skeleton';
import { toast } from '@/components/core/toast';
import { UmayEmptyIllustration } from '@/components/shared/umay-brand';
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
  const [expiringOnly, setExpiringOnly] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<'grid' | 'table'>('grid');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [nowMs] = React.useState(() => Date.now());

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('new') !== '1') return;
    const frameId = window.requestAnimationFrame(() => setDialogOpen(true));
    return () => window.cancelAnimationFrame(frameId);
  }, []);

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
    const soonThreshold = nowMs + 30 * 24 * 60 * 60 * 1000;
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
      if (expiringOnly) {
        const expMs = item.expiresAt ? Date.parse(item.expiresAt) : NaN;
        if (Number.isNaN(expMs) || expMs > soonThreshold) {
          return false;
        }
      }
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        (item.brand?.toLowerCase().includes(q) ?? false) ||
        (item.barcode?.toLowerCase().includes(q) ?? false) ||
        item.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [
    items,
    search,
    categoryFilter,
    locationFilter,
    lowStockOnly,
    expiringOnly,
    nowMs,
  ]);

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
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative min-w-[220px] max-w-md flex-1">
          <Search
            className="text-text-muted pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ürün, marka, barkod veya etiket ara..."
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={viewMode === 'table' ? 'primary' : 'secondary'}
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
          <Button variant="primary" onClick={() => setDialogOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Ürün ekle
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <Button
          variant={lowStockOnly ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setLowStockOnly((v) => !v)}
          className="shrink-0"
        >
          Düşük stok
        </Button>
        <Button
          variant={expiringOnly ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setExpiringOnly((v) => !v)}
          className="shrink-0"
        >
          SKT yaklaşan
        </Button>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="text-body-sm h-9 min-h-[36px] w-[175px] shrink-0">
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

        <Select value={locationFilter} onValueChange={setLocationFilter}>
          <SelectTrigger className="text-body-sm h-9 min-h-[36px] w-[190px] shrink-0">
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

      {isLoading ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : filtered.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia>
              <UmayEmptyIllustration />
            </EmptyMedia>
            <EmptyTitle>Ürün bulunamadı</EmptyTitle>
            <EmptyDescription>
              Filtreleri temizle veya evindeki ilk ürünü ekle.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="primary" onClick={() => setDialogOpen(true)}>
              <Package className="mr-1.5 h-4 w-4" aria-hidden="true" />
              Ürün ekle
            </Button>
          </EmptyContent>
        </Empty>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
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
