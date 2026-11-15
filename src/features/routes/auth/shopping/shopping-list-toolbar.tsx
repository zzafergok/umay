'use client';

import { Search, Trash2, X } from 'lucide-react';
import { Button } from '@/components/core/button';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/core/input-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/core/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/core/tabs';
import type {
  ShoppingPriorityFilter,
  ShoppingStatusFilter,
  ShoppingSummary,
} from './shopping-utils';

interface ShoppingListToolbarProps {
  summary: ShoppingSummary;
  statusFilter: ShoppingStatusFilter;
  priorityFilter: ShoppingPriorityFilter;
  searchQuery: string;
  isClearingDone: boolean;
  onStatusChange: (value: ShoppingStatusFilter) => void;
  onPriorityChange: (value: ShoppingPriorityFilter) => void;
  onSearchChange: (value: string) => void;
  onClearDone: () => void;
}

export function ShoppingListToolbar({
  summary,
  statusFilter,
  priorityFilter,
  searchQuery,
  isClearingDone,
  onStatusChange,
  onPriorityChange,
  onSearchChange,
  onClearDone,
}: ShoppingListToolbarProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <Tabs
          value={statusFilter}
          onValueChange={(value) =>
            onStatusChange(value as ShoppingStatusFilter)
          }
        >
          <TabsList className="h-auto w-full max-w-full flex-wrap justify-start sm:w-fit">
            <TabsTrigger value="all">Tümü ({summary.totalCount})</TabsTrigger>
            <TabsTrigger value="pending">
              Alınacak ({summary.pendingCount})
            </TabsTrigger>
            <TabsTrigger value="done">Alınan ({summary.doneCount})</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <InputGroup className="w-full sm:min-w-[280px] sm:flex-1 xl:w-80 xl:flex-none">
            <InputGroupAddon align="inline-start">
              <Search className="h-4 w-4" aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Ürün, kategori veya mağaza ara"
              aria-label="Alışveriş listesinde ara"
              className="text-body-sm"
            />
            {searchQuery && (
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  aria-label="Aramayı temizle"
                  onClick={() => onSearchChange('')}
                >
                  <X className="h-3.5 w-3.5" />
                </InputGroupButton>
              </InputGroupAddon>
            )}
          </InputGroup>

          <Select
            value={priorityFilter}
            onValueChange={(value) =>
              onPriorityChange(value as ShoppingPriorityFilter)
            }
          >
            <SelectTrigger
              aria-label="Öncelik filtresi"
              className="w-full shrink-0 whitespace-nowrap sm:w-auto sm:min-w-[180px]"
            >
              <SelectValue placeholder="Tüm Öncelikler" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Öncelikler</SelectItem>
              <SelectItem value="high">Acil</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="low">Düşük</SelectItem>
            </SelectContent>
          </Select>

          {summary.doneCount > 0 && (
            <Button
              type="button"
              variant="outline"
              size="default"
              className="w-full shrink-0 whitespace-nowrap sm:w-auto"
              disabled={isClearingDone}
              onClick={onClearDone}
            >
              <Trash2 className="mr-1.5 h-4 w-4" />
              Alınanları Temizle
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
