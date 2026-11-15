'use client';

import * as React from 'react';
import { Camera, CameraOff, Plus, Search } from 'lucide-react';
import { Button } from '@/components/core/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/core/card';
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
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Kamera ile Barkod / QR Tara</CardTitle>
          <Button
            size="sm"
            variant={scanning ? 'destructive' : 'default'}
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
                className="aspect-video w-full object-cover"
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
                className="pl-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {code.trim() ? (
        matchedItem ? (
          <Card>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
              <div>
                <h3 className="text-base font-semibold">{matchedItem.name}</h3>
                <p className="text-sm text-muted-foreground tabular-nums">
                  Mevcut: {matchedItem.quantity} {matchedItem.unit}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
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
                  onClick={() => setDetailOpen(true)}
                >
                  Detay
                </Button>
                <Button
                  size="sm"
                  variant="outline"
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
            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
              <p className="text-sm text-muted-foreground">
                <span className="font-mono text-foreground">{code}</span>{' '}
                barkoduna sahip ürün bulunamadı.
              </p>
              <Button
                size="sm"
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
