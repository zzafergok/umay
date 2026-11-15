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
import type { ReplacementLog } from '@/features/inventory/types';

interface PartLogsCardProps {
  logs: ReplacementLog[];
}

/** Displays replacement history logs for a lifecycle-tracked part. */
export function PartLogsCard({ logs }: PartLogsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Değişim Geçmişi</CardTitle>
      </CardHeader>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tarih</TableHead>
            <TableHead>Not</TableHead>
            <TableHead className="text-right">Maliyet</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-muted-foreground">
                Henüz değişim kaydı yok.
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="text-xs">
                  {new Date(log.replacedAt).toLocaleDateString('tr-TR')}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {log.note || '—'}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {log.cost ? `${log.cost} TRY` : '—'}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
