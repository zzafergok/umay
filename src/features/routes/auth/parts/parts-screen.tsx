'use client';

import * as React from 'react';
import { Cpu, Package, Plus, Wrench } from 'lucide-react';
import { Button } from '@/components/core/button';
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
import { PartActivePartsTab } from './part-active-parts-tab';
import { PartDevicesTab } from './part-devices-tab';
import { PartEquipmentDialog } from './part-equipment-dialog';
import { PartFormDialog } from './part-form-dialog';
import { PartSparesTab } from './part-spares-tab';
import { ReplacePartDialog } from './replace-part-dialog';

type PartsTabKey = 'devices' | 'active' | 'spares';

export function PartsScreen() {
  const { data, isLoading } = usePartsQuery();

  const [activeTab, setActiveTab] = React.useState<PartsTabKey>('devices');
  const [statusFilter, setStatusFilter] = React.useState<'all' | PartStatus>(
    'all',
  );
  const [formOpen, setFormOpen] = React.useState(false);
  const [defaultParentId, setDefaultParentId] = React.useState<string>();
  const [equipmentOpen, setEquipmentOpen] = React.useState(false);
  const [equipmentDefaultKind, setEquipmentDefaultKind] = React.useState<
    'device' | 'spare'
  >('device');
  const [editingEquipment, setEditingEquipment] =
    React.useState<EquipmentItem | null>(null);
  const [replaceTarget, setReplaceTarget] = React.useState<Part | null>(null);

  const { data: equipmentItems = [] } = useEquipmentQuery(true);
  const { data: categories = [] } = useCategoriesQuery(true);
  const { data: locations = [] } = useLocationsQuery(true);

  const devices = React.useMemo(
    () => equipmentItems.filter((item) => item.kind === 'device'),
    [equipmentItems],
  );
  const spares = React.useMemo(
    () => equipmentItems.filter((item) => item.kind === 'spare'),
    [equipmentItems],
  );
  const equipmentMap = React.useMemo(
    () => new Map(equipmentItems.map((i) => [i.id, i])),
    [equipmentItems],
  );

  const { partsByDeviceId, linkedCountBySpareId } = React.useMemo(() => {
    const byDevice = new Map<string, Part[]>();
    const bySpare = new Map<string, number>();
    for (const part of data?.parts ?? []) {
      if (part.parentItemId) {
        const list = byDevice.get(part.parentItemId) ?? [];
        list.push(part);
        byDevice.set(part.parentItemId, list);
      }
      if (part.spareItemId) {
        bySpare.set(part.spareItemId, (bySpare.get(part.spareItemId) ?? 0) + 1);
      }
    }
    return { partsByDeviceId: byDevice, linkedCountBySpareId: bySpare };
  }, [data?.parts]);

  const filteredParts = React.useMemo(() => {
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

  const allPartsCount = data?.parts?.length ?? 0;

  const openCreateEquipment = (kind: 'device' | 'spare') => {
    setEditingEquipment(null);
    setEquipmentDefaultKind(kind);
    setEquipmentOpen(true);
  };

  const openEditEquipment = (item: EquipmentItem) => {
    setEditingEquipment(item);
    setEquipmentDefaultKind(item.kind);
    setEquipmentOpen(true);
  };

  const openAddPart = (deviceId?: string) => {
    setDefaultParentId(deviceId);
    setFormOpen(true);
  };

  const actionLabel =
    activeTab === 'devices'
      ? 'Cihaz Ekle'
      : activeTab === 'active'
        ? 'Aktif Parça Ekle'
        : 'Yedek Parça Ekle';

  const handlePrimaryAction = () => {
    if (activeTab === 'devices') openCreateEquipment('device');
    else if (activeTab === 'active') openAddPart();
    else openCreateEquipment('spare');
  };

  return (
    <div className="space-y-5 md:space-y-6">
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as PartsTabKey)}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="h-auto w-full max-w-full flex-wrap justify-start sm:w-fit">
            <TabsTrigger value="devices" className="gap-1.5">
              <Cpu className="h-3.5 w-3.5" aria-hidden="true" />
              Cihazlar ({devices.length})
            </TabsTrigger>
            <TabsTrigger value="active" className="gap-1.5">
              <Wrench className="h-3.5 w-3.5" aria-hidden="true" />
              Aktif Parçalar ({allPartsCount})
            </TabsTrigger>
            <TabsTrigger value="spares" className="gap-1.5">
              <Package className="h-3.5 w-3.5" aria-hidden="true" />
              Yedek Parçalar ({spares.length})
            </TabsTrigger>
          </TabsList>

          <Button
            type="button"
            onClick={handlePrimaryAction}
            className="min-h-[44px] w-full shrink-0 sm:min-h-0 sm:w-auto"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            {actionLabel}
          </Button>
        </div>

        <TabsContent value="devices" className="pt-2">
          <PartDevicesTab
            devices={devices}
            partsByDeviceId={partsByDeviceId}
            categories={categories}
            locations={locations}
            onCreateDeviceClick={() => openCreateEquipment('device')}
            onEditDeviceClick={openEditEquipment}
            onAddPartForDevice={(deviceId) => openAddPart(deviceId)}
            onReplacePartClick={setReplaceTarget}
          />
        </TabsContent>

        <TabsContent value="active" className="pt-2">
          <PartActivePartsTab
            parts={filteredParts}
            allPartsCount={allPartsCount}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            equipmentMap={equipmentMap}
            isLoading={isLoading}
            onCreateClick={() => openAddPart()}
            onReplaceClick={setReplaceTarget}
          />
        </TabsContent>

        <TabsContent value="spares" className="pt-2">
          <PartSparesTab
            spares={spares}
            linkedCountBySpareId={linkedCountBySpareId}
            categories={categories}
            locations={locations}
            onCreateSpareClick={() => openCreateEquipment('spare')}
            onEditSpareClick={openEditEquipment}
          />
        </TabsContent>
      </Tabs>

      <PartFormDialog
        open={formOpen}
        onOpenChange={(nextOpen) => {
          setFormOpen(nextOpen);
          if (!nextOpen) setDefaultParentId(undefined);
        }}
        equipment={equipmentItems}
        defaultParentItemId={defaultParentId}
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
        defaultKind={equipmentDefaultKind}
      />
      <ReplacePartDialog
        part={replaceTarget}
        onClose={() => setReplaceTarget(null)}
      />
    </div>
  );
}
