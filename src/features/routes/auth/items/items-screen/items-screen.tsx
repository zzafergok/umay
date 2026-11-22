'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { Package } from 'lucide-react';
import { Button } from '@/components/core/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/core/empty';
import { SkeletonCard } from '@/components/core/skeleton';
import { DeleteConfirmationDialog } from '@/components/shared/delete-confirmation-dialog';
import { UmayEmptyIllustration } from '@/components/shared/umay-brand';
import { CategoryIcon } from '@/features/inventory/components';
import { resolveCategoryColorHex } from '@/features/inventory/utils';
import { ItemCard } from '@/features/routes/auth/items/item-card';
import { ItemDetailDialog } from '@/features/routes/auth/items/item-detail-dialog';
import { ItemFormDialog } from '@/features/routes/auth/items/item-form-dialog';
import { ItemsTableView } from '@/features/routes/auth/items/items-table';
import { ItemsFilterToolbar } from './items-filter-toolbar';
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
  const deleteCategory = state.deleteTarget
    ? state.categoryMap.get(state.deleteTarget.categoryId)
    : undefined;
  const deleteLocation = state.deleteTarget
    ? state.locationMap.get(state.deleteTarget.locationId)
    : undefined;

  return (
    <div className="space-y-4">
      <React.Suspense fallback={null}>
        <ItemsUrlParamSync
          onNew={state.openCreateModal}
          onSelectItem={state.openDetailModal}
        />
      </React.Suspense>

      <ItemsFilterToolbar
        search={state.search}
        onSearchChange={state.setSearch}
        viewMode={state.viewMode}
        onToggleViewMode={() =>
          state.setViewMode((v) => (v === 'grid' ? 'table' : 'grid'))
        }
        showCreateButton={!state.isLoading && state.totalCount > 0}
        onCreateClick={state.openCreateModal}
        lowStockOnly={state.lowStockOnly}
        onToggleLowStock={() => state.setLowStockOnly((v) => !v)}
        expiringOnly={state.expiringOnly}
        onToggleExpiring={() => state.setExpiringOnly((v) => !v)}
        categoryFilter={state.categoryFilter}
        onCategoryFilterChange={state.setCategoryFilter}
        locationFilter={state.locationFilter}
        onLocationFilterChange={state.setLocationFilter}
        categories={state.categories}
        locations={state.locations}
      />

      {state.isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          <SkeletonCard />
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
              {state.totalCount === 0
                ? 'Evindeki ilk ürünü ekleyerek envanterini oluştur.'
                : 'Filtreleri temizle veya arama kriterlerini değiştir.'}
            </EmptyDescription>
          </EmptyHeader>
          {state.totalCount === 0 ? (
            <EmptyContent>
              <Button variant="primary" onClick={state.openCreateModal}>
                <Package className="mr-1.5 h-4 w-4" aria-hidden="true" />
                Ürün ekle
              </Button>
            </EmptyContent>
          ) : null}
        </Empty>
      ) : state.viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {state.filtered.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              category={state.categoryMap.get(item.categoryId)}
              location={state.locationMap.get(item.locationId)}
              onAdjustStock={state.handleAdjustStock}
              onDetail={(target) => state.openDetailModal(target.id)}
              onEdit={state.openEditModal}
              onDelete={state.setDeleteTarget}
              isBusy={state.pendingItemId === item.id}
            />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:hidden">
            {state.filtered.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                category={state.categoryMap.get(item.categoryId)}
                location={state.locationMap.get(item.locationId)}
                onAdjustStock={state.handleAdjustStock}
                onDetail={(target) => state.openDetailModal(target.id)}
                onEdit={state.openEditModal}
                onDelete={state.setDeleteTarget}
                isBusy={state.pendingItemId === item.id}
              />
            ))}
          </div>
          <div className="hidden md:block">
            <ItemsTableView
              items={state.filtered}
              locationMap={state.locationMap}
              onAdjustStock={state.handleAdjustStock}
              onDetail={(target) => state.openDetailModal(target.id)}
              onEdit={state.openEditModal}
              onDelete={state.setDeleteTarget}
              pendingItemId={state.pendingItemId}
            />
          </div>
        </>
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

      <DeleteConfirmationDialog
        open={Boolean(state.deleteTarget)}
        onOpenChange={(open) => !open && state.setDeleteTarget(null)}
        entityLabel="Ürün"
        itemName={state.deleteTarget?.name ?? ''}
        itemIcon={
          deleteCategory ? (
            <CategoryIcon name={deleteCategory.icon} className="size-4" />
          ) : undefined
        }
        itemColor={
          deleteCategory?.colorToken
            ? resolveCategoryColorHex(deleteCategory.colorToken)
            : undefined
        }
        details={
          state.deleteTarget
            ? [
                {
                  label: 'Stok',
                  value: `${state.deleteTarget.quantity} ${state.deleteTarget.unit}`,
                },
                {
                  label: 'Konum',
                  value: deleteLocation?.path.join('>') ?? 'Konum yok',
                },
                { label: 'Kategori', value: deleteCategory?.name ?? 'Genel' },
              ]
            : undefined
        }
        onConfirm={state.handleConfirmDelete}
      />
    </div>
  );
}
