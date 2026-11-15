'use client';

import { Eye, Pencil } from 'lucide-react';
import { Button } from '@/components/core/button';
import { Card } from '@/components/core/card';
import { StatusPill } from '@/components/core/status-pill';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/core/table';
import type { Item, Location } from '@/features/inventory/types';

export function ItemsTableView({
  items,
  locationMap,
  onConsume,
  onDetail,
  onEdit,
  isBusy,
}: {
  items: Item[];
  locationMap: Map<string, Location>;
  onConsume: (item: Item) => void;
  onDetail: (item: Item) => void;
  onEdit: (item: Item) => void;
  isBusy: boolean;
}) {
  return (
    <Card className="overflow-hidden py-0">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Ürün</TableHead>
            <TableHead>Konum</TableHead>
            <TableHead>Durum</TableHead>
            <TableHead className="text-right">Miktar</TableHead>
            <TableHead className="text-right">İşlem</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="text-text hover:text-accent h-auto p-0 font-medium"
                  onClick={() => onDetail(item)}
                >
                  {item.name}
                </Button>
              </TableCell>
              <TableCell className="text-text-muted">
                {locationMap.get(item.locationId)?.path.join(' > ') ?? '—'}
              </TableCell>
              <TableCell>
                {item.quantity <= 0 ? (
                  <StatusPill tone="out_of_stock" label="Tükendi" />
                ) : item.minQuantity > 0 &&
                  item.quantity <= item.minQuantity ? (
                  <StatusPill tone="low_stock" label="Düşük stok" />
                ) : (
                  <span className="text-text-muted text-caption">—</span>
                )}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {item.quantity} {item.unit}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={item.quantity <= 0 || isBusy}
                    onClick={() => onConsume(item)}
                  >
                    -1
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label={`${item.name} detayı`}
                    onClick={() => onDetail(item)}
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label={`${item.name} düzenle`}
                    onClick={() => onEdit(item)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
