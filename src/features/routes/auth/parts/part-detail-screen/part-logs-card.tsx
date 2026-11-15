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

      {logs.length === 0 ? (
        <CardContent className="text-text-muted py-6 text-center text-sm">
          Henüz değişim kaydı yok.
        </CardContent>
      ) : (
        <>
          <CardContent className="space-y-2.5 pt-0 md:hidden">
            {logs.map((log) => (
              <div
                key={log.id}
                className="bg-surface-sunken/50 flex items-start justify-between gap-3 rounded-lg border border-border/80 px-3 py-2.5"
              >
                <div className="min-w-0 space-y-0.5">
                  <p className="text-text text-xs font-medium">
                    {new Date(log.replacedAt).toLocaleDateString('tr-TR')}
                  </p>
                  <p className="text-text-muted break-words text-xs">
                    {log.note || 'Not belirtilmedi'}
                  </p>
                </div>
                <span className="text-text shrink-0 font-mono text-xs font-semibold tabular-nums">
                  {log.cost ? `${log.cost} TRY` : '—'}
                </span>
              </div>
            ))}
          </CardContent>

          <div className="hidden overflow-x-auto md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Not</TableHead>
                  <TableHead className="text-right">Maliyet</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
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
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </Card>
  );
}
