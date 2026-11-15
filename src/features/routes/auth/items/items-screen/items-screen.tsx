'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
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
import { UmayEmptyIllustration } from '@/components/shared/umay-brand';
import { ItemCard } from '@/features/routes/auth/items/item-card';
import { ItemDetailDialog } from '@/features/routes/auth/items/item-detail-dialog';
import { ItemFormDialog } from '@/features/routes/auth/items/item-form-dialog';
import { ItemsTableView } from '@/features/routes/auth/items/items-table';
import { useItemsScreen } from './use-items-screen';

function ItemsUrlParamSync({
  onNew,
  onSelectItem,
}: {
  onNew: () => void;
  onSelectItem: (id: string) => void;
}) {
  const searchParams = useSearchParams();
  const isNew = searchParams.get('new') === '1';
  const itemId = searchParams.get('item');

  React.useEffect(() => {
    if (!isNew && !itemId) return;
    const frameId = window.requestAnimationFrame(() => {
      if (isNew) {
        onNew();
      } else if (itemId) {
        onSelectItem(itemId);
      }
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [isNew, itemId, onNew, onSelectItem]);

  return null;
}

export function ItemsScreen() {
  const state = useItemsScreen();

  return (
    <div className="space-y-4">
      <React.Suspense fallback={null}>
        <ItemsUrlParamSync
          onNew={state.openCreateModal}
          onSelectItem={state.openDetailModal}
        />
      </React.Suspense>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative min-w-[220px] max-w-md flex-1">
          <Search
            className="text-text-muted pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            value={state.search}
            onChange={(e) => state.setSearch(e.target.value)}
            placeholder="Ürün, marka, barkod veya etiket ara..."
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={state.viewMode === 'table' ? 'primary' : 'secondary'}
            size="icon"
            aria-label="Görünüm değiştir"
            onClick={() =>
              state.setViewMode((v) => (v === 'grid' ? 'table' : 'grid'))
            }
          >
            {state.viewMode === 'grid' ? (
              <List className="h-4 w-4" />
            ) : (
              <LayoutGrid className="h-4 w-4" />
            )}
          </Button>
          <Button variant="primary" onClick={state.openCreateModal}>
            <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Ürün ekle
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <Button
          variant={state.lowStockOnly ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => state.setLowStockOnly((v) => !v)}
          className="shrink-0"
        >
          Düşük stok
        </Button>
        <Button
          variant={state.expiringOnly ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => state.setExpiringOnly((v) => !v)}
          className="shrink-0"
        >
          SKT yaklaşan
        </Button>
        <Select
          value={state.categoryFilter}
          onValueChange={state.setCategoryFilter}
        >
          <SelectTrigger className="text-body-sm h-9 min-h-[36px] w-[175px] shrink-0">
            <SelectValue placeholder="Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm kategoriler</SelectItem>
            {state.categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={state.locationFilter}
          onValueChange={state.setLocationFilter}
        >
          <SelectTrigger className="text-body-sm h-9 min-h-[36px] w-[190px] shrink-0">
            <SelectValue placeholder="Konum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm konumlar</SelectItem>
            {state.locations.map((l) => (
              <SelectItem key={l.id} value={l.id}>
                {l.path.join(' > ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {state.isLoading ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : state.filtered.length === 0 ? (
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
            <Button variant="primary" onClick={state.openCreateModal}>
              <Package className="mr-1.5 h-4 w-4" aria-hidden="true" />
              Ürün ekle
            </Button>
          </EmptyContent>
        </Empty>
      ) : state.viewMode === 'grid' ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {state.filtered.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              category={state.categoryMap.get(item.categoryId)}
              location={state.locationMap.get(item.locationId)}
              onConsume={state.handleConsume}
              onDetail={(target) => state.openDetailModal(target.id)}
              onEdit={state.openEditModal}
              isBusy={state.isMoving}
            />
          ))}
        </div>
      ) : (
        <ItemsTableView
          items={state.filtered}
          locationMap={state.locationMap}
          onConsume={state.handleConsume}
          onDetail={(target) => state.openDetailModal(target.id)}
          onEdit={state.openEditModal}
          isBusy={state.isMoving}
        />
      )}

      <ItemDetailDialog
        open={Boolean(state.detailItemId)}
        onOpenChange={state.handleDetailOpenChange}
        itemId={state.detailItemId}
        categories={state.categories}
        locations={state.locations}
        onEdit={state.openEditModal}
      />

      <ItemFormDialog
        open={state.formDialogOpen}
        onOpenChange={state.handleFormOpenChange}
        categories={state.categories}
        locations={state.locations}
        editItem={state.editingItem}
      />
    </div>
  );
}
