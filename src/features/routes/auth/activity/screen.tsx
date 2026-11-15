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
import { useItemsQuery, useMovementsQuery } from '@/hooks/use-inventory-hooks';

export function ActivityScreen() {
  const { data: movements = [] } = useMovementsQuery();
  const { data: items = [] } = useItemsQuery(true);

  const itemMap = new Map(items.map((i) => [i.id, i]));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Stok Hareket Günlüğü</CardTitle>
        </CardHeader>
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
            {movements.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground"
                >
                  Henüz hareket kaydı yok.
                </TableCell>
              </TableRow>
            ) : (
              movements.slice(0, 50).map((mov) => (
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
      </Card>
    </div>
  );
}
