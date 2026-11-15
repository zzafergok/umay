export type ItemType = 'durable' | 'consumable' | 'component';

export type ItemStatus = 'active' | 'in_repair' | 'lent' | 'discarded';

export type CurrencyCode = 'TRY' | 'USD' | 'EUR';

export type CustomFieldType = 'text' | 'number' | 'date' | 'select';

export interface CustomFieldDefinition {
  key: string;
  label: string;
  type: CustomFieldType;
  unit?: string;
  options?: string[];
  required?: boolean;
}

export interface Location {
  id: string;
  name: string;
  parentId: string | null;
  path: string[];
  icon?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  colorToken: string;
  icon: string;
  customFields: CustomFieldDefinition[];
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
}

export interface ItemDocument {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  sizeBytes?: number;
}

export interface Item {
  id: string;
  name: string;
  categoryId: string;
  locationId: string;
  type: ItemType;
  quantity: number;
  unit: string;
  minQuantity: number;
  targetQuantity?: number;
  barcode?: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  currency: CurrencyCode;
  store?: string;
  warrantyEndsAt?: string;
  expiresAt?: string;
  photos: string[];
  documents: ItemDocument[];
  tags: string[];
  customFieldValues: Record<string, string | number>;
  notes: string;
  status: ItemStatus;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
}
