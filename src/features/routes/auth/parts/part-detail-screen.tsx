'use client';

import * as React from 'react';
import { ArrowLeft, CheckCircle2, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/core/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/core/card';
import { Input } from '@/components/core/input';
import { Label } from '@/components/core/label';
import { Link } from '@/components/core/link';
import { Progress } from '@/components/core/progress';
import { Stat } from '@/components/core/stat';
import { StatusPill } from '@/components/core/status-pill';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/core/table';
import { toast } from '@/components/core/toast';
import { computePartHealth } from '@/lib/lifecycle';
import { usePartQuery } from '@/hooks/use-inventory-hooks';
import { inventoryService } from '@/services/inventory-service';
import { useQueryClient } from '@tanstack/react-query';
import { ReplacePartDialog } from './replace-part-dialog';

export function PartDetailScreen({ id }: { id: string }) {
  const router = useRouter();
  const qc = useQueryClient();
  const { data, isLoading } = usePartQuery(id);
  const [replaceOpen, setReplaceOpen] = React.useState(false);
  const [usageDraft, setUsageDraft] = React.useState<string | null>(null);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Yükleniyor...</p>;
  }
  if (!data?.part) {
    return <p className="text-sm text-muted-foreground">Parça bulunamadı.</p>;
  }

  const { part, logs } = data;
  const usageInput = usageDraft ?? String(part.usageCurrent ?? 0);
  const health = computePartHealth(part);
  const totalCost = logs.reduce((acc, l) => acc + (l.cost ?? 0), 0);

  const avgActualDays =
    logs.length > 0
      ? Math.round(
          logs.reduce((acc, l) => {
            const diff =
              Date.parse(l.replacedAt) - Date.parse(l.oldInstalledAt);
            return acc + Math.max(1, diff / (1000 * 60 * 60 * 24));
          }, 0) / logs.length,
        )
      : null;

  const handleUpdateUsage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await inventoryService.updatePart(part.id, {
        usageCurrent: Math.max(0, Number(usageInput) || 0),
      });
      await qc.invalidateQueries({ queryKey: ['inventory', 'parts'] });
      toast.success('Kullanım güncellendi.');
    } catch {
      toast.error('Kullanım güncellenemedi.');
    }
  };

  const handleDelete = async () => {
    try {
      await inventoryService.deletePart(part.id);
      toast.success('Parça silindi.');
      router.push('/parts');
    } catch {
      toast.error('Parça silinemedi.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/parts">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Parçalara Dön
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setReplaceOpen(true)}>
            <CheckCircle2 className="mr-1.5 h-4 w-4" />
            Değiştirildi
          </Button>
          <Button size="sm" variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-1.5 h-4 w-4" />
            Sil
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-xl">{part.name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Takılma:{' '}
              {new Date(part.installedAt).toLocaleDateString('tr-TR')}
              {part.nextReplacementAt
                ? ` • Planlanan değişim: ${new Date(
                    part.nextReplacementAt,
                  ).toLocaleDateString('tr-TR')}`
                : ''}
            </p>
          </div>
          <StatusPill
            tone={health.status}
            label={
              health.status === 'overdue'
                ? 'Gecikti'
                : health.status === 'due_soon'
                  ? 'Yaklaşıyor'
                  : 'İyi Durumda'
            }
          />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs tabular-nums">
              <span>Kalan Ömür: %{health.remainingPercent}</span>
              {health.daysRemaining !== null && (
                <span>{health.daysRemaining} gün kaldı</span>
              )}
            </div>
            <Progress value={health.remainingPercent} />
          </div>

          {part.lifespan.mode !== 'time' && (
            <form
              onSubmit={handleUpdateUsage}
              className="flex flex-wrap items-end gap-2 pt-2"
            >
              <div className="space-y-1">
                <Label htmlFor="usage-input">
                  Mevcut Kullanım ({part.lifespan.usageUnit ?? 'birim'})
                </Label>
                <Input
                  id="usage-input"
                  type="number"
                  min={0}
                  value={usageInput}
                  onChange={(e) => setUsageDraft(e.target.value)}
                  className="w-40 tabular-nums"
                />
              </div>
              <Button type="submit" variant="outline">
                Kullanımı Güncelle
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Toplam Değişim" value={logs.length} />
        <Stat
          label="Gerçekleşen Ort. Ömür"
          value={avgActualDays !== null ? `${avgActualDays} gün` : '—'}
          hint={
            part.lifespan.days ? `Planlanan: ${part.lifespan.days} gün` : undefined
          }
        />
        <Stat label="Toplam Maliyet" value={`${totalCost} TRY`} />
      </div>

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

      <ReplacePartDialog
        part={replaceOpen ? part : null}
        onClose={() => setReplaceOpen(false)}
      />
    </div>
  );
}
