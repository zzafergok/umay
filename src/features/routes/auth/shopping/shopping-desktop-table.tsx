'use client';

import { Checkbox } from '@/components/core/checkbox';
import {
  SortableTableHead,
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  type TableSortOrder,
} from '@/components/core/table';
import type { ShoppingSortField } from '@/features/inventory/schemas';
import type {
  Category,
  CurrencyCode,
  Item,
  ShoppingListItem,
} from '@/features/inventory/types';
import { ShoppingListRow } from '@/features/routes/auth/shopping/shopping-list-row';

interface ShoppingDesktopTableProps {
  entries: ShoppingListItem[];
  itemMap: Map<string, Item>;
  categoryMap: Map<string, Category>;
  currency: CurrencyCode;
  headerDoneState: boolean | 'indeterminate';
  allPageDone: boolean;
  isBulkUpdatingDone: boolean;
  sortBy?: ShoppingSortField;
  sortOrder?: TableSortOrder;
  onSort: (column: ShoppingSortField, defaultOrder?: TableSortOrder) => void;
  onBulkToggleDone: (entries: ShoppingListItem[], nextDone: boolean) => void;
  onToggleDone: (entry: ShoppingListItem) => void;
  onAdjustQty: (entry: ShoppingListItem, delta: number) => void;
  onEdit: (entry: ShoppingListItem) => void;
  onDelete: (id: string) => void;
}

export function ShoppingDesktopTable({
  entries,
  itemMap,
  categoryMap,
  currency,
  headerDoneState,
  allPageDone,
  isBulkUpdatingDone,
  sortBy,
  sortOrder,
  onSort,
  onBulkToggleDone,
  onToggleDone,
  onAdjustQty,
  onEdit,
  onDelete,
}: ShoppingDesktopTableProps) {
  return (
    <div className="hidden overflow-hidden rounded-md border border-border md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <SortableTableHead
              sortKey="done"
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={(col) => onSort(col, 'asc')}
              className="w-28"
              leadingControl={
                <Checkbox
                  checked={headerDoneState}
                  disabled={isBulkUpdatingDone || entries.length === 0}
                  onCheckedChange={() =>
                    onBulkToggleDone(entries, !allPageDone)
                  }
                  aria-label={
                    allPageDone
                      ? 'Sayfadaki tüm kalemlerin alındı işaretini kaldır'
                      : 'Sayfadaki tüm kalemleri alındı işaretle'
                  }
                />
              }
            >
              Alındı
            </SortableTableHead>
            <SortableTableHead
              sortKey="title"
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={(col) => onSort(col, 'asc')}
            >
              Ürün &amp; Detaylar
            </SortableTableHead>
            <SortableTableHead
              sortKey="priority"
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={(col) => onSort(col, 'asc')}
            >
              Öncelik
            </SortableTableHead>
            <SortableTableHead
              sortKey="qty"
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={(col) => onSort(col, 'desc')}
            >
              Miktar
            </SortableTableHead>
            <SortableTableHead
              sortKey="total"
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={(col) => onSort(col, 'desc')}
              align="right"
            >
              Tutar
            </SortableTableHead>
            <TableHead className="text-right">İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <ShoppingListRow
              key={entry.id}
              entry={entry}
              itemMap={itemMap}
              categoryMap={categoryMap}
              currency={currency}
              onToggleDone={onToggleDone}
              onAdjustQty={onAdjustQty}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
