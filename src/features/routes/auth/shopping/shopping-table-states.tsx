'use client';

import {
  CheckCheck,
  PackagePlus,
  Plus,
  RotateCcw,
  ShoppingCart,
} from 'lucide-react';
import { Button } from '@/components/core/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/core/empty';
import { Skeleton } from '@/components/core/skeleton';

interface ShoppingTableBulkActionsProps {
  filteredCount: number;
  pendingFilteredCount: number;
  allFilteredDone: boolean;
  isBulkUpdatingDone: boolean;
  unsyncedDoneCount: number;
  isSyncingDoneItems: boolean;
  onBulkToggle: () => void;
  onSyncDoneToInventory?: () => void;
}

export function ShoppingTableBulkActions({
  filteredCount,
  pendingFilteredCount,
  allFilteredDone,
  isBulkUpdatingDone,
  unsyncedDoneCount,
  isSyncingDoneItems,
  onBulkToggle,
  onSyncDoneToInventory,
}: ShoppingTableBulkActionsProps) {
  return (
    <>
      {filteredCount > 0 && (
        <Button
          type="button"
          size="sm"
          variant={allFilteredDone ? 'outline' : 'secondary'}
          disabled={isBulkUpdatingDone}
          onClick={onBulkToggle}
        >
          {allFilteredDone ? (
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
          ) : (
            <CheckCheck className="mr-1.5 h-3.5 w-3.5" />
          )}
          {allFilteredDone
            ? `Alındı İşaretini Kaldır (${filteredCount})`
            : `Tümünü Alındı İşaretle (${pendingFilteredCount})`}
        </Button>
      )}
      {unsyncedDoneCount > 0 && onSyncDoneToInventory && (
        <Button
          type="button"
          size="sm"
          variant="primary"
          disabled={isSyncingDoneItems}
          onClick={onSyncDoneToInventory}
        >
          <PackagePlus className="mr-1.5 h-3.5 w-3.5" />
          {isSyncingDoneItems
            ? 'Aktarılıyor...'
            : `Alınanları Ürünlere Aktar (${unsyncedDoneCount})`}
        </Button>
      )}
    </>
  );
}

interface ShoppingTableStateProps {
  variant: 'loading' | 'empty' | 'no-matches';
  onAddClick?: () => void;
  onResetFilters?: () => void;
}

export function ShoppingTableState({
  variant,
  onAddClick,
  onResetFilters,
}: ShoppingTableStateProps) {
  if (variant === 'loading') {
    return (
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (variant === 'empty') {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ShoppingCart />
          </EmptyMedia>
          <EmptyTitle>Bu listede henüz ürün yok</EmptyTitle>
          <EmptyDescription>
            Manuel ürün ekleyebilir, fiş tarayabilir veya düşük stok önerilerini
            aktarabilirsin.
          </EmptyDescription>
        </EmptyHeader>
        {onAddClick ? (
          <EmptyContent>
            <Button size="sm" onClick={onAddClick}>
              <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
              Ürün Ekle
            </Button>
          </EmptyContent>
        ) : null}
      </Empty>
    );
  }

  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ShoppingCart />
        </EmptyMedia>
        <EmptyTitle>Filtreyle eşleşen ürün yok</EmptyTitle>
        <EmptyDescription>
          Arama metnini veya seçili durum/öncelik filtresini değiştirin.
        </EmptyDescription>
      </EmptyHeader>
      {onResetFilters ? (
        <EmptyContent>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onResetFilters}
          >
            Filtreleri Temizle
          </Button>
        </EmptyContent>
      ) : null}
    </Empty>
  );
}
