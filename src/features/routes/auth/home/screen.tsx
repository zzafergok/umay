'use client';

import * as React from 'react';
import {
  AlertTriangle,
  Boxes,
  CalendarClock,
  Plus,
  QrCode,
  ShoppingCart,
  Wrench,
} from 'lucide-react';
import { Button } from '@/components/core/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/core/card';
import { Link } from '@/components/core/link';
import { Stat } from '@/components/core/stat';
import { StatusPill, type StatusTone } from '@/components/core/status-pill';
import {
  useCategoriesQuery,
  useItemsQuery,
  useLocationsQuery,
  useNotificationsQuery,
  usePartsQuery,
} from '@/hooks/use-inventory-hooks';
import { inventoryService } from '@/services/inventory-service';

interface AttentionItem {
  id: string;
  title: string;
  subtitle: string;
  tone: StatusTone;
  badge: string;
  href: string;
  priority: number;
}

export function AuthHomeScreen() {
  const { data: items = [] } = useItemsQuery();
  const { data: partsData } = usePartsQuery();
  const { data: categories = [] } = useCategoriesQuery();
  const { data: locations = [] } = useLocationsQuery();
  const { data: notifications = [] } = useNotificationsQuery();

  React.useEffect(() => {
    inventoryService.refreshParts().catch(() => undefined);
  }, []);

  const parts = partsData?.parts ?? [];
  const lowStockItems = items.filter(
    (i) => i.minQuantity > 0 && i.quantity <= i.minQuantity,
  );
  const dueParts = parts.filter((p) => p.status !== 'ok');

  const [nowMs] = React.useState(() => Date.now());
  const soonWindowMs = 14 * 24 * 60 * 60 * 1000;
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
        subtitle: `Kalan: ${i.quantity} ${i.unit} (Eşik: ${i.minQuantity})`,
        tone: i.quantity <= 0 ? 'out_of_stock' : 'low_stock',
        badge: i.quantity <= 0 ? 'Tükendi' : 'Düşük Stok',
        href: `/items/${i.id}`,
        priority: i.quantity <= 0 ? 1 : 2,
      });
    }
    for (const i of expiringOrWarranty) {
      list.push({
        id: `exp-${i.id}`,
        title: i.name,
        subtitle: i.expiresAt
          ? `SKT: ${new Date(i.expiresAt).toLocaleDateString('tr-TR')}`
          : 'Garanti yaklaşıyor',
        tone: 'due_soon',
        badge: 'SKT / Garanti',
        href: `/items/${i.id}`,
        priority: 3,
      });
    }
    return list.sort((a, b) => a.priority - b.priority).slice(0, 8);
  }, [dueParts, lowStockItems, expiringOrWarranty]);

  const categoryDistribution = React.useMemo(() => {
    const total = Math.max(1, items.length);
    return categories
      .map((cat) => {
        const count = items.filter((i) => i.categoryId === cat.id).length;
        return {
          id: cat.id,
          name: cat.name,
          count,
          percent: Math.round((count / total) * 100),
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [categories, items]);

  const unreadNotifs = notifications.filter((n) => !n.readAt).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Button asChild size="sm">
          <Link href="/items">
            <Plus className="mr-1.5 h-4 w-4" />
            Ürün Ekle
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href="/scan">
            <QrCode className="mr-1.5 h-4 w-4" />
            Barkod Tara
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href="/parts">
            <Wrench className="mr-1.5 h-4 w-4" />
            Parçalar
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href="/shopping">
            <ShoppingCart className="mr-1.5 h-4 w-4" />
            Alışveriş
          </Link>
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Toplam Ürün"
          value={items.length}
          hint={`${locations.length} konum`}
          icon={<Boxes className="h-4 w-4" />}
        />
        <Stat
          label="Düşük Stok"
          value={lowStockItems.length}
          tone={lowStockItems.length > 0 ? 'warning' : 'default'}
          icon={<AlertTriangle className="h-4 w-4" />}
        />
        <Stat
          label="Yaklaşan Parça"
          value={dueParts.length}
          tone={dueParts.some((p) => p.status === 'overdue') ? 'danger' : 'default'}
          hint={unreadNotifs > 0 ? `${unreadNotifs} bildirim` : undefined}
          icon={<Wrench className="h-4 w-4" />}
        />
        <Stat
          label="SKT / Garanti"
          value={expiringOrWarranty.length}
          tone={expiringOrWarranty.length > 0 ? 'warning' : 'default'}
          icon={<CalendarClock className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">
              Bugün İlgilenmen Gerekenler
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {attentionList.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Harika! Bugün acil bir işlem görünmüyor.
              </p>
            ) : (
              attentionList.map((entry) => (
                <Link
                  key={entry.id}
                  href={entry.href}
                  className="flex items-center justify-between gap-3 rounded-sm border border-border p-3 transition-colors hover:bg-muted/40"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{entry.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {entry.subtitle}
                    </p>
                  </div>
                  <StatusPill tone={entry.tone} label={entry.badge} />
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Kategori Dağılımı</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {categoryDistribution.length === 0 ? (
              <p className="text-sm text-muted-foreground">Henüz veri yok.</p>
            ) : (
              categoryDistribution.map((cat) => (
                <div key={cat.id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium">{cat.name}</span>
                    <span className="text-muted-foreground tabular-nums">
                      {cat.count} ({cat.percent}%)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-sm bg-muted">
                    <div
                      className="h-full bg-umay-blue transition-all duration-200"
                      style={{ width: `${cat.percent}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
