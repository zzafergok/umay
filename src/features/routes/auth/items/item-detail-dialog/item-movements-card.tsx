'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/core/card';
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

      {movements.length === 0 ? (
        <CardContent className="py-6 text-center text-sm text-text-muted">
          Henüz stok hareketi yok.
        </CardContent>
      ) : (
        <>
          <CardContent className="space-y-2.5 pt-0 md:hidden">
            {movements.map((mov) => (
              <div
                key={mov.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border/80 bg-surface-sunken/50 px-3 py-2.5"
              >
                <div className="min-w-0 space-y-0.5">
                  <p className="truncate text-sm font-medium text-text">
                    {mov.reason || mov.type}
                  </p>
                  <p className="text-xs text-text-muted">
                    {new Date(mov.at).toLocaleString('tr-TR')}
                  </p>
                </div>
                <div className="shrink-0 text-right font-mono text-xs tabular-nums">
                  <p className="font-semibold text-text">
                    {mov.delta > 0 ? `+${mov.delta}` : mov.delta}
                  </p>
                  <p className="text-text-muted">
                    {mov.quantityAfter} {unit}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>

          <div className="hidden overflow-x-auto md:block">
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
                {movements.map((mov) => (
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
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </Card>
  );
}
