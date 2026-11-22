import type {
  Category,
  CurrencyCode,
  Item,
  Location,
  Part,
  ReplacementLog,
  ShoppingListItem,
} from '@/features/inventory/types';
import type { AttentionItem, DashboardSummary } from './types';

const ISTANBUL_DATE_FORMAT = new Intl.DateTimeFormat('tr-TR', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'Europe/Istanbul',
});

const DAY_MS = 24 * 60 * 60 * 1000;
const SOON_WINDOW_MS = 30 * DAY_MS;

const TR_DECIMAL_FORMAT = new Intl.NumberFormat('tr-TR', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function roundTwoDecimals(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function formatTwoDecimals(value: number): string {
  return TR_DECIMAL_FORMAT.format(roundTwoDecimals(value));
}

export function getExpiringOrWarrantyItems(
  items: Item[],
  nowMs: number,
): Item[] {
  return items.filter((item) => {
    const expMs = item.expiresAt ? Date.parse(item.expiresAt) : NaN;
    const warMs = item.warrantyEndsAt ? Date.parse(item.warrantyEndsAt) : NaN;
    return (
      (!Number.isNaN(expMs) && expMs - nowMs <= SOON_WINDOW_MS) ||
      (!Number.isNaN(warMs) && warMs - nowMs <= SOON_WINDOW_MS)
    );
  });
}

export function computeDashboardSummary(params: {
  items: Item[];
  parts: Part[];
  logs: ReplacementLog[];
  categories: Category[];
  locations: Location[];
  shoppingItems: ShoppingListItem[];
  currency: CurrencyCode;
  nowMs: number;
}): DashboardSummary {
  const {
    items,
    parts,
    logs,
    categories,
    locations,
    shoppingItems,
    currency,
    nowMs,
  } = params;

  const totalItems = items.length;
  const totalUnits = roundTwoDecimals(
    items.reduce((acc, item) => acc + Math.max(0, item.quantity), 0),
  );
  const activeItemsCount = items.filter((i) => i.status === 'active').length;
  const inRepairOrLentCount = items.filter(
    (i) => i.status === 'in_repair' || i.status === 'lent',
  ).length;

  let inventoryValue = 0;
  let pricedItemsCount = 0;
  for (const item of items) {
    if (typeof item.purchasePrice === 'number') {
      pricedItemsCount += 1;
      inventoryValue += item.purchasePrice * Math.max(0, item.quantity);
    }
  }

  const outOfStockCount = items.filter(
    (i) => i.minQuantity > 0 && i.quantity <= 0,
  ).length;
  const lowStockCount = items.filter(
    (i) => i.minQuantity > 0 && i.quantity > 0 && i.quantity <= i.minQuantity,
  ).length;
  const healthyStockCount = Math.max(
    0,
    totalItems - outOfStockCount - lowStockCount,
  );
  const stockHealthPercent =
    totalItems > 0 ? Math.round((healthyStockCount / totalItems) * 100) : 100;

  const overduePartsCount = parts.filter((p) => p.status === 'overdue').length;
  const dueSoonPartsCount = parts.filter((p) => p.status === 'due_soon').length;
  const okPartsCount = parts.filter((p) => p.status === 'ok').length;
  const partHealthPercent =
    parts.length > 0 ? Math.round((okPartsCount / parts.length) * 100) : 100;
  const totalReplacementCost = logs.reduce(
    (acc, log) => acc + (typeof log.cost === 'number' ? log.cost : 0),
    0,
  );

  const pendingShopping = shoppingItems.filter((s) => !s.done);
  const doneShopping = shoppingItems.filter((s) => s.done);
  const shoppingHighPriorityCount = pendingShopping.filter(
    (s) => s.priority === 'high',
  ).length;
  const shoppingTotal = pendingShopping.reduce(
    (acc, s) => acc + (typeof s.price === 'number' ? s.price * s.qty : 0),
    0,
  );
  const shoppingPricedCount = pendingShopping.filter(
    (item) => typeof item.price === 'number',
  ).length;
  const shoppingCompletionPercent =
    shoppingItems.length > 0
      ? Math.round((doneShopping.length / shoppingItems.length) * 100)
      : 0;

  const expiringOrWarrantyCount = getExpiringOrWarrantyItems(
    items,
    nowMs,
  ).length;

  return {
    totalItems,
    totalUnits,
    activeItemsCount,
    inRepairOrLentCount,
    locationsCount: locations.length,
    categoriesCount: categories.length,
    inventoryValue,
    pricedItemsCount,
    currency,
    outOfStockCount,
    lowStockCount,
    healthyStockCount,
    stockHealthPercent,
    totalParts: parts.length,
    overduePartsCount,
    dueSoonPartsCount,
    okPartsCount,
    partHealthPercent,
    totalReplacementCost,
    shoppingPendingCount: pendingShopping.length,
    shoppingDoneCount: doneShopping.length,
    shoppingTotalCount: shoppingItems.length,
    shoppingHighPriorityCount,
    shoppingTotal,
    shoppingPricedCount,
    shoppingCompletionPercent,
    expiringOrWarrantyCount,
  };
}

export function buildAttentionList(params: {
  items: Item[];
  parts: Part[];
  nowMs: number;
}): AttentionItem[] {
  const { items, parts, nowMs } = params;
  const list: AttentionItem[] = [];

  for (const part of parts) {
    if (part.status === 'ok') continue;
    list.push({
      id: `part-${part.id}`,
      title: part.name,
      subtitle:
        part.status === 'overdue'
          ? 'Değişim süresi doldu'
          : 'Değişim zamanı yaklaşıyor',
      tone: part.status === 'overdue' ? 'overdue' : 'due_soon',
      badge: part.status === 'overdue' ? 'Gecikti' : 'Yaklaşıyor',
      href: `/parts/${part.id}`,
      priority: part.status === 'overdue' ? 0 : 1,
    });
  }

  for (const item of items) {
    if (item.minQuantity > 0 && item.quantity <= item.minQuantity) {
      list.push({
        id: `low-${item.id}`,
        title: item.name,
        subtitle: `Kalan: ${formatTwoDecimals(item.quantity)} ${item.unit} · Eşik: ${formatTwoDecimals(item.minQuantity)} ${item.unit}`,
        tone: item.quantity <= 0 ? 'out_of_stock' : 'low_stock',
        badge: item.quantity <= 0 ? 'Tükendi' : 'Düşük stok',
        href: `/items?item=${item.id}`,
        priority: item.quantity <= 0 ? 1 : 2,
      });
    }
  }

  for (const item of getExpiringOrWarrantyItems(items, nowMs)) {
    list.push({
      id: `exp-${item.id}`,
      title: item.name,
      subtitle: item.expiresAt
        ? `SKT: ${ISTANBUL_DATE_FORMAT.format(new Date(item.expiresAt))}`
        : 'Garanti süresi yaklaşıyor',
      tone: 'due_soon',
      badge: 'SKT / Garanti',
      href: `/items?item=${item.id}`,
      priority: 3,
    });
  }

  return list.sort((a, b) => a.priority - b.priority).slice(0, 8);
}
