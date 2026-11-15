'use client';

import * as React from 'react';
import { Plus, Wrench } from 'lucide-react';
import { Button } from '@/components/core/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/core/empty';
import type { Part, PartStatus } from '@/features/inventory/types';
import { useItemsQuery, usePartsQuery } from '@/hooks/use-inventory-hooks';
import { PartCard } from './part-card';
import { PartFormDialog } from './part-form-dialog';
import { ReplacePartDialog } from './replace-part-dialog';

export function PartsScreen() {
  const { data, isLoading } = usePartsQuery();
  const { data: items = [] } = useItemsQuery();
  const [statusFilter, setStatusFilter] = React.useState<'all' | PartStatus>(
    'all',
  );
  const [formOpen, setFormOpen] = React.useState(false);
  const [replaceTarget, setReplaceTarget] = React.useState<Part | null>(null);

  const itemMap = React.useMemo(
    () => new Map(items.map((i) => [i.id, i])),
    [items],
  );

  const parts = React.useMemo(() => {
    const list = data?.parts ?? [];
    const order: Record<PartStatus, number> = {
      overdue: 0,
      due_soon: 1,
      ok: 2,
    };
    return [...list]
      .filter((p) => statusFilter === 'all' || p.status === statusFilter)
      .sort((a, b) => order[a.status] - order[b.status]);
  }, [data?.parts, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {(
            [
              { key: 'all', label: 'Tümü' },
              { key: 'overdue', label: 'Geciken' },
              { key: 'due_soon', label: 'Yaklaşan' },
              { key: 'ok', label: 'İyi' },
            ] as const
          ).map((tab) => (
            <Button
              key={tab.key}
              size="sm"
              variant={statusFilter === tab.key ? 'default' : 'outline'}
              onClick={() => setStatusFilter(tab.key)}
            >
              {tab.label}
            </Button>
          ))}
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" />
          Parça Ekle
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Parçalar yükleniyor...</p>
      ) : parts.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Wrench />
            </EmptyMedia>
            <EmptyTitle>Takip edilen parça yok</EmptyTitle>
            <EmptyDescription>
              Su arıtma filtresi, pil veya fırça gibi ömürlü parçalarını ekle.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button size="sm" onClick={() => setFormOpen(true)}>
              Parça Ekle
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {parts.map((part) => (
            <PartCard
              key={part.id}
              part={part}
              parentItem={
                part.parentItemId ? itemMap.get(part.parentItemId) : undefined
              }
              spareItem={
                part.spareItemId ? itemMap.get(part.spareItemId) : undefined
              }
              onReplaceClick={setReplaceTarget}
            />
          ))}
        </div>
      )}

      <PartFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        items={items}
      />
      <ReplacePartDialog
        part={replaceTarget}
        onClose={() => setReplaceTarget(null)}
      />
    </div>
  );
}
