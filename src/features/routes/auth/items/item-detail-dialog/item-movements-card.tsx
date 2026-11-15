'use client';

import { Card, CardHeader, CardTitle } from '@/components/core/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/core/table';
import type { StockMovement } from '@/features/inventory/types';

interface ItemMovementsCardProps {
  movements: StockMovement[];
  unit: string;
}

/** Displays stock movement history rows for a single inventory item. */
export function ItemMovementsCard({ movements, unit }: ItemMovementsCardProps) {
  return (
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
              <TableCell
                colSpan={4}
                className="text-center text-muted-foreground"
              >
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
                  {mov.quantityAfter} {unit}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
