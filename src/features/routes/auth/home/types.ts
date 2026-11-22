import type { LucideIcon } from 'lucide-react';
import type { StatusTone } from '@/components/core/status-pill';
import type { CurrencyCode } from '@/features/inventory/types';

export type AuthHomeMetric = {
  label: string;
  value: string;
  icon: LucideIcon;
};

export type AuthHomeCopy = {
  badge: string;
  title: string;
  description: string;
  actionLabel: string;
  metrics: Array<
    Omit<AuthHomeMetric, 'icon'> & { icon: 'boxes' | 'activity' | 'clock' }
  >;
};

export interface AttentionItem {
  id: string;
  title: string;
  subtitle: string;
  tone: StatusTone;
  badge: string;
  href: string;
  priority: number;
}

export interface CategoryDistributionItem {
  id: string;
  key: string;
  name: string;
  count: number;
  totalUnits: number;
  percent: number;
  dotColor: string;
}

export interface LocationDistributionItem {
  id: string;
  name: string;
  itemCount: number;
  totalUnits: number;
}

export interface StockTrendPoint {
  dateKey: string;
  label: string;
  inflow: number;
  outflow: number;
}

export interface DashboardSummary {
  totalItems: number;
  totalUnits: number;
  activeItemsCount: number;
  inRepairOrLentCount: number;
  locationsCount: number;
  categoriesCount: number;
  inventoryValue: number;
  pricedItemsCount: number;
  currency: CurrencyCode;
  outOfStockCount: number;
  lowStockCount: number;
  healthyStockCount: number;
  stockHealthPercent: number;
  totalParts: number;
  overduePartsCount: number;
  dueSoonPartsCount: number;
  okPartsCount: number;
  partHealthPercent: number;
  totalReplacementCost: number;
  shoppingPendingCount: number;
  shoppingDoneCount: number;
  shoppingTotalCount: number;
  shoppingHighPriorityCount: number;
  shoppingTotal: number;
  shoppingPricedCount: number;
  shoppingCompletionPercent: number;
  expiringOrWarrantyCount: number;
}
