import type {
  Category,
  Item,
  Location,
  ShoppingListItem,
} from '@/features/inventory/types';
import { createItem, listItems, recordStockMovement } from './item-stock-repo';
import {
  createCategory,
  createLocation,
  listCategories,
  listLocations,
} from './location-category-repo';

const normalizeKey = (value: string): string =>
  value.trim().toLocaleLowerCase('tr');

async function resolveCategoryId(
  uid: string,
  categoryName: string | undefined,
  categoryByName: Map<string, Category>,
  allCategories: Category[],
): Promise<string> {
  const trimmed = categoryName?.trim();
  if (trimmed) {
    const existing = categoryByName.get(normalizeKey(trimmed));
    if (existing) return existing.id;

    const created = await createCategory(uid, {
      name: trimmed.slice(0, 60),
      colorToken: 'umay-blue',
      icon: 'boxes',
      customFields: [],
    });
    categoryByName.set(normalizeKey(created.name), created);
    allCategories.push(created);
    return created.id;
  }

  if (allCategories[0]) return allCategories[0].id;
  const fallback = await createCategory(uid, {
    name: 'Genel',
    colorToken: 'umay-blue',
    icon: 'boxes',
    customFields: [],
  });
  categoryByName.set(normalizeKey(fallback.name), fallback);
  allCategories.push(fallback);
  return fallback.id;
}

async function resolveDefaultLocationId(
  uid: string,
  preferredId: string | undefined,
  locationsById: Map<string, Location>,
  allLocations: Location[],
): Promise<string> {
  if (preferredId && locationsById.has(preferredId)) {
    return preferredId;
  }
  if (allLocations[0]) return allLocations[0].id;

  const created = await createLocation(uid, {
    name: 'Ev',
    parentId: null,
  });
  locationsById.set(created.id, created);
  allLocations.push(created);
  return created.id;
}

/**
 * Alışveriş kalemleri `done: true` olarak işaretlendiğinde bağlı olduğu ürünü stoktan
 * artırır; henüz Ürünler ekranında kaydı yoksa otomatik olarak yeni ürün oluşturur
 * ve `itemId` bağlantısını kaleme geri yazar.
 */
export async function syncShoppingEntriesToInventory(
  uid: string,
  entries: ShoppingListItem[],
): Promise<ShoppingListItem[]> {
  if (entries.length === 0) return entries;

  const [existingItems, allCategories, allLocations] = await Promise.all([
    listItems(uid),
    listCategories(uid),
    listLocations(uid),
  ]);

  const itemsById = new Map<string, Item>(
    existingItems.map((item) => [item.id, item]),
  );
  const itemsByName = new Map<string, Item>();
  for (const item of existingItems) {
    itemsByName.set(normalizeKey(item.name), item);
  }
  const categoryByName = new Map<string, Category>(
    allCategories.map((cat) => [normalizeKey(cat.name), cat]),
  );
  const locationsById = new Map<string, Location>(
    allLocations.map((loc) => [loc.id, loc]),
  );

  const synced: ShoppingListItem[] = [];
  for (const entry of entries) {
    const title = entry.freeText?.trim() || 'Alışveriş Ürünü';
    const linked = entry.itemId ? itemsById.get(entry.itemId) : undefined;
    const matchedByName = linked ?? itemsByName.get(normalizeKey(title));

    if (matchedByName) {
      if (entry.qty > 0) {
        const { item: updatedItem } = await recordStockMovement(uid, {
          itemId: matchedByName.id,
          type: 'in',
          delta: entry.qty,
          reason: 'Alışverişten stok girişi',
        });
        itemsById.set(updatedItem.id, updatedItem);
        itemsByName.set(normalizeKey(updatedItem.name), updatedItem);
      }
      synced.push({ ...entry, itemId: matchedByName.id });
      continue;
    }

    const categoryId = await resolveCategoryId(
      uid,
      entry.category,
      categoryByName,
      allCategories,
    );
    const locationId = await resolveDefaultLocationId(
      uid,
      entry.locationId,
      locationsById,
      allLocations,
    );

    const createdItem = await createItem(uid, {
      name: title.slice(0, 120),
      categoryId,
      locationId,
      type: entry.type ?? 'consumable',
      quantity: entry.qty,
      unit: entry.unit?.trim() || 'adet',
      minQuantity: entry.minQuantity ?? 0,
      barcode: entry.barcode,
      brand: entry.brand,
      model: entry.model,
      purchaseDate: entry.boughtAt ?? entry.updatedAt,
      purchasePrice: entry.price,
      currency: entry.currency ?? 'TRY',
      store: entry.store,
      expiresAt: entry.expiresAt,
      photos: [],
      documents: [],
      tags: [],
      customFieldValues: {},
      notes: entry.note ?? '',
      status: 'active',
    });

    itemsById.set(createdItem.id, createdItem);
    itemsByName.set(normalizeKey(createdItem.name), createdItem);
    synced.push({ ...entry, itemId: createdItem.id });
  }

  return synced;
}
