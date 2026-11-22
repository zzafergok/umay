'use client';

import { CheckCircle2, Link2, ShoppingBag, Wallet } from 'lucide-react';
import { Stat } from '@/components/core/stat';
import type { CurrencyCode } from '@/features/inventory/types';
import { formatCurrency } from '@/lib/utils';
import type { ShoppingSummary } from './shopping-utils';

interface ShoppingSummaryStatsProps {
  summary: ShoppingSummary;
  currency: CurrencyCode;
}

export function ShoppingSummaryStats({
  summary,
  currency,
}: ShoppingSummaryStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Stat
        label="Alınacak Ürün"
        value={summary.pendingCount}
        unit="kalem"
        icon={<ShoppingBag className="h-4 w-4" />}
        tone={summary.highPriorityPendingCount > 0 ? 'warning' : 'default'}
        hint={
          summary.highPriorityPendingCount > 0
            ? `${summary.highPriorityPendingCount} acil öncelikli`
            : 'Tüm kalemler normal öncelikte'
        }
      />
      <Stat
        label="Sepet / Alındı"
        value={summary.doneCount}
        unit="kalem"
        icon={<CheckCircle2 className="h-4 w-4" />}
        tone="success"
        hint={
          summary.totalCount > 0
            ? `%${summary.completionRate} tamamlandı`
            : 'Henüz kalem eklenmedi'
        }
      />
      <Stat
        label="Sepet Tutarı"
        value={formatCurrency(summary.pendingTotal, {
          currency,
          locale: 'tr',
        })}
        icon={<Wallet className="h-4 w-4" />}
        hint={
          summary.pricedPendingCount > 0
            ? `${summary.pricedPendingCount} fiyatlı ürün toplamı`
            : 'Fiyat girildiğinde hesaplanır'
        }
      />
      <Stat
        label="Envanter Bağlantılı"
        value={summary.linkedPendingCount}
        unit="kalem"
        icon={<Link2 className="h-4 w-4" />}
        hint="Alındığında stoğa otomatik işlenir"
      />
    </div>
  );
}
