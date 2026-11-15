'use client';

import { Eye, Minus, Pencil, Plus, Trash2 } from 'lucide-react';
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
  onAdjustStock,
  onDetail,
  onEdit,
  onDelete,
  pendingItemId,
}: {
  items: Item[];
  locationMap: Map<string, Location>;
  onAdjustStock: (item: Item, delta: number) => void;
  onDetail: (item: Item) => void;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
  pendingItemId: string | null;
}) {
  return (
    <Card className="overflow-hidden py-0">
      <div className="overflow-x-auto">
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
                <TableCell className="whitespace-normal break-words font-medium">
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="text-text h-auto whitespace-normal break-words p-0 text-left font-medium hover:text-accent"
                    onClick={() => onDetail(item)}
                  >
                    {item.name}
                  </Button>
                </TableCell>
                <TableCell className="text-text-muted whitespace-normal break-words">
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
                      size="icon-sm"
                      variant="ghost"
                      disabled={item.quantity <= 0 || pendingItemId === item.id}
                      aria-label={`${item.name} stok azalt (-1)`}
                      onClick={() => onAdjustStock(item, -1)}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      disabled={pendingItemId === item.id}
                      aria-label={`${item.name} stok artır (+1)`}
                      onClick={() => onAdjustStock(item, 1)}
                    >
                      <Plus className="h-3.5 w-3.5" />
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
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      aria-label={`${item.name} ürününü sil`}
                      onClick={() => onDelete(item)}
                    >
                      <Trash2 className="text-text-muted hover:text-danger h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
