'use client';

import { Pencil, QrCode, Trash2 } from 'lucide-react';
import { Badge } from '@/components/core/badge';
import { Button } from '@/components/core/button';
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/core/dialog';
import { SkeletonCard } from '@/components/core/skeleton';
import { StatusPill } from '@/components/core/status-pill';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/core/tabs';
import { DeleteConfirmationDialog } from '@/components/shared/delete-confirmation-dialog';
import { CategoryIcon } from '@/features/inventory/components';
import type { Category, Item, Location } from '@/features/inventory/types';
import { ItemFormDialog } from '@/features/routes/auth/items/item-form-dialog';
import { ItemQrDialog } from '@/features/routes/auth/items/item-qr-dialog';
import { ItemDetailOverview } from './item-detail-overview';
import { ItemMovementsCard } from './item-movements-card';
import { useItemDetailDialog } from './use-item-detail-dialog';

interface ItemDetailBodyProps {
  itemId: string;
  onOpenChange: (open: boolean) => void;
  categories?: Category[];
  locations?: Location[];
  onEdit?: (item: Item) => void;
}

/** Renders item detail tabs, actions, QR dialog, inline edit fallback, and delete confirmation inside ItemDetailDialog. */
export function ItemDetailBody({
  itemId,
  onOpenChange,
  categories: categoriesProp,
  locations: locationsProp,
  onEdit,
}: ItemDetailBodyProps) {
  const state = useItemDetailDialog({
    itemId,
    onOpenChange,
    categories: categoriesProp,
    locations: locationsProp,
    onEdit,
  });

  if (state.isLoading) {
    return (
      <>
        <DialogHeader>
          <DialogTitle>Ürün Detayı</DialogTitle>
          <DialogDescription>Ürün bilgileri yükleniyor...</DialogDescription>
        </DialogHeader>
        <SkeletonCard />
      </>
    );
  }

  const { item, category, location, categoryHex, movements } = state;
  if (!item) {
    return (
      <>
        <DialogHeader>
          <DialogTitle>Ürün Bulunamadı</DialogTitle>
          <DialogDescription>
            Bu ürün silinmiş veya erişilemiyor olabilir.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Kapat
          </Button>
        </div>
      </>
    );
  }

  const stockTone =
    item.quantity <= 0
      ? 'out_of_stock'
      : item.quantity <= item.minQuantity
        ? 'low_stock'
        : 'ok';
  const stockLabel =
    item.quantity <= 0
      ? 'Tükendi'
      : item.quantity <= item.minQuantity
        ? 'Düşük Stok'
        : 'Stokta';

  return (
    <>
      <DialogHeader className="pr-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            {category ? (
              <span
                className="bg-surface-sunken mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border"
                style={categoryHex ? { color: categoryHex } : undefined}
              >
                <CategoryIcon name={category.icon} className="h-4 w-4" />
              </span>
            ) : null}
            <div className="space-y-0.5">
              <DialogTitle>{item.name}</DialogTitle>
              <DialogDescription>
                {location?.path.join(' > ') ?? 'Konum yok'} •{' '}
                {category?.name ?? 'Genel'}
              </DialogDescription>
            </div>
          </div>
          <StatusPill tone={stockTone} label={stockLabel} />
        </div>
      </DialogHeader>

      <Tabs defaultValue="overview" className="mt-1">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 p-1">
          <TabsTrigger
            value="overview"
            className="min-w-0 truncate px-2 py-1.5 text-xs"
          >
            Genel &amp; Özellikler
          </TabsTrigger>
          <TabsTrigger
            value="movements"
            className="min-w-0 gap-1.5 px-2 py-1.5 text-xs"
          >
            <span className="truncate">Stok Hareketleri</span>
            <Badge
              variant="secondary"
              className="shrink-0 px-1.5 py-0 text-[10px]"
            >
              {movements.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="pt-2">
          <ItemDetailOverview
            item={item}
            category={category}
            isAdjusting={state.isAdjusting}
            onAdjustStock={state.adjustStock}
          />
        </TabsContent>

        <TabsContent value="movements" className="pt-2">
          <ItemMovementsCard movements={movements} unit={item.unit} />
        </TabsContent>
      </Tabs>

      <div className="bg-surface-raised/95 sticky bottom-0 z-10 mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-2.5 backdrop-blur-md sm:static sm:bg-transparent sm:pt-3 sm:backdrop-blur-none">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => state.setQrOpen(true)}
            className="min-h-[40px] sm:min-h-0"
          >
            <QrCode className="mr-1.5 h-4 w-4" />
            QR Etiket
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => state.setDeleteOpen(true)}
            className="min-h-[40px] sm:min-h-0"
          >
            <Trash2 className="mr-1.5 h-4 w-4" />
            Sil
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="min-h-[40px] sm:min-h-0"
          >
            Kapat
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={state.handleOpenEdit}
            className="min-h-[40px] sm:min-h-0"
          >
            <Pencil className="mr-1.5 h-4 w-4" />
            Düzenle
          </Button>
        </div>
      </div>

      <ItemQrDialog
        open={state.qrOpen}
        onOpenChange={state.setQrOpen}
        itemId={item.id}
        itemName={item.name}
      />

      {!onEdit ? (
        <ItemFormDialog
          open={Boolean(state.inlineEditItem)}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) state.setInlineEditItem(undefined);
          }}
          categories={state.categories}
          locations={state.locations}
          editItem={state.inlineEditItem}
        />
      ) : null}

      <DeleteConfirmationDialog
        open={state.deleteOpen}
        onOpenChange={state.setDeleteOpen}
        entityLabel="Ürün"
        itemName={item.name}
        itemIcon={
          category ? (
            <CategoryIcon name={category.icon} className="size-4" />
          ) : undefined
        }
        itemColor={categoryHex}
        details={[
          { label: 'Stok', value: `${item.quantity} ${item.unit}` },
          {
            label: 'Konum',
            value: location?.path.join(' > ') ?? 'Konum yok',
          },
          { label: 'Kategori', value: category?.name ?? 'Genel' },
        ]}
        warning={
          movements.length > 0
            ? `Bu ürüne ait ${movements.length} stok hareketi geçmişi de kalıcı olarak silinecektir.`
            : undefined
        }
        onConfirm={state.handleConfirmDelete}
      />
    </>
  );
}
