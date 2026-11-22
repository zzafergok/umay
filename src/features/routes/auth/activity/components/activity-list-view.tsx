'use client';

import { RotateCcw } from 'lucide-react';
import { Badge } from '@/components/core/badge';
import { Button } from '@/components/core/button';
import {
  SortableTableHead,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  type TableSortOrder,
} from '@/components/core/table';
import { UmayEmptyIllustration } from '@/components/shared/umay-brand';
import type { MovementSortField } from '@/features/inventory/schemas';
import {
  formatActivityDelta,
  formatActivityNumber,
  MOVEMENT_TYPE_META,
} from '../activity-utils';
import type { EnrichedMovement } from '../types';

interface ActivityListViewProps {
  entries: EnrichedMovement[];
  hasAnyMovements: boolean;
  sortBy?: MovementSortField;
  sortOrder?: TableSortOrder;
  onSort: (column: MovementSortField) => void;
  onResetFilters: () => void;
}

const DATE_FORMAT = new Intl.DateTimeFormat('tr-TR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  timeZone: 'Europe/Istanbul',
});

function formatMovementDate(iso: string): string {
  const parsed = Date.parse(iso);
  if (Number.isNaN(parsed)) return iso;
  return DATE_FORMAT.format(new Date(parsed));
}

export function ActivityListView({
  entries,
  hasAnyMovements,
  sortBy,
  sortOrder,
  onSort,
  onResetFilters,
}: ActivityListViewProps) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-dashed border-border bg-surface-sunken/30 py-10 text-center">
        <UmayEmptyIllustration className="h-20 w-20" />
        <div className="space-y-1 px-4">
          <p className="text-body-sm font-medium text-text">
            {hasAnyMovements
              ? 'Filtrelerle eşleşen hareket bulunamadı'
              : 'Henüz hareket kaydı yok'}
          </p>
          <p className="text-caption text-text-muted">
            {hasAnyMovements
              ? 'Arama terimini veya seçili filtreleri değiştirerek tekrar deneyebilirsiniz.'
              : 'Ürün ekleyip stok giriş/çıkışı yaptıkça işlem geçmişi burada listelenir.'}
          </p>
        </div>
        {hasAnyMovements ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onResetFilters}
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
            Filtreleri temizle
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2.5 md:hidden">
        {entries.map(({ movement, itemName, itemUnit }) => {
          const typeMeta = MOVEMENT_TYPE_META[movement.type];
          const deltaTone =
            movement.delta > 0
              ? 'success'
              : movement.delta < 0
                ? 'warning'
                : 'secondary';
          return (
            <div
              key={movement.id}
              className="flex items-start justify-between gap-3 rounded-md border border-border bg-surface p-3"
            >
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="truncate text-body-sm font-semibold text-text">
                    {itemName}
                  </p>
                  <Badge variant={typeMeta.variant} size="sm">
                    {typeMeta.label}
                  </Badge>
                </div>
                <p className="text-caption text-text-muted">
                  {movement.reason || typeMeta.label}
                </p>
                <p className="font-mono text-2xs tabular-nums text-text-subtle">
                  {formatMovementDate(movement.at)}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <Badge variant={deltaTone} className="font-mono tabular-nums">
                  {formatActivityDelta(movement.delta)}
                </Badge>
                <span className="font-mono text-2xs tabular-nums text-text-muted">
                  Son: {formatActivityNumber(movement.quantityAfter)}
                  {itemUnit ? ` ${itemUnit}` : ''}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="hidden overflow-x-auto rounded-md border border-border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableTableHead
                sortKey="at"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={onSort}
              >
                Tarih
              </SortableTableHead>
              <SortableTableHead
                sortKey="itemName"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={onSort}
              >
                Ürün
              </SortableTableHead>
              <SortableTableHead
                sortKey="type"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={onSort}
              >
                İşlem Türü
              </SortableTableHead>
              <TableHead>Açıklama</TableHead>
              <SortableTableHead
                sortKey="delta"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={onSort}
                align="right"
              >
                Değişim
              </SortableTableHead>
              <SortableTableHead
                sortKey="quantityAfter"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={onSort}
                align="right"
              >
                Son Miktar
              </SortableTableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map(({ movement, itemName, itemUnit }) => {
              const typeMeta = MOVEMENT_TYPE_META[movement.type];
              const deltaTone =
                movement.delta > 0
                  ? 'success'
                  : movement.delta < 0
                    ? 'warning'
                    : 'secondary';
              return (
                <TableRow key={movement.id}>
                  <TableCell className="whitespace-nowrap font-mono text-caption tabular-nums text-text-muted">
                    {formatMovementDate(movement.at)}
                  </TableCell>
                  <TableCell className="font-medium text-text">
                    {itemName}
                  </TableCell>
                  <TableCell>
                    <Badge variant={typeMeta.variant} size="sm">
                      {typeMeta.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-text-muted">
                    {movement.reason || typeMeta.label}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={deltaTone}
                      className="font-mono tabular-nums"
                    >
                      {formatActivityDelta(movement.delta)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums text-text">
                    {formatActivityNumber(movement.quantityAfter)}
                    {itemUnit ? (
                      <span className="ml-1 text-caption text-text-muted">
                        {itemUnit}
                      </span>
                    ) : null}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
