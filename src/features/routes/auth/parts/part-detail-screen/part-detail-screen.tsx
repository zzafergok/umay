'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/core/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/core/card';
import { Link } from '@/components/core/link';
import { Progress } from '@/components/core/progress';
import { Stat } from '@/components/core/stat';
import { StatusPill } from '@/components/core/status-pill';
import { toast } from '@/components/core/toast';
import { AmountField, Form, SubmitButton } from '@/components/forms';
import { DeleteConfirmationDialog } from '@/components/shared/delete-confirmation-dialog';
import {
  partUsageSchema,
  type PartUsageValues,
} from '@/features/routes/auth/parts/part-form-schema';
import { ReplacePartDialog } from '@/features/routes/auth/parts/replace-part-dialog';
import { usePartQuery } from '@/hooks/use-inventory-hooks';
import { useUserPreferences } from '@/hooks/use-user-preferences';
import { computePartHealth } from '@/lib/lifecycle';
import { parseAmountInput } from '@/lib/utils';
import { inventoryService } from '@/services/inventory-service';
import { PartLogsCard } from './part-logs-card';

export function PartDetailScreen({ id }: { id: string }) {
  const router = useRouter();
  const qc = useQueryClient();
  const { data, isLoading } = usePartQuery(id);
  const { formatDate } = useUserPreferences();
  const [replaceOpen, setReplaceOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  const usageForm = useForm<PartUsageValues>({
    resolver: zodResolver(partUsageSchema),
    defaultValues: { usageCurrent: 0 },
  });

  React.useEffect(() => {
    if (data?.part) {
      usageForm.reset({ usageCurrent: data.part.usageCurrent ?? 0 });
    }
  }, [data?.part, usageForm]);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Yükleniyor...</p>;
  }
  if (!data?.part) {
    return <p className="text-sm text-muted-foreground">Parça bulunamadı.</p>;
  }

  const { part, logs } = data;
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

  const handleUpdateUsage = async (values: PartUsageValues) => {
    try {
      await inventoryService.updatePart(part.id, {
        usageCurrent: Math.max(0, parseAmountInput(values.usageCurrent)),
      });
      await qc.invalidateQueries({ queryKey: ['inventory', 'parts'] });
      toast.success('Kullanım güncellendi.');
    } catch {
      toast.error('Kullanım güncellenemedi.');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await inventoryService.deletePart(part.id);
      await qc.invalidateQueries({ queryKey: ['inventory', 'parts'] });
      toast.success('Parça silindi.');
      router.push('/parts');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Parça silinemedi.');
      throw err;
    }
  };

  return (
    <div className="space-y-5 md:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="min-h-[44px] w-fit sm:min-h-0"
        >
          <Link href="/parts">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Parçalara Dön
          </Link>
        </Button>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
          <Button
            size="sm"
            onClick={() => setReplaceOpen(true)}
            className="min-h-[44px] sm:min-h-0"
          >
            <CheckCircle2 className="mr-1.5 h-4 w-4" />
            Değiştirildi
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
            className="min-h-[44px] sm:min-h-0"
          >
            <Trash2 className="mr-1.5 h-4 w-4" />
            Sil
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-xl">{part.name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Takılma: {formatDate(part.installedAt)}
              {part.nextReplacementAt
                ? ` • Planlanan değişim: ${formatDate(part.nextReplacementAt)}`
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
            <Form
              schema={partUsageSchema}
              methods={usageForm}
              onSubmit={handleUpdateUsage}
              className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-end"
            >
              <AmountField
                name="usageCurrent"
                label={`Mevcut Kullanım (${part.lifespan.usageUnit ?? 'birim'})`}
                className="w-full sm:w-48"
              />
              <SubmitButton
                variant="outline"
                isLoading={usageForm.formState.isSubmitting}
                className="min-h-[44px] w-full sm:min-h-0 sm:w-auto"
              >
                Kullanımı Güncelle
              </SubmitButton>
            </Form>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
        <Stat label="Toplam Değişim" value={logs.length} />
        <Stat
          label="Gerçekleşen Ort. Ömür"
          value={avgActualDays !== null ? `${avgActualDays} gün` : '—'}
          hint={
            part.lifespan.days
              ? `Planlanan: ${part.lifespan.days} gün`
              : undefined
          }
        />
        <Stat
          label="Toplam Maliyet"
          value={`${totalCost} TRY`}
          className="col-span-2 sm:col-span-1"
        />
      </div>

      <PartLogsCard logs={logs} />

      <ReplacePartDialog
        part={replaceOpen ? part : null}
        onClose={() => setReplaceOpen(false)}
      />

      <DeleteConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        entityLabel="Parça"
        itemName={part.name}
        details={[
          { label: 'Kalan Ömür', value: `%${health.remainingPercent}` },
          { label: 'Değişim Geçmişi', value: `${logs.length} kayıt` },
        ]}
        warning={
          logs.length > 0
            ? `Bu parçaya ait ${logs.length} değişim geçmişi kaydı da kalıcı olarak silinecektir.`
            : undefined
        }
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
