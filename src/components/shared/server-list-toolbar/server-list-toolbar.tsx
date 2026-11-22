'use client';

import { Loader2, RotateCcw, Search, X } from 'lucide-react';
import { Badge } from '@/components/core/badge';
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
import type { ServerListToolbarProps } from './types';

export function ServerListToolbar({
  tabs,
  search,
  filters = [],
  countLabel,
  hasActiveFilters = false,
  resetLabel = 'Filtreleri sıfırla',
  onResetFilters,
  actions,
}: ServerListToolbarProps) {
  return (
    <div className="space-y-3">
      {tabs || countLabel || hasActiveFilters || actions ? (
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          {tabs ? (
            <Tabs value={tabs.value} onValueChange={tabs.onChange}>
              <TabsList className="h-auto w-full max-w-full flex-wrap justify-start sm:w-fit">
                {tabs.options.map((option) => (
                  <TabsTrigger key={option.value} value={option.value}>
                    {option.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          ) : (
            <div />
          )}

          <div className="flex flex-wrap items-center gap-2">
            {countLabel ? (
              <Badge
                variant="secondary"
                size="sm"
                className="font-mono tabular-nums"
              >
                {countLabel}
              </Badge>
            ) : null}
            {hasActiveFilters && onResetFilters ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onResetFilters}
              >
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                {resetLabel}
              </Button>
            ) : null}
            {actions}
          </div>
        </div>
      ) : null}

      {search || filters.length > 0 ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          {search ? (
            <InputGroup className="w-full sm:min-w-[260px] sm:flex-1">
              <InputGroupAddon align="inline-start">
                {search.isLoading ? (
                  <Loader2
                    className="h-4 w-4 animate-spin text-accent"
                    aria-hidden="true"
                  />
                ) : (
                  <Search className="h-4 w-4" aria-hidden="true" />
                )}
              </InputGroupAddon>
              <InputGroupInput
                value={search.value}
                onChange={(e) => search.onChange(e.target.value)}
                placeholder={search.placeholder}
                aria-label={search.ariaLabel}
                className="text-body-sm"
              />
              {search.value ? (
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    size="icon-xs"
                    aria-label={search.clearAriaLabel ?? 'Aramayı temizle'}
                    onClick={() => search.onChange('')}
                  >
                    <X className="h-3.5 w-3.5" />
                  </InputGroupButton>
                </InputGroupAddon>
              ) : null}
            </InputGroup>
          ) : null}

          {filters.map((filter) => (
            <Select
              key={filter.key}
              value={filter.value}
              onValueChange={filter.onChange}
            >
              <SelectTrigger
                aria-label={filter.ariaLabel}
                className={filter.widthClass ?? 'w-full shrink-0 sm:w-[180px]'}
              >
                <SelectValue placeholder={filter.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {filter.options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
        </div>
      ) : null}
    </div>
  );
}
