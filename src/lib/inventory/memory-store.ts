import type {
  Category,
  Item,
  Location,
  Part,
  ReplacementLog,
  ShoppingListItem,
  StockMovement,
  UserSettings,
} from '@/features/inventory/types';

export interface UserVault {
  locations: Map<string, Location>;
  categories: Map<string, Category>;
  items: Map<string, Item>;
  parts: Map<string, Part>;
  replacementLogs: Map<string, ReplacementLog>;
  stockMovements: Map<string, StockMovement>;
  shoppingList: Map<string, ShoppingListItem>;
  settings: UserSettings;
}

const memoryStore = new Map<string, UserVault>();

export function getUserVault(uid: string): UserVault {
  let vault = memoryStore.get(uid);
  if (!vault) {
    vault = {
      locations: new Map(),
      categories: new Map(),
      items: new Map(),
      parts: new Map(),
      replacementLogs: new Map(),
      stockMovements: new Map(),
      shoppingList: new Map(),
      settings: {
        currency: 'TRY',
        dateFormat: 'dd.MM.yyyy',
        defaultUnit: 'adet',
        compactMode: false,
        updatedAt: new Date().toISOString(),
      },
    };
    memoryStore.set(uid, vault);
  }
  return vault;
}

export function clearMemoryStore(uid?: string): void {
  if (uid) {
    memoryStore.delete(uid);
  } else {
    memoryStore.clear();
  }
}
