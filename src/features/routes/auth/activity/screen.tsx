'use client';

import { CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/core/badge';
import { Button } from '@/components/core/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/core/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/core/table';
import {
  useItemsQuery,
  useMovementsQuery,
  useNotificationsQuery,
} from '@/hooks/use-inventory-hooks';
import { inventoryService } from '@/services/inventory-service';
import { useQueryClient } from '@tanstack/react-query';

export function ActivityScreen() {
  const qc = useQueryClient();
  const { data: movements = [] } = useMovementsQuery();
  const { data: items = [] } = useItemsQuery(true);
  const { data: notifications = [] } = useNotificationsQuery();

  const itemMap = new Map(items.map((i) => [i.id, i]));

  const handleMarkRead = async (id: string) => {
    await inventoryService.markNotificationRead(id);
    await qc.invalidateQueries({ queryKey: ['inventory', 'notifications'] });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Bildirim Merkezi ({notifications.filter((n) => !n.readAt).length}{' '}
            okunmamış)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Henüz bildirim yok.
            </p>
          ) : (
            notifications.slice(0, 10).map((n) => (
              <div
                key={n.id}
                className="flex items-center justify-between gap-3 rounded-sm border border-border p-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium">
                      {n.title}
                    </span>
                    {!n.readAt && <Badge>Yeni</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">{n.message}</p>
                </div>
                {!n.readAt && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleMarkRead(n.id)}
                  >
                    <CheckCircle2 className="mr-1 h-4 w-4" />
                    Okundu
                  </Button>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

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
                <TableCell colSpan={5} className="text-center text-muted-foreground">
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
