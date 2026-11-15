'use client';

import * as React from 'react';
import {
  AlertTriangle,
  CalendarClock,
  Package,
  Plus,
  ScanLine,
  ShoppingCart,
  Wrench,
} from 'lucide-react';
import { Button } from '@/components/core/button';
import { Link } from '@/components/core/link';
import { Stat } from '@/components/core/stat';
import { resolveCategoryCssVar } from '@/lib/design/tokens';
import {
  useCategoriesQuery,
  useItemsQuery,
  useLocationsQuery,
  usePartsQuery,
} from '@/hooks/use-inventory-hooks';
import {
  AttentionListCard,
  type AttentionItem,
} from './components/attention-list-card';
import {
  CategoryDistributionCard,
  type CategoryDistributionItem,
} from './components/category-distribution-card';

const ISTANBUL_DATE_FORMAT = new Intl.DateTimeFormat('tr-TR', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'Europe/Istanbul',
});

export function AuthHomeScreen() {
  const { data: items = [] } = useItemsQuery();
  const { data: partsData } = usePartsQuery();
  const { data: categories = [] } = useCategoriesQuery();
  const { data: locations = [] } = useLocationsQuery();

  const parts = partsData?.parts ?? [];
  const lowStockItems = items.filter(
    (i) => i.minQuantity > 0 && i.quantity <= i.minQuantity,
  );
  const dueParts = parts.filter((p) => p.status !== 'ok');

  const [nowMs] = React.useState(() => Date.now());
  const soonWindowMs = 30 * 24 * 60 * 60 * 1000;
  const expiringOrWarranty = items.filter((i) => {
    const expMs = i.expiresAt ? Date.parse(i.expiresAt) : NaN;
    const warMs = i.warrantyEndsAt ? Date.parse(i.warrantyEndsAt) : NaN;
    return (
      (!Number.isNaN(expMs) && expMs - nowMs <= soonWindowMs) ||
      (!Number.isNaN(warMs) && warMs - nowMs <= soonWindowMs)
    );
  });

  const attentionList: AttentionItem[] = React.useMemo(() => {
    const list: AttentionItem[] = [];
    for (const p of dueParts) {
      list.push({
        id: `part-${p.id}`,
        title: p.name,
        subtitle:
          p.status === 'overdue'
            ? 'Değişim süresi doldu'
            : 'Değişim zamanı yaklaşıyor',
        tone: p.status === 'overdue' ? 'overdue' : 'due_soon',
        badge: p.status === 'overdue' ? 'Gecikti' : 'Yaklaşıyor',
        href: `/parts/${p.id}`,
        priority: p.status === 'overdue' ? 0 : 1,
      });
    }
    for (const i of lowStockItems) {
      list.push({
        id: `low-${i.id}`,
        title: i.name,
        subtitle: `Kalan: ${i.quantity} ${i.unit} · Eşik: ${i.minQuantity} ${i.unit}`,
        tone: i.quantity <= 0 ? 'out_of_stock' : 'low_stock',
        badge: i.quantity <= 0 ? 'Tükendi' : 'Düşük stok',
        href: `/items?item=${i.id}`,
        priority: i.quantity <= 0 ? 1 : 2,
      });
    }
    for (const i of expiringOrWarranty) {
      list.push({
        id: `exp-${i.id}`,
        title: i.name,
        subtitle: i.expiresAt
          ? `SKT: ${ISTANBUL_DATE_FORMAT.format(new Date(i.expiresAt))}`
          : 'Garanti yaklaşıyor',
        tone: 'due_soon',
        badge: 'SKT / Garanti',
        href: `/items?item=${i.id}`,
        priority: 3,
      });
    }
    return list.sort((a, b) => a.priority - b.priority).slice(0, 8);
  }, [dueParts, lowStockItems, expiringOrWarranty]);

  const categoryDistribution: CategoryDistributionItem[] = React.useMemo(() => {
    const total = Math.max(1, items.length);
    return categories
      .map((cat) => {
        const count = items.filter((i) => i.categoryId === cat.id).length;
        return {
          id: cat.id,
          name: cat.name,
          count,
          percent: Math.round((count / total) * 100),
          dotColor: resolveCategoryCssVar(cat.name),
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [categories, items]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Button asChild size="sm" variant="primary">
          <Link href="/items?new=1">
            <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Ürün ekle
          </Link>
        </Button>
        <Button asChild size="sm" variant="secondary">
          <Link href="/scan">
            <ScanLine className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Barkod tara
          </Link>
        </Button>
        <Button asChild size="sm" variant="secondary">
          <Link href="/parts">
            <Wrench className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Parçalar
          </Link>
        </Button>
        <Button asChild size="sm" variant="secondary">
          <Link href="/shopping">
            <ShoppingCart className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Alışveriş
          </Link>
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Toplam ürün"
          value={items.length}
          hint={`${locations.length} konum`}
          icon={<Package className="h-4 w-4" />}
        />
        <Stat
          label="Düşük stok"
          value={lowStockItems.length}
          tone={lowStockItems.length > 0 ? 'warning' : 'default'}
          icon={<AlertTriangle className="h-4 w-4" />}
        />
        <Stat
          label="Yaklaşan parça değişimi"
          value={dueParts.length}
          tone={
            dueParts.some((p) => p.status === 'overdue') ? 'danger' : 'default'
          }
          icon={<Wrench className="h-4 w-4" />}
        />
        <Stat
          label="SKT / garanti"
          value={expiringOrWarranty.length}
          tone={expiringOrWarranty.length > 0 ? 'warning' : 'default'}
          icon={<CalendarClock className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <AttentionListCard items={attentionList} />
        <CategoryDistributionCard categories={categoryDistribution} />
      </div>
    </div>
  );
}
