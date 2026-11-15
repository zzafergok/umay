import { apiClient } from '@/lib/api';
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
import type {
  CategoryInput,
  ItemInput,
  LocationInput,
  PartInput,
  PartReplaceInput,
  ShoppingItemInput,
  StockMovementInput,
  UserSettingsInput,
} from '@/features/inventory/schemas';

export const CACHE_STRATEGIES = {
  REALTIME: { staleTime: 0, gcTime: 1000 * 60 * 5 },
  SHORT: { staleTime: 1000 * 30, gcTime: 1000 * 60 * 15 },
  MEDIUM: { staleTime: 1000 * 60 * 5, gcTime: 1000 * 60 * 30 },
  LONG: { staleTime: 1000 * 60 * 60, gcTime: 1000 * 60 * 60 * 24 },
} as const;

export const inventoryService = {
  listLocations: () => apiClient.get<Location[]>('/inventory/locations'),
  createLocation: (data: LocationInput) =>
    apiClient.post<Location>('/inventory/locations', data),
  updateLocation: (id: string, data: Partial<LocationInput>) =>
    apiClient.patch<Location>(`/inventory/locations/${id}`, data),
  deleteLocation: (id: string) =>
    apiClient.delete<{ ok: boolean }>(`/inventory/locations/${id}`),

  listCategories: () => apiClient.get<Category[]>('/inventory/categories'),
  createCategory: (data: CategoryInput) =>
    apiClient.post<Category>('/inventory/categories', data),
  updateCategory: (id: string, data: Partial<CategoryInput>) =>
    apiClient.patch<Category>(`/inventory/categories/${id}`, data),
  deleteCategory: (id: string) =>
    apiClient.delete<{ ok: boolean }>(`/inventory/categories/${id}`),

  listItems: (includeArchived = false) =>
    apiClient.get<Item[]>('/inventory/items', {
      params: includeArchived ? { includeArchived: 'true' } : undefined,
    }),
  getItem: (id: string) => apiClient.get<Item>(`/inventory/items/${id}`),
  createItem: (data: ItemInput) =>
    apiClient.post<Item>('/inventory/items', data),
  updateItem: (
    id: string,
    data: Partial<ItemInput> & { archivedAt?: string },
  ) => apiClient.patch<Item>(`/inventory/items/${id}`, data),
  deleteItem: (id: string) =>
    apiClient.delete<{ ok: boolean }>(`/inventory/items/${id}`),

  listMovements: (itemId?: string) =>
    apiClient.get<StockMovement[]>('/inventory/movements', {
      params: itemId ? { itemId } : undefined,
    }),
  recordMovement: (data: StockMovementInput) =>
    apiClient.post<{ item: Item; movement: StockMovement }>(
      '/inventory/movements',
      data,
    ),

  listParts: () =>
    apiClient.get<{ parts: Part[]; logs: ReplacementLog[] }>(
      '/inventory/parts',
    ),
  getPart: (id: string) =>
    apiClient.get<{ part: Part; logs: ReplacementLog[] }>(
      `/inventory/parts/${id}`,
    ),
  createPart: (data: PartInput) =>
    apiClient.post<Part>('/inventory/parts', data),
  updatePart: (id: string, data: Partial<PartInput>) =>
    apiClient.patch<Part>(`/inventory/parts/${id}`, data),
  deletePart: (id: string) =>
    apiClient.delete<{ ok: boolean }>(`/inventory/parts/${id}`),
  replacePart: (id: string, data: PartReplaceInput) =>
    apiClient.post<{
      part: Part;
      log: ReplacementLog;
      spareDeducted: boolean;
      suggestShopping: boolean;
    }>(`/inventory/parts/${id}/replace`, data),

  listShopping: () => apiClient.get<ShoppingListItem[]>('/inventory/shopping'),
  createShopping: (data: ShoppingItemInput) =>
    apiClient.post<ShoppingListItem>('/inventory/shopping', data),
  updateShopping: (id: string, data: { qty?: number; done?: boolean }) =>
    apiClient.patch<ShoppingListItem>(`/inventory/shopping/${id}`, data),
  deleteShopping: (id: string) =>
    apiClient.delete<{ ok: boolean }>(`/inventory/shopping/${id}`),

  getSettings: () => apiClient.get<UserSettings>('/inventory/settings'),
  updateSettings: (data: UserSettingsInput) =>
    apiClient.put<UserSettings>('/inventory/settings', data),
};
