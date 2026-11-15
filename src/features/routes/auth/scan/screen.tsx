'use client';

import * as React from 'react';
import { Camera, CameraOff, Plus, Search } from 'lucide-react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { Button } from '@/components/core/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/core/card';
import { Input } from '@/components/core/input';
import { Link } from '@/components/core/link';
import { toast } from '@/components/core/toast';
import {
  useCategoriesQuery,
  useItemsQuery,
  useLocationsQuery,
  useRecordMovementMutation,
} from '@/hooks/use-inventory-hooks';
import { ItemFormDialog } from '@/features/routes/auth/items/item-form-dialog';

interface BarcodeDetectorResult {
  rawValue?: string;
}

interface BarcodeDetectorLike {
  detect: (source: HTMLVideoElement) => Promise<BarcodeDetectorResult[]>;
}

export function ScanScreen() {
  const { data: items = [] } = useItemsQuery();
  const { data: categories = [] } = useCategoriesQuery();
  const { data: locations = [] } = useLocationsQuery();
  const moveMutation = useRecordMovementMutation();

  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const [scanning, setScanning] = React.useState(false);
  const [code, setCode] = React.useState('');
  const [createOpen, setCreateOpen] = React.useState(false);

  const matchedItem = React.useMemo(() => {
    const trimmed = code.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith('umay:item:')) {
      const id = trimmed.replace('umay:item:', '');
      return items.find((i) => i.id === id) ?? null;
    }
    return items.find((i) => i.barcode === trimmed) ?? null;
  }, [code, items]);

  React.useEffect(() => {
    if (!scanning || !videoRef.current) return;
    let active = true;
    let stream: MediaStream | null = null;
    let controls: { stop: () => void } | null = null;

    const startScan = async () => {
      try {
        const detectorCtor = Reflect.get(globalThis, 'BarcodeDetector');
        if (typeof detectorCtor === 'function' && videoRef.current) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' },
          });
          videoRef.current.srcObject = stream;
          await videoRef.current.play();

          const detector = Reflect.construct(detectorCtor, [
            { formats: ['ean_13', 'ean_8', 'qr_code', 'code_128', 'upc_a'] },
          ]) as BarcodeDetectorLike;

          const tick = async () => {
            if (!active || !videoRef.current) return;
            try {
              const found = await detector.detect(videoRef.current);
              const val = found[0]?.rawValue;
              if (val) {
                setCode(val);
                setScanning(false);
                toast.success(`Okundu: ${val}`);
                return;
              }
            } catch {
              // ignore frame errors
            }
            if (active) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        } else if (videoRef.current) {
          const reader = new BrowserMultiFormatReader();
          controls = await reader.decodeFromVideoDevice(
            undefined,
            videoRef.current,
            (result) => {
              if (result && active) {
                const text = result.getText();
                setCode(text);
                setScanning(false);
                toast.success(`Okundu: ${text}`);
              }
            },
          );
        }
      } catch {
        toast.error('Kamera açılamadı. Manuel barkod girebilirsin.');
        setScanning(false);
      }
    };

    startScan();

    return () => {
      active = false;
      controls?.stop();
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [scanning]);

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
                <Button asChild size="sm" variant="ghost">
                  <Link href={`/items/${matchedItem.id}`}>Detay</Link>
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
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                <Plus className="mr-1.5 h-4 w-4" />
                Bu Barkodla Ekle
              </Button>
            </CardContent>
          </Card>
        )
      ) : null}

      <ItemFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        categories={categories}
        locations={locations}
        initialBarcode={code.trim()}
      />
    </div>
  );
}
