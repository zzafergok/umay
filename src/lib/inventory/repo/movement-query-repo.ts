import type {
  StockMovement,
  StockMovementType,
} from '@/features/inventory/types';
import type { MovementListQuery } from '@/features/inventory/schemas';
import {
  matchesTurkishSearch,
  paginateArray,
  sortItems,
  type PaginatedResponse,
} from '@/lib/pagination';
import { listItems, listStockMovements } from './item-stock-repo';

const DAY_MS = 24 * 60 * 60 * 1000;

export interface MovementListItem {
  movement: StockMovement;
  itemName: string;
  itemUnit: string;
}

export interface MovementListSummary {
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

const MOVEMENT_TYPE_LABELS: Record<StockMovementType, string> = {
  in: 'Stok Girişi',
  out: 'Stok Çıkışı',
  consume: 'Tüketim',
  adjust: 'Düzenleme',
  replace_part: 'Parça Değişimi',
  discard: 'İmha / Fire',
};

const MOVEMENT_COMPARATORS: Record<
  string,
  (a: MovementListItem, b: MovementListItem) => number
> = {
  at: (a, b) => a.movement.at.localeCompare(b.movement.at),
  itemName: (a, b) => a.itemName.localeCompare(b.itemName, 'tr-TR'),
  type: (a, b) =>
    (MOVEMENT_TYPE_LABELS[a.movement.type] ?? a.movement.type).localeCompare(
      MOVEMENT_TYPE_LABELS[b.movement.type] ?? b.movement.type,
      'tr-TR',
    ),
  delta: (a, b) => a.movement.delta - b.movement.delta,
  quantityAfter: (a, b) => a.movement.quantityAfter - b.movement.quantityAfter,
};

function roundTwo(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function computeSummary(
  movements: StockMovement[],
  nowMs: number,
): MovementListSummary {
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
    inflowUnits: roundTwo(inflowUnits),
    outflowUnits: roundTwo(outflowUnits),
    netUnits: roundTwo(inflowUnits - outflowUnits),
    uniqueItemsCount: uniqueItems.size,
    last24hCount,
    partReplaceCount,
  };
}

export async function listStockMovementsPaginated(
  uid: string,
  query: MovementListQuery,
): Promise<PaginatedResponse<MovementListItem, MovementListSummary>> {
  const [movements, items] = await Promise.all([
    listStockMovements(uid, query.itemId),
    listItems(uid, true),
  ]);

  const nowMs = Date.now();
  const summary = computeSummary(movements, nowMs);
  const itemMap = new Map(items.map((item) => [item.id, item]));

  const filtered: MovementListItem[] = [];
  for (const movement of movements) {
    if (query.direction === 'inflow' && movement.delta <= 0) continue;
    if (query.direction === 'outflow' && movement.delta >= 0) continue;
    if (query.type !== 'all' && movement.type !== query.type) continue;

    if (query.dateRange !== 'all') {
      const parsedAt = Date.parse(movement.at);
      if (Number.isNaN(parsedAt)) continue;
      const diffMs = nowMs - parsedAt;
      if (query.dateRange === 'today' && diffMs > DAY_MS) continue;
      if (query.dateRange === '7d' && diffMs > 7 * DAY_MS) continue;
      if (query.dateRange === '30d' && diffMs > 30 * DAY_MS) continue;
    }

    const item = itemMap.get(movement.itemId);
    const itemName = item?.name ?? movement.itemId;
    const itemUnit = item?.unit ?? '';
    const typeLabel = MOVEMENT_TYPE_LABELS[movement.type] ?? movement.type;

    if (
      !matchesTurkishSearch(query.search, itemName, movement.reason, typeLabel)
    ) {
      continue;
    }

    filtered.push({ movement, itemName, itemUnit });
  }

  const sorted = sortItems(
    filtered,
    query.sortBy,
    query.sortOrder,
    MOVEMENT_COMPARATORS,
  );

  return paginateArray(sorted, query.page, query.pageSize, summary);
}
