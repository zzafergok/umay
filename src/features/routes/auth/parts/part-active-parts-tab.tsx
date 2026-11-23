'use client';

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
import type { EquipmentItem, Part, PartStatus } from '@/features/inventory/types';
import { PartCard } from './part-card';

interface PartActivePartsTabProps {
  parts: Part[];
  allPartsCount: number;
  statusFilter: 'all' | PartStatus;
  onStatusFilterChange: (next: 'all' | PartStatus) => void;
  equipmentMap: Map<string, EquipmentItem>;
  isLoading: boolean;
  onCreateClick: () => void;
  onReplaceClick: (part: Part) => void;
}

export function PartActivePartsTab({
  parts,
  allPartsCount,
  statusFilter,
  onStatusFilterChange,
  equipmentMap,
  isLoading,
  onCreateClick,
  onReplaceClick,
}: PartActivePartsTabProps) {
  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground">Aktif parçalar yükleniyor...</p>
    );
  }

  if (allPartsCount === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Wrench />
          </EmptyMedia>
          <EmptyTitle>Takip edilen aktif parça yok</EmptyTitle>
          <EmptyDescription>
            Cihazlarınıza şu an takılı olan filtre, pil, fırça veya solüsyon
            gibi aktif parçaları ekleyip ömürlerini takip edin.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button size="sm" onClick={onCreateClick}>
            <Plus className="mr-1.5 h-4 w-4" />
            Aktif Parça Ekle
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="space-y-4">
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
            onClick={() => onStatusFilterChange(tab.key)}
            className="min-h-[40px] truncate px-2 text-xs sm:min-h-0 sm:px-3"
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {parts.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Wrench />
            </EmptyMedia>
            <EmptyTitle>Bu filtrede aktif parça yok</EmptyTitle>
            <EmptyDescription>
              Seçili durum filtresine uyan aktif parça bulunamadı.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onStatusFilterChange('all')}
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
                part.spareItemId ? equipmentMap.get(part.spareItemId) : undefined
              }
              onReplaceClick={onReplaceClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
