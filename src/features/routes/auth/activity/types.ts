import type {
  StockMovement,
  StockMovementType,
} from '@/features/inventory/types';

export type ActivityDirectionFilter = 'all' | 'inflow' | 'outflow';

export type ActivityTypeFilter = 'all' | StockMovementType;

export type ActivityDateFilter = 'all' | 'today' | '7d' | '30d';

export interface ActivitySummary {
  totalCount: number;
  inflowCount: number;
  outflowCount: number;
  inflowUnits: number;
  outflowUnits: number;
  netUnits: number;
  uniqueItemsCount: number;
  last24hCount: number;
  partReplaceCount: number;
}

export interface EnrichedMovement {
  movement: StockMovement;
  itemName: string;
  itemUnit: string;
}
