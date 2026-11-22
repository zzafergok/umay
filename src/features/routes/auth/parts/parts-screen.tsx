'use client';

import * as React from 'react';
import { Cpu, Plus, Wrench } from 'lucide-react';
import { Button } from '@/components/core/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/core/empty';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/core/tabs';
import type {
  EquipmentItem,
  Part,
  PartStatus,
} from '@/features/inventory/types';
import {
  useCategoriesQuery,
  useEquipmentQuery,
  useLocationsQuery,
  usePartsQuery,
} from '@/hooks/use-inventory-hooks';
import { PartCard } from './part-card';
import { PartEquipmentDialog } from './part-equipment-dialog';
import { PartEquipmentTab } from './part-equipment-tab';
import { PartFormDialog } from './part-form-dialog';
import { ReplacePartDialog } from './replace-part-dialog';

export function PartsScreen() {
  const { data, isLoading } = usePartsQuery();

  const [activeTab, setActiveTab] = React.useState<'parts' | 'equipment'>(
    'parts',
  );
  const [statusFilter, setStatusFilter] = React.useState<'all' | PartStatus>(
    'all',
  );
  const [formOpen, setFormOpen] = React.useState(false);
  const [equipmentOpen, setEquipmentOpen] = React.useState(false);
  const [editingEquipment, setEditingEquipment] =
    React.useState<EquipmentItem | null>(null);
  const [replaceTarget, setReplaceTarget] = React.useState<Part | null>(null);

  const needsEquipmentMeta = activeTab === 'equipment' || equipmentOpen;
  const hasLinkedEquipment = (data?.parts ?? []).some((p) =>
    Boolean(p.parentItemId || p.spareItemId),
  );
  const needsEquipment = needsEquipmentMeta || formOpen || hasLinkedEquipment;

  const { data: equipmentItems = [] } = useEquipmentQuery(needsEquipment);
  const { data: categories = [] } = useCategoriesQuery(needsEquipmentMeta);
  const { data: locations = [] } = useLocationsQuery(needsEquipmentMeta);

  const equipmentMap = React.useMemo(
    () => new Map(equipmentItems.map((i) => [i.id, i])),
    [equipmentItems],
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

  const totalPartsCount = data?.parts?.length ?? 0;
  const hasParts = !isLoading && totalPartsCount > 0;

  return (
    <div className="space-y-5 md:space-y-6">
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as 'parts' | 'equipment')}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="h-auto w-full max-w-full flex-wrap justify-start sm:w-fit">
            <TabsTrigger value="parts" className="gap-1.5">
              <Wrench className="h-3.5 w-3.5" aria-hidden="true" />
              Ömürlü Parçalar ({totalPartsCount})
            </TabsTrigger>
            <TabsTrigger value="equipment" className="gap-1.5">
              <Cpu className="h-3.5 w-3.5" aria-hidden="true" />
              Cihaz &amp; Yedek Ürünler ({equipmentItems.length})
            </TabsTrigger>
          </TabsList>

          {activeTab === 'parts' && hasParts ? (
            <Button
              type="button"
              onClick={() => setFormOpen(true)}
              className="min-h-[44px] w-full shrink-0 sm:min-h-0 sm:w-auto"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Parça Ekle
            </Button>
          ) : activeTab === 'equipment' && equipmentItems.length > 0 ? (
            <Button
              type="button"
              onClick={() => {
                setEditingEquipment(null);
                setEquipmentOpen(true);
              }}
              className="min-h-[44px] w-full shrink-0 sm:min-h-0 sm:w-auto"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Cihaz / Yedek Ekle
            </Button>
          ) : null}
        </div>

        <TabsContent value="parts" className="space-y-5 pt-2">
          {hasParts ? (
            <div className="grid w-full grid-cols-4 gap-1 rounded-xl border border-border bg-surface-sunken p-1 sm:inline-flex sm:w-auto sm:flex-wrap sm:gap-1.5">
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
                  type="button"
                  size="sm"
                  variant={statusFilter === tab.key ? 'default' : 'ghost'}
                  onClick={() => setStatusFilter(tab.key)}
                  className="min-h-[40px] truncate px-2 text-xs sm:min-h-0 sm:px-3"
                >
                  {tab.label}
                </Button>
              ))}
            </div>
          ) : null}

          {isLoading ? (
            <p className="text-sm text-muted-foreground">
              Parçalar yükleniyor...
            </p>
          ) : totalPartsCount === 0 ? (
            <Empty className="border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Wrench />
                </EmptyMedia>
                <EmptyTitle>Takip edilen parça yok</EmptyTitle>
                <EmptyDescription>
                  Su arıtma filtresi, pil veya fırça gibi ömürlü parçalarını
                  ekle.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button size="sm" onClick={() => setFormOpen(true)}>
                  <Plus className="mr-1.5 h-4 w-4" />
                  Parça Ekle
                </Button>
              </EmptyContent>
            </Empty>
          ) : parts.length === 0 ? (
            <Empty className="border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Wrench />
                </EmptyMedia>
                <EmptyTitle>Bu filtrede parça yok</EmptyTitle>
                <EmptyDescription>
                  Seçili durum filtresine uyan parça bulunamadı.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setStatusFilter('all')}
                >
                  Tümünü Göster
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
                    part.parentItemId
                      ? equipmentMap.get(part.parentItemId)
                      : undefined
                  }
                  spareItem={
                    part.spareItemId
                      ? equipmentMap.get(part.spareItemId)
                      : undefined
                  }
                  onReplaceClick={setReplaceTarget}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="equipment" className="pt-2">
          <PartEquipmentTab
            equipmentItems={equipmentItems}
            categories={categories}
            locations={locations}
            onCreateClick={() => {
              setEditingEquipment(null);
              setEquipmentOpen(true);
            }}
            onEditClick={(item) => {
              setEditingEquipment(item);
              setEquipmentOpen(true);
            }}
          />
        </TabsContent>
      </Tabs>

      <PartFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        equipment={equipmentItems}
      />
      <PartEquipmentDialog
        open={equipmentOpen}
        onOpenChange={(nextOpen) => {
          setEquipmentOpen(nextOpen);
          if (!nextOpen) setEditingEquipment(null);
        }}
        categories={categories}
        locations={locations}
        editItem={editingEquipment}
      />
      <ReplacePartDialog
        part={replaceTarget}
        onClose={() => setReplaceTarget(null)}
      />
    </div>
  );
}
