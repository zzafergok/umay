'use client';

import * as React from 'react';
import { Camera, CameraOff, Plus, Search, X } from 'lucide-react';
import { Button } from '@/components/core/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/core/card';
import { Input } from '@/components/core/input';
import type { Item } from '@/features/inventory/types';
import { ItemDetailDialog } from '@/features/routes/auth/items/item-detail-dialog';
import { ItemFormDialog } from '@/features/routes/auth/items/item-form-dialog';
import {
  useCategoriesQuery,
  useItemsQuery,
  useLocationsQuery,
  useRecordMovementMutation,
} from '@/hooks/use-inventory-hooks';
import { useScanCamera } from './use-scan-camera';

export function ScanScreen() {
  const { data: items = [] } = useItemsQuery();
  const { data: categories = [] } = useCategoriesQuery();
  const { data: locations = [] } = useLocationsQuery();
  const moveMutation = useRecordMovementMutation();

  const [code, setCode] = React.useState('');
  const [formOpen, setFormOpen] = React.useState(false);
  const [editItem, setEditItem] = React.useState<Item | undefined>(undefined);
  const [detailOpen, setDetailOpen] = React.useState(false);

  const { videoRef, scanning, setScanning } = useScanCamera(setCode);

  const matchedItem = React.useMemo(() => {
    const trimmed = code.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith('umay:item:')) {
      const id = trimmed.replace('umay:item:', '');
      return items.find((i) => i.id === id) ?? null;
    }
    return items.find((i) => i.barcode === trimmed) ?? null;
  }, [code, items]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">
            Kamera ile Barkod / QR Tara
          </CardTitle>
          <Button
            size="sm"
            variant={scanning ? 'destructive' : 'default'}
            className="min-h-[44px] w-full sm:min-h-0 sm:w-auto"
            onClick={() => setScanning((s) => !s)}
          >
            {scanning ? (
              <>
                <CameraOff className="mr-1.5 h-4 w-4" />
                Durdur
              </>
            ) : (
              <>
                <Camera className="mr-1.5 h-4 w-4" />
                Kamerayı Aç
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {scanning && (
            <div className="overflow-hidden rounded-sm border border-border bg-black">
              <video
                ref={videoRef}
                className="aspect-[4/3] w-full object-cover sm:aspect-video"
                muted
                playsInline
              />
            </div>
          )}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Barkod veya QR kod girin..."
                className="min-h-[44px] pl-9 pr-10 sm:min-h-0"
              />
              {code ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="absolute right-1.5 top-1/2 h-8 w-8 -translate-y-1/2 sm:h-7 sm:w-7"
                  onClick={() => setCode('')}
                  aria-label="Kodu temizle"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

      {code.trim() ? (
        matchedItem ? (
          <Card>
            <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div className="min-w-0">
                <p className="truncate text-base font-semibold">
                  {matchedItem.name}
                </p>
                <p className="text-sm tabular-nums text-muted-foreground">
                  Mevcut: {matchedItem.quantity} {matchedItem.unit}
                </p>
              </div>
              <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center">
                <Button
                  size="sm"
                  variant="outline"
                  className="min-h-[44px] sm:min-h-0"
                  disabled={matchedItem.quantity <= 0 || moveMutation.isPending}
                  onClick={() =>
                    moveMutation.mutate({
                      itemId: matchedItem.id,
                      type: 'out',
                      delta: -1,
                      reason: 'Barkod çıkışı',
                    })
                  }
                >
                  -1
                </Button>
                <Button
                  size="sm"
                  className="min-h-[44px] sm:min-h-0"
                  disabled={moveMutation.isPending}
                  onClick={() =>
                    moveMutation.mutate({
                      itemId: matchedItem.id,
                      type: 'in',
                      delta: 1,
                      reason: 'Barkod girişi',
                    })
                  }
                >
                  +1
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="min-h-[44px] sm:min-h-0"
                  onClick={() => setDetailOpen(true)}
                >
                  Detay
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="min-h-[44px] sm:min-h-0"
                  onClick={() => {
                    setEditItem(matchedItem);
                    setFormOpen(true);
                  }}
                >
                  Düzenle
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <p className="min-w-0 break-words text-sm text-muted-foreground">
                <span className="font-mono text-foreground">{code}</span>{' '}
                barkoduna sahip ürün bulunamadı.
              </p>
              <Button
                size="sm"
                className="min-h-[44px] w-full shrink-0 sm:min-h-0 sm:w-auto"
                onClick={() => {
                  setEditItem(undefined);
                  setFormOpen(true);
                }}
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Bu Barkodla Ekle
              </Button>
            </CardContent>
          </Card>
        )
      ) : null}

      <ItemDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        itemId={matchedItem?.id ?? null}
        categories={categories}
        locations={locations}
        onEdit={(target) => {
          setEditItem(target);
          setFormOpen(true);
        }}
      />

      <ItemFormDialog
        open={formOpen}
        onOpenChange={(nextOpen) => {
          setFormOpen(nextOpen);
          if (!nextOpen) setEditItem(undefined);
        }}
        categories={categories}
        locations={locations}
        initialBarcode={editItem ? undefined : code.trim()}
        editItem={editItem}
      />
    </div>
  );
}
