'use client';

import { AlertTriangle, Package, ShoppingBag, Wrench } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { formatTwoDecimals } from '../home-utils';
import type { DashboardSummary } from '../types';
import { KpiCardShell } from './kpi-card-shell';

interface DashboardKpiGridProps {
  summary: DashboardSummary;
}

export function DashboardKpiGrid({ summary }: DashboardKpiGridProps) {
  const criticalStockCount = summary.outOfStockCount + summary.lowStockCount;
  const duePartsTotal = summary.overduePartsCount + summary.dueSoonPartsCount;
  const activeRatio =
    summary.totalItems > 0
      ? Math.round((summary.activeItemsCount / summary.totalItems) * 100)
      : 100;

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCardShell
        title="Toplam Envanter"
        icon={<Package className="h-4 w-4" />}
        badgeText={`${formatTwoDecimals(summary.totalUnits)} birim`}
        badgeVariant="default"
        primaryValue={summary.totalItems}
        primaryUnit="ürün"
        subtitle={
          summary.estimatedInventoryValue > 0
            ? `Tahmini değer: ${formatCurrency(
                summary.estimatedInventoryValue,
                {
                  currency: summary.currency,
                  locale: 'tr',
                },
              )}`
            : `${summary.locationsCount} konum · ${summary.categoriesCount} kategori`
        }
        progressValue={activeRatio}
        progressIndicatorClass="bg-accent"
        metrics={[
          { label: 'Aktif', value: summary.activeItemsCount },
          { label: 'Konum', value: summary.locationsCount },
          { label: 'Kategori', value: summary.categoriesCount },
        ]}
        href="/items"
        hrefLabel="Tüm ürünleri incele"
      />

      <KpiCardShell
        title="Stok Sağlığı"
        icon={<AlertTriangle className="h-4 w-4" />}
        badgeText={
          criticalStockCount > 0 ? `${criticalStockCount} kritik` : 'Sağlıklı'
        }
        badgeVariant={
          summary.outOfStockCount > 0
            ? 'destructive'
            : summary.lowStockCount > 0
              ? 'warning'
              : 'success'
        }
        primaryValue={`%${summary.stockHealthPercent}`}
        primaryUnit="yeterli"
        subtitle={
          criticalStockCount > 0
            ? `${summary.outOfStockCount} tükendi · ${summary.lowStockCount} düşük stok`
            : 'Tüm ürünler eşik değerin üzerinde'
        }
        progressValue={summary.stockHealthPercent}
        progressIndicatorClass={
          summary.outOfStockCount > 0
            ? 'bg-danger'
            : summary.lowStockCount > 0
              ? 'bg-warning'
              : 'bg-success'
        }
        metrics={[
          {
            label: 'Tükendi',
            value: summary.outOfStockCount,
            toneClass: summary.outOfStockCount > 0 ? 'text-danger' : undefined,
          },
          {
            label: 'Düşük',
            value: summary.lowStockCount,
            toneClass: summary.lowStockCount > 0 ? 'text-warning' : undefined,
          },
          {
            label: 'Yeterli',
            value: summary.healthyStockCount,
            toneClass: 'text-success',
          },
        ]}
        href="/items"
        hrefLabel="Stok durumunu yönet"
      />

      <KpiCardShell
        title="Parça & Bakım"
        icon={<Wrench className="h-4 w-4" />}
        badgeText={
          summary.overduePartsCount > 0
            ? `${summary.overduePartsCount} gecikti`
            : duePartsTotal > 0
              ? `${duePartsTotal} yaklaşıyor`
              : 'Güncel'
        }
        badgeVariant={
          summary.overduePartsCount > 0
            ? 'destructive'
            : summary.dueSoonPartsCount > 0
              ? 'warning'
              : 'success'
        }
        primaryValue={summary.totalParts}
        primaryUnit="parça"
        subtitle={
          summary.totalReplacementCost > 0
            ? `Toplam bakım: ${formatCurrency(summary.totalReplacementCost, {
                currency: summary.currency,
                locale: 'tr',
              })}`
            : `%${summary.partHealthPercent} parça normal ömürde`
        }
        progressValue={summary.partHealthPercent}
        progressIndicatorClass={
          summary.overduePartsCount > 0
            ? 'bg-danger'
            : summary.dueSoonPartsCount > 0
              ? 'bg-warning'
              : 'bg-success'
        }
        metrics={[
          {
            label: 'Geciken',
            value: summary.overduePartsCount,
            toneClass:
              summary.overduePartsCount > 0 ? 'text-danger' : undefined,
          },
          {
            label: 'Yaklaşan',
            value: summary.dueSoonPartsCount,
            toneClass:
              summary.dueSoonPartsCount > 0 ? 'text-warning' : undefined,
          },
          {
            label: 'Normal',
            value: summary.okPartsCount,
            toneClass: 'text-success',
          },
        ]}
        href="/parts"
        hrefLabel="Parça takvimini aç"
      />

      <KpiCardShell
        title="Alışveriş & SKT"
        icon={<ShoppingBag className="h-4 w-4" />}
        badgeText={
          summary.shoppingHighPriorityCount > 0
            ? `${summary.shoppingHighPriorityCount} acil`
            : `${summary.expiringOrWarrantyCount} SKT`
        }
        badgeVariant={
          summary.shoppingHighPriorityCount > 0 ||
          summary.expiringOrWarrantyCount > 0
            ? 'warning'
            : 'secondary'
        }
        primaryValue={summary.shoppingPendingCount}
        primaryUnit="alınacak"
        subtitle={
          summary.shoppingEstimatedTotal > 0
            ? `Sepet: ${formatCurrency(summary.shoppingEstimatedTotal, {
                currency: summary.currency,
                locale: 'tr',
              })}`
            : `${summary.shoppingDoneCount} kalem tamamlandı`
        }
        progressValue={summary.shoppingCompletionPercent}
        progressIndicatorClass="bg-accent"
        metrics={[
          {
            label: 'Tamamlanan',
            value: `%${summary.shoppingCompletionPercent}`,
          },
          {
            label: 'Acil',
            value: summary.shoppingHighPriorityCount,
            toneClass:
              summary.shoppingHighPriorityCount > 0
                ? 'text-warning'
                : undefined,
          },
          {
            label: 'SKT/Garanti',
            value: summary.expiringOrWarrantyCount,
            toneClass:
              summary.expiringOrWarrantyCount > 0 ? 'text-warning' : undefined,
          },
        ]}
        href="/shopping"
        hrefLabel="Alışveriş listesine git"
      />
    </div>
  );
}
