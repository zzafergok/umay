'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Pencil, QrCode, Trash2 } from 'lucide-react';
import QRCode from 'qrcode';
import { Badge } from '@/components/core/badge';
import { Button } from '@/components/core/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/core/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/core/dialog';
import { Link } from '@/components/core/link';
import { QuantityStepper } from '@/components/core/quantity-stepper';
import { StatusPill } from '@/components/core/status-pill';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/core/table';
import { toast } from '@/components/core/toast';
import {
  useCategoriesQuery,
  useItemQuery,
  useLocationsQuery,
  useMovementsQuery,
  useRecordMovementMutation,
} from '@/hooks/use-inventory-hooks';
import { inventoryService } from '@/services/inventory-service';
import { ItemFormDialog } from './item-form-dialog';

export function ItemDetailScreen({ id }: { id: string }) {
  const router = useRouter();
  const { data: item, isLoading } = useItemQuery(id);
  const { data: movements = [] } = useMovementsQuery(id);
  const { data: categories = [] } = useCategoriesQuery();
  const { data: locations = [] } = useLocationsQuery();
  const moveMutation = useRecordMovementMutation();

  const [editOpen, setEditOpen] = React.useState(false);
  const [qrOpen, setQrOpen] = React.useState(false);
  const [qrDataUrl, setQrDataUrl] = React.useState('');

  React.useEffect(() => {
    if (!qrOpen || !item) return;
    QRCode.toDataURL(`umay:item:${item.id}`, { width: 220, margin: 1 })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(''));
  }, [qrOpen, item]);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Yükleniyor...</p>;
  }
  if (!item) {
    return <p className="text-sm text-muted-foreground">Ürün bulunamadı.</p>;
  }

  const category = categories.find((c) => c.id === item.categoryId);
  const location = locations.find((l) => l.id === item.locationId);

  const adjustStock = async (delta: number) => {
    try {
      await moveMutation.mutateAsync({
        itemId: item.id,
        type: delta > 0 ? 'in' : 'out',
        delta,
        reason: delta > 0 ? 'Stok girişi' : 'Stok çıkışı',
      });
      toast.success('Stok güncellendi.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'İşlem başarısız.');
    }
  };

  const handleDelete = async () => {
    try {
      await inventoryService.deleteItem(item.id);
      toast.success('Ürün silindi.');
      router.push('/items');
    } catch {
      toast.error('Ürün silinemedi.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/items">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Ürünlere Dön
          </Link>
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setQrOpen(true)}>
            <QrCode className="mr-1.5 h-4 w-4" />
            QR Etiket
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditOpen(true)}
          >
            <Pencil className="mr-1.5 h-4 w-4" />
            Düzenle
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="mr-1.5 h-4 w-4" />
            Sil
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-xl">{item.name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {location?.path.join(' > ') ?? 'Konum yok'} •{' '}
              {category?.name ?? 'Genel'}
            </p>
          </div>
          <StatusPill
            tone={
              item.quantity <= 0
                ? 'out_of_stock'
                : item.quantity <= item.minQuantity
                  ? 'low_stock'
                  : 'ok'
            }
            label={
              item.quantity <= 0
                ? 'Tükendi'
                : item.quantity <= item.minQuantity
                  ? 'Düşük Stok'
                  : 'Stokta'
            }
          />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-y border-border py-4">
            <QuantityStepper
              value={item.quantity}
              unit={item.unit}
              isLoading={moveMutation.isPending}
              onDecrement={() => adjustStock(-1)}
              onIncrement={() => adjustStock(1)}
            />
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              {item.brand && <Badge variant="outline">{item.brand}</Badge>}
              {item.barcode && (
                <Badge variant="outline">Barkod: {item.barcode}</Badge>
              )}
              {item.expiresAt && (
                <Badge variant="outline">
                  SKT: {new Date(item.expiresAt).toLocaleDateString('tr-TR')}
                </Badge>
              )}
            </div>
          </div>
          {item.notes ? (
            <p className="text-sm text-muted-foreground">{item.notes}</p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Stok Hareket Geçmişi</CardTitle>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tarih</TableHead>
              <TableHead>İşlem</TableHead>
              <TableHead className="text-right">Değişim</TableHead>
              <TableHead className="text-right">Son Miktar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Henüz stok hareketi yok.
                </TableCell>
              </TableRow>
            ) : (
              movements.map((mov) => (
                <TableRow key={mov.id}>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(mov.at).toLocaleString('tr-TR')}
                  </TableCell>
                  <TableCell>{mov.reason || mov.type}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {mov.delta > 0 ? `+${mov.delta}` : mov.delta}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {mov.quantityAfter} {item.unit}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="sm:max-w-xs text-center">
          <DialogHeader>
            <DialogTitle>QR Etiket — {item.name}</DialogTitle>
          </DialogHeader>
          {qrDataUrl ? (
            <div className="flex flex-col items-center gap-3 py-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrDataUrl}
                alt={`${item.name} QR kodu`}
                className="h-48 w-48 rounded-sm border border-border bg-white p-2"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
              >
                Etiketi Yazdır
              </Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <ItemFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        categories={categories}
        locations={locations}
        editItem={item}
      />
    </div>
  );
}
