'use client';

import { LayoutGrid, List, Plus, RotateCcw, Search, X } from 'lucide-react';
import { Button } from '@/components/core/button';
import { Input } from '@/components/core/input';
import { Separator } from '@/components/core/separator';
import { cn } from '@/lib/utils';
import { CompactFilterSelect } from './compact-filter-select';
import type { ItemsFilterToolbarProps } from './types';

const COMPACT_FILTER_BASE =
  'h-9 min-h-[36px] md:h-7 md:min-h-[28px] rounded-sm px-2.5 text-caption font-medium transition-colors';
const ACTIVE_FILTER_CLASS = cn(
  COMPACT_FILTER_BASE,
  'bg-accent-subtle text-accent hover:bg-accent-subtle/80 hover:text-accent',
);
const INACTIVE_FILTER_CLASS = cn(
  COMPACT_FILTER_BASE,
  'text-text-muted hover:bg-surface hover:text-text',
);

const VIEW_MODES = [
  { mode: 'grid', label: 'Kart görünümü', Icon: LayoutGrid },
  { mode: 'table', label: 'Tablo görünümü', Icon: List },
] as const;

/** Unified compact filter bar, view-mode switcher, and create action bar for ItemsScreen. */
export function ItemsFilterToolbar({
  search,
  onSearchChange,
  viewMode,
  onToggleViewMode,
  showCreateButton = true,
  onCreateClick,
  lowStockOnly,
  onToggleLowStock,
  expiringOnly,
  onToggleExpiring,
  categoryFilter,
  onCategoryFilterChange,
  locationFilter,
  onLocationFilterChange,
  categories,
  locations,
}: ItemsFilterToolbarProps) {
  const hasActiveFilters =
    Boolean(search.trim()) ||
    lowStockOnly ||
    expiringOnly ||
    categoryFilter !== 'all' ||
    locationFilter !== 'all';

  const handleResetFilters = () => {
    if (search) onSearchChange('');
    if (lowStockOnly) onToggleLowStock();
    if (expiringOnly) onToggleExpiring();
    if (categoryFilter !== 'all') onCategoryFilterChange('all');
    if (locationFilter !== 'all') onLocationFilterChange('all');
  };

  const quickToggles = [
    {
      key: 'low-stock',
      label: 'Düşük stok',
      active: lowStockOnly,
      onToggle: onToggleLowStock,
    },
    {
      key: 'expiring',
      label: 'SKT yaklaşan',
      active: expiringOnly,
      onToggle: onToggleExpiring,
    },
  ];

  return (
    <div className="flex flex-col gap-2.5 xl:flex-row xl:items-center xl:justify-between">
      <div
        role="search"
        aria-label="Ürün filtreleri"
        className="bg-surface-sunken focus-within:border-border-strong flex min-w-0 flex-1 flex-col rounded-lg border border-border transition-[color,box-shadow] has-[[data-slot=input]:focus-visible]:border-accent has-[[data-slot=input]:focus-visible]:ring-2 has-[[data-slot=input]:focus-visible]:ring-accent/20 lg:min-h-[40px] lg:flex-row lg:items-center"
      >
        <div className="flex min-w-0 flex-1 items-center gap-2 px-3">
          <Search
            className="text-text-muted h-4 w-4 shrink-0"
            aria-hidden="true"
          />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Ürün, marka, barkod veya etiket ara..."
            aria-label="Ürün, marka, barkod veya etiket ara"
            className="text-body-sm h-10 min-h-[40px] flex-1 border-0 bg-transparent px-0 py-1 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 md:h-9 md:min-h-[36px]"
          />
          {search && (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => onSearchChange('')}
              aria-label="Aramayı temizle"
              className="text-text-muted hover:text-text size-9 shrink-0 rounded-sm md:size-6"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
          )}
        </div>

        <Separator orientation="horizontal" className="bg-border lg:hidden" />
        <Separator
          orientation="vertical"
          className="hidden h-5 bg-border lg:block"
        />

        <div className="flex flex-wrap items-center gap-1 p-1 lg:flex-nowrap lg:py-1 lg:pl-1.5 lg:pr-1">
          {quickToggles.map((toggle) => (
            <Button
              key={toggle.key}
              type="button"
              variant="ghost"
              size="xs"
              aria-pressed={toggle.active}
              onClick={toggle.onToggle}
              className={cn(
                'shrink-0',
                toggle.active ? ACTIVE_FILTER_CLASS : INACTIVE_FILTER_CLASS,
              )}
            >
              {toggle.label}
            </Button>
          ))}

          <Separator
            orientation="vertical"
            className="mx-0.5 hidden h-4 bg-border sm:block"
          />

          <CompactFilterSelect
            value={categoryFilter}
            onValueChange={onCategoryFilterChange}
            allLabel="Tüm kategoriler"
            ariaLabel="Kategori filtresi"
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
            activeClassName={ACTIVE_FILTER_CLASS}
            inactiveClassName={INACTIVE_FILTER_CLASS}
            maxWidthClass="sm:max-w-[165px]"
          />

          <CompactFilterSelect
            value={locationFilter}
            onValueChange={onLocationFilterChange}
            allLabel="Tüm konumlar"
            ariaLabel="Konum filtresi"
            options={locations.map((l) => ({
              value: l.id,
              label: l.path.join(' > '),
            }))}
            activeClassName={ACTIVE_FILTER_CLASS}
            inactiveClassName={INACTIVE_FILTER_CLASS}
            maxWidthClass="sm:max-w-[175px]"
          />

          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={handleResetFilters}
              aria-label="Tüm filtreleri temizle"
              title="Filtreleri temizle"
              className="text-text-muted hover:bg-surface hover:text-text size-9 shrink-0 rounded-sm md:size-7"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
          )}
        </div>
      </div>

      <div className="hidden shrink-0 items-center justify-end gap-2 md:flex">
        <div
          role="group"
          aria-label="Görünüm modu"
          className="bg-surface-sunken inline-flex h-10 items-center gap-0.5 rounded-lg border border-border p-1"
        >
          {VIEW_MODES.map(({ mode, label, Icon }) => {
            const active = viewMode === mode;
            return (
              <Button
                key={mode}
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label={label}
                aria-pressed={active}
                onClick={() => {
                  if (!active) onToggleViewMode();
                }}
                className={cn(
                  'size-7 rounded-sm',
                  active
                    ? 'bg-surface text-text hover:bg-surface'
                    : 'text-text-muted hover:text-text',
                )}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              </Button>
            );
          })}
        </div>

        {showCreateButton ? (
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onCreateClick}
            className="h-10 min-h-[40px] px-3.5"
          >
            <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Ürün ekle
          </Button>
        ) : null}
      </div>
    </div>
  );
}
