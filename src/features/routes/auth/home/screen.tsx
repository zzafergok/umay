'use client';

import * as React from 'react';
import {
  useCategoriesQuery,
  useItemsQuery,
  useLocationsQuery,
  useMovementsQuery,
  usePartsQuery,
  useSettingsQuery,
  useShoppingQuery,
} from '@/hooks/use-inventory-hooks';
import { AttentionListCard } from './components/attention-list-card';
import { CategoryDistributionCard } from './components/category-distribution-card';
import { DashboardKpiGrid } from './components/dashboard-kpi-grid';
import { LocationDistributionCard } from './components/location-distribution-card';
import { QuickActionsBar } from './components/quick-actions-bar';
import { StockActivityChart } from './components/stock-activity-chart';
import {
  buildCategoryChartData,
  buildLocationChartData,
  buildStockTrendData,
} from './home-chart-utils';
import { buildAttentionList, computeDashboardSummary } from './home-utils';

export function AuthHomeScreen() {
  const { data: items = [] } = useItemsQuery();
  const { data: partsData } = usePartsQuery();
  const { data: categories = [] } = useCategoriesQuery();
  const { data: locations = [] } = useLocationsQuery();
  const { data: movements = [] } = useMovementsQuery();
  const { data: shoppingItems = [] } = useShoppingQuery();
  const { data: settings } = useSettingsQuery();

  const [nowMs] = React.useState(() => Date.now());
  const parts = React.useMemo(() => partsData?.parts ?? [], [partsData]);
  const logs = React.useMemo(() => partsData?.logs ?? [], [partsData]);
  const currency = settings?.currency ?? 'TRY';

  const summary = React.useMemo(
    () =>
      computeDashboardSummary({
        items,
        parts,
        logs,
        categories,
        locations,
        shoppingItems,
        currency,
        nowMs,
      }),
    [items, parts, logs, categories, locations, shoppingItems, currency, nowMs],
  );

  const attentionList = React.useMemo(
    () => buildAttentionList({ items, parts, nowMs }),
    [items, parts, nowMs],
  );

  const stockTrend = React.useMemo(
    () => buildStockTrendData(movements, nowMs, 14),
    [movements, nowMs],
  );

  const categoryDistribution = React.useMemo(
    () => buildCategoryChartData(categories, items),
    [categories, items],
  );

  const locationDistribution = React.useMemo(
    () => buildLocationChartData(locations, items),
    [locations, items],
  );

  return (
    <div className="space-y-5 md:space-y-6">
      <QuickActionsBar />

      <DashboardKpiGrid summary={summary} />

      <div className="grid gap-4 lg:grid-cols-3">
        <StockActivityChart data={stockTrend} />
        <CategoryDistributionCard
          categories={categoryDistribution}
          totalItems={summary.totalItems}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <AttentionListCard items={attentionList} />
        <LocationDistributionCard locations={locationDistribution} />
      </div>
    </div>
  );
}
