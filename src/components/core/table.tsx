'use client';

import * as React from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/core/button';
import { cn } from '@/lib/utils';

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div data-slot="table-container" className="relative w-full overflow-x-auto">
    <table
      ref={ref}
      data-slot="table"
      className={cn('w-full caption-bottom text-body-sm', className)}
      {...props}
    />
  </div>
));
Table.displayName = 'Table';

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    data-slot="table-header"
    className={cn(
      'sticky top-0 z-10 bg-surface-sunken [&_tr]:border-b [&_tr]:border-border',
      className,
    )}
    {...props}
  />
));
TableHeader.displayName = 'TableHeader';

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    data-slot="table-body"
    className={cn('[&_tr:last-child]:border-0', className)}
    {...props}
  />
));
TableBody.displayName = 'TableBody';

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    data-slot="table-footer"
    className={cn(
      'border-t border-border bg-surface-sunken font-medium text-text [&>tr]:last:border-b-0',
      className,
    )}
    {...props}
  />
));
TableFooter.displayName = 'TableFooter';

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    data-slot="table-row"
    className={cn(
      'h-11 border-b border-border transition-colors duration-150 hover:bg-surface-sunken/60 data-[state=selected]:bg-accent-subtle',
      className,
    )}
    {...props}
  />
));
TableRow.displayName = 'TableRow';

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    data-slot="table-head"
    className={cn(
      'h-10 whitespace-nowrap px-3 text-start align-middle text-caption font-medium text-text-muted [&:has([role=checkbox])]:pe-0 [&>[role=checkbox]]:translate-y-[2px]',
      className,
    )}
    {...props}
  />
));
TableHead.displayName = 'TableHead';

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    data-slot="table-cell"
    className={cn(
      'whitespace-nowrap px-3 py-2.5 align-middle text-body-sm text-text [&:has([role=checkbox])]:pe-0 [&>[role=checkbox]]:translate-y-[2px]',
      className,
    )}
    {...props}
  />
));
TableCell.displayName = 'TableCell';

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    data-slot="table-caption"
    className={cn('mt-3 text-caption text-text-muted', className)}
    {...props}
  />
));
TableCaption.displayName = 'TableCaption';

export type TableSortOrder = 'asc' | 'desc';

export interface SortableTableHeadProps<TKey extends string = string>
  extends Omit<React.ThHTMLAttributes<HTMLTableCellElement>, 'onSelect'> {
  sortKey: TKey;
  sortBy?: string;
  sortOrder?: TableSortOrder;
  onSort: (key: TKey) => void;
  align?: 'left' | 'right';
}

function SortableTableHead<TKey extends string = string>({
  sortKey,
  sortBy,
  sortOrder = 'desc',
  onSort,
  align = 'left',
  className,
  children,
  ...props
}: SortableTableHeadProps<TKey>) {
  const isActive = sortBy === sortKey;
  const ariaSort = isActive
    ? sortOrder === 'asc'
      ? 'ascending'
      : 'descending'
    : 'none';

  return (
    <TableHead
      aria-sort={ariaSort}
      className={cn(align === 'right' && 'text-right', className)}
      {...props}
    >
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onSort(sortKey)}
        className={cn(
          '-mx-2 h-7 min-h-0 gap-1.5 px-2 text-caption font-medium text-text-muted hover:bg-surface/70 hover:text-text',
          isActive && 'text-text',
          align === 'right' && 'ml-auto flex-row-reverse',
        )}
      >
        <span>{children}</span>
        {isActive ? (
          sortOrder === 'asc' ? (
            <ArrowUp className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
          ) : (
            <ArrowDown className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
          )
        ) : (
          <ArrowUpDown
            className="h-3.5 w-3.5 opacity-45"
            aria-hidden="true"
          />
        )}
      </Button>
    </TableHead>
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  SortableTableHead,
  TableRow,
  TableCell,
  TableCaption,
};
