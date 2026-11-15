'use client';

import { Badge } from '@/components/core/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/core/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/core/table';
import { useItemsQuery, useMovementsQuery } from '@/hooks/use-inventory-hooks';

export function ActivityScreen() {
  const { data: movements = [] } = useMovementsQuery();
  const { data: items = [] } = useItemsQuery(true);

  const itemMap = new Map(items.map((i) => [i.id, i]));
  const recentMovements = movements.slice(0, 50);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Stok Hareket Günlüğü</CardTitle>
        </CardHeader>

        <CardContent className="space-y-2.5 md:hidden">
          {recentMovements.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Henüz hareket kaydı yok.
            </p>
          ) : (
            recentMovements.map((mov) => {
              const deltaText = mov.delta > 0 ? `+${mov.delta}` : String(mov.delta);
              const badgeTone =
                mov.delta > 0 ? 'success' : mov.delta < 0 ? 'warning' : 'secondary';
              return (
                <div
                  key={mov.id}
                  className="bg-surface-sunken/50 flex items-start justify-between gap-3 rounded-lg border border-border p-3"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="truncate text-sm font-semibold text-text">
                      {itemMap.get(mov.itemId)?.name ?? mov.itemId}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {mov.reason || mov.type}
                    </p>
                    <p className="font-mono text-2xs text-text-muted tabular-nums">
                      {new Date(mov.at).toLocaleString('tr-TR')}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <Badge variant={badgeTone} className="font-mono tabular-nums">
                      {deltaText}
                    </Badge>
                    <span className="font-mono text-2xs text-muted-foreground tabular-nums">
                      Son: {mov.quantityAfter}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>

        <div className="hidden overflow-x-auto md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tarih</TableHead>
                <TableHead>Ürün</TableHead>
                <TableHead>Açıklama</TableHead>
                <TableHead className="text-right">Değişim</TableHead>
                <TableHead className="text-right">Son Miktar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentMovements.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground"
                  >
                    Henüz hareket kaydı yok.
                  </TableCell>
                </TableRow>
              ) : (
                recentMovements.map((mov) => (
                  <TableRow key={mov.id}>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(mov.at).toLocaleString('tr-TR')}
                    </TableCell>
                    <TableCell className="font-medium">
                      {itemMap.get(mov.itemId)?.name ?? mov.itemId}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {mov.reason || mov.type}
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {mov.delta > 0 ? `+${mov.delta}` : mov.delta}
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {mov.quantityAfter}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
