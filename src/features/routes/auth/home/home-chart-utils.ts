import type {
  Category,
  Item,
  Location,
  StockMovement,
} from '@/features/inventory/types';
import { resolveCategoryCssVar } from '@/lib/design/tokens';
import { roundTwoDecimals } from './home-utils';
import type {
  CategoryDistributionItem,
  LocationDistributionItem,
  StockTrendPoint,
} from './types';

const DAY_MS = 24 * 60 * 60 * 1000;

const ISTANBUL_SHORT_DAY_FORMAT = new Intl.DateTimeFormat('tr-TR', {
  day: '2-digit',
  month: 'short',
  timeZone: 'Europe/Istanbul',
});

const ISTANBUL_KEY_FORMAT = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  timeZone: 'Europe/Istanbul',
});

export function buildStockTrendData(
  movements: StockMovement[],
  nowMs: number,
  days = 14,
): StockTrendPoint[] {
  const buckets = new Map<string, StockTrendPoint>();
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(nowMs - offset * DAY_MS);
    const dateKey = ISTANBUL_KEY_FORMAT.format(date);
    buckets.set(dateKey, {
      dateKey,
      label: ISTANBUL_SHORT_DAY_FORMAT.format(date),
      inflow: 0,
      outflow: 0,
    });
  }

  for (const mov of movements) {
    const parsed = Date.parse(mov.at);
    if (Number.isNaN(parsed)) continue;
    const key = ISTANBUL_KEY_FORMAT.format(new Date(parsed));
    const bucket = buckets.get(key);
    if (!bucket) continue;
    if (mov.delta > 0) {
      bucket.inflow = roundTwoDecimals(bucket.inflow + mov.delta);
    } else if (mov.delta < 0) {
      bucket.outflow = roundTwoDecimals(bucket.outflow + Math.abs(mov.delta));
    }
  }

  return Array.from(buckets.values());
}

export function buildCategoryChartData(
  categories: Category[],
  items: Item[],
): CategoryDistributionItem[] {
  const total = Math.max(1, items.length);
  return categories
    .map((cat, idx) => {
      const catItems = items.filter((i) => i.categoryId === cat.id);
      const count = catItems.length;
      const totalUnits = roundTwoDecimals(
        catItems.reduce((acc, i) => acc + Math.max(0, i.quantity), 0),
      );
      return {
        id: cat.id,
        key: `cat_${idx}`,
        name: cat.name,
        count,
        totalUnits,
        percent: Math.round((count / total) * 100),
        dotColor: resolveCategoryCssVar(cat.name),
      };
    })
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}

export function buildLocationChartData(
  locations: Location[],
  items: Item[],
): LocationDistributionItem[] {
  return locations
    .map((loc) => {
      const locItems = items.filter((i) => i.locationId === loc.id);
      return {
        id: loc.id,
        name: loc.name,
        itemCount: locItems.length,
        totalUnits: roundTwoDecimals(
          locItems.reduce((acc, i) => acc + Math.max(0, i.quantity), 0),
        ),
      };
    })
    .filter((l) => l.itemCount > 0)
    .sort((a, b) => b.itemCount - a.itemCount)
    .slice(0, 6);
}
