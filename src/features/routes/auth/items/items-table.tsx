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
import { TableActionButton } from '@/components/shared/table-action-button';
import {
  getEffectiveDecrementStep,
  getUnitDefinition,
  roundQuantity,
} from '@/features/inventory/constants';
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
                    className="h-auto whitespace-normal break-words p-0 text-left font-medium text-text hover:text-accent"
                    onClick={() => onDetail(item)}
                  >
                    {item.name}
                  </Button>
                </TableCell>
                <TableCell className="whitespace-normal break-words text-text-muted">
                  {locationMap.get(item.locationId)?.path.join('>') ?? '—'}
                </TableCell>
                <TableCell>
                  {item.quantity <= 0 ? (
                    <StatusPill tone="out_of_stock" label="Tükendi" />
                  ) : item.minQuantity > 0 &&
                    item.quantity <= item.minQuantity ? (
                    <StatusPill tone="low_stock" label="Düşük stok" />
                  ) : (
                    <span className="text-caption text-text-muted">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {roundQuantity(item.quantity)} {item.unit}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {(() => {
                      const unitDef = getUnitDefinition(item.unit);
                      const decStep = getEffectiveDecrementStep(
                        item.unit,
                        item.quantity,
                      );
                      const incStep = unitDef.defaultStep;
                      return (
                        <>
                          <TableActionButton
                            icon={Minus}
                            tooltip={`Stok azalt (-${decStep} ${item.unit})`}
                            disabled={
                              item.quantity <= 0 || pendingItemId === item.id
                            }
                            aria-label={`${item.name} stok azalt (-${decStep} ${item.unit})`}
                            onClick={() => onAdjustStock(item, -decStep)}
                          />
                          <TableActionButton
                            icon={Plus}
                            tooltip={`Stok artır (+${incStep} ${item.unit})`}
                            disabled={pendingItemId === item.id}
                            aria-label={`${item.name} stok artır (+${incStep} ${item.unit})`}
                            onClick={() => onAdjustStock(item, incStep)}
                          />
                        </>
                      );
                    })()}
                    <TableActionButton
                      icon={Eye}
                      tooltip="Detayı görüntüle"
                      aria-label={`${item.name} detayı`}
                      onClick={() => onDetail(item)}
                    />
                    <TableActionButton
                      icon={Pencil}
                      tooltip="Düzenle"
                      aria-label={`${item.name} düzenle`}
                      onClick={() => onEdit(item)}
                    />
                    <TableActionButton
                      icon={Trash2}
                      tooltip="Sil"
                      tone="danger"
                      aria-label={`${item.name} ürününü sil`}
                      onClick={() => onDelete(item)}
                    />
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
