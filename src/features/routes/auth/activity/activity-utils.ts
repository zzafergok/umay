import type {
  Item,
  StockMovement,
  StockMovementType,
} from '@/features/inventory/types';
import type {
  ActivityDateFilter,
  ActivityDirectionFilter,
  ActivitySummary,
  ActivityTypeFilter,
  EnrichedMovement,
} from './types';

const DAY_MS = 24 * 60 * 60 * 1000;

const TR_DECIMAL_FORMAT = new Intl.NumberFormat('tr-TR', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function roundTwoDecimals(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function formatActivityNumber(value: number): string {
  return TR_DECIMAL_FORMAT.format(roundTwoDecimals(value));
}

export function formatActivityDelta(delta: number): string {
  const rounded = roundTwoDecimals(delta);
  const formatted = TR_DECIMAL_FORMAT.format(Math.abs(rounded));
  if (rounded > 0) return `+${formatted}`;
  if (rounded < 0) return `-${formatted}`;
  return '0';
}

export const MOVEMENT_TYPE_META: Record<
  StockMovementType,
  {
    label: string;
    variant: 'success' | 'warning' | 'destructive' | 'secondary' | 'default';
  }
> = {
  in: { label: 'Stok Girişi', variant: 'success' },
  out: { label: 'Stok Çıkışı', variant: 'warning' },
  consume: { label: 'Tüketim', variant: 'warning' },
  adjust: { label: 'Düzenleme', variant: 'default' },
  replace_part: { label: 'Parça Değişimi', variant: 'secondary' },
  discard: { label: 'İmha / Fire', variant: 'destructive' },
};

export function computeActivitySummary(
  movements: StockMovement[],
  nowMs: number,
): ActivitySummary {
  let inflowCount = 0;
  let outflowCount = 0;
  let inflowUnits = 0;
  let outflowUnits = 0;
  let last24hCount = 0;
  let partReplaceCount = 0;
  const uniqueItems = new Set<string>();

  for (const mov of movements) {
    uniqueItems.add(mov.itemId);
    if (mov.delta > 0) {
      inflowCount += 1;
      inflowUnits += mov.delta;
    } else if (mov.delta < 0) {
      outflowCount += 1;
      outflowUnits += Math.abs(mov.delta);
    }
    if (mov.type === 'replace_part') {
      partReplaceCount += 1;
    }
    const parsedAt = Date.parse(mov.at);
    if (!Number.isNaN(parsedAt) && nowMs - parsedAt <= DAY_MS) {
      last24hCount += 1;
    }
  }

  return {
    totalCount: movements.length,
    inflowCount,
    outflowCount,
    inflowUnits: roundTwoDecimals(inflowUnits),
    outflowUnits: roundTwoDecimals(outflowUnits),
    netUnits: roundTwoDecimals(inflowUnits - outflowUnits),
    uniqueItemsCount: uniqueItems.size,
    last24hCount,
    partReplaceCount,
  };
}

export function enrichMovements(
  movements: StockMovement[],
  itemMap: Map<string, Item>,
): EnrichedMovement[] {
  return movements.map((movement) => {
    const item = itemMap.get(movement.itemId);
    return {
      movement,
      itemName: item?.name ?? movement.itemId,
      itemUnit: item?.unit ?? '',
    };
  });
}

export function filterMovements(params: {
  entries: EnrichedMovement[];
  directionFilter: ActivityDirectionFilter;
  typeFilter: ActivityTypeFilter;
  dateFilter: ActivityDateFilter;
  searchQuery: string;
  nowMs: number;
}): EnrichedMovement[] {
  const {
    entries,
    directionFilter,
    typeFilter,
    dateFilter,
    searchQuery,
    nowMs,
  } = params;
  const query = searchQuery.trim().toLocaleLowerCase('tr-TR');

  return entries.filter(({ movement, itemName }) => {
    if (directionFilter === 'inflow' && movement.delta <= 0) return false;
    if (directionFilter === 'outflow' && movement.delta >= 0) return false;
    if (typeFilter !== 'all' && movement.type !== typeFilter) return false;

    if (dateFilter !== 'all') {
      const parsedAt = Date.parse(movement.at);
      if (Number.isNaN(parsedAt)) return false;
      const diffMs = nowMs - parsedAt;
      if (dateFilter === 'today' && diffMs > DAY_MS) return false;
      if (dateFilter === '7d' && diffMs > 7 * DAY_MS) return false;
      if (dateFilter === '30d' && diffMs > 30 * DAY_MS) return false;
    }

    if (query) {
      const typeLabel =
        MOVEMENT_TYPE_META[movement.type]?.label ?? movement.type;
      const haystack =
        `${itemName} ${movement.reason ?? ''} ${typeLabel}`.toLocaleLowerCase(
          'tr-TR',
        );
      if (!haystack.includes(query)) return false;
    }

    return true;
  });
}
