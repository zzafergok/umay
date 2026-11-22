'use client';

import { Activity, Plus, ShoppingCart, Wrench } from 'lucide-react';
import { Button } from '@/components/core/button';
import { Link } from '@/components/core/link';

export function QuickActionsBar() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-0.5">
        <h1 className="text-heading font-heading text-text">Envanter Özeti</h1>
        <p className="text-body-sm text-text-muted">
          Stok sağlığı, parça ömrü ve son hareketlerin anlık görünümü
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
        <Button
          asChild
          size="sm"
          variant="primary"
          className="min-h-[40px] sm:min-h-0"
        >
          <Link href="/items?new=1">
            <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Ürün ekle
          </Link>
        </Button>
        <Button
          asChild
          size="sm"
          variant="secondary"
          className="min-h-[40px] sm:min-h-0"
        >
          <Link href="/parts">
            <Wrench className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Parçalar
          </Link>
        </Button>
        <Button
          asChild
          size="sm"
          variant="secondary"
          className="min-h-[40px] sm:min-h-0"
        >
          <Link href="/shopping">
            <ShoppingCart className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Alışveriş
          </Link>
        </Button>
        <Button
          asChild
          size="sm"
          variant="ghost"
          className="col-span-2 min-h-[40px] sm:col-span-1 sm:min-h-0"
        >
          <Link href="/activity">
            <Activity className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Hareketler
          </Link>
        </Button>
      </div>
    </div>
  );
}
