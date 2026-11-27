import { z } from 'zod';
import { createSortablePaginationQuerySchema } from '@/lib/pagination';

const isoDateOrDatetime = z
  .string()
  .trim()
  .refine(
    (val) => !Number.isNaN(Date.parse(val)),
    'Geçerli bir tarih giriniz.',
  );

export const partLifespanSchema = z
  .object({
    mode: z.enum(['time', 'usage', 'both']),
    days: z.number().int().min(1).max(36500).optional(),
    usageUnit: z.string().trim().min(1).max(30).optional(),
    usageLimit: z.number().positive().max(10000000).optional(),
  })
  .refine(
    (val) => {
      if (val.mode === 'time') return typeof val.days === 'number';
      if (val.mode === 'usage') return typeof val.usageLimit === 'number';
      return typeof val.days === 'number' || typeof val.usageLimit === 'number';
    },
    { message: 'Ömür modu için gün veya kullanım limiti belirtilmelidir.' },
  );

export const partInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Parça adı zorunludur.')
    .max(120, 'Parça adı en fazla 120 karakter olabilir.'),
  parentItemId: z.string().trim().nullable().default(null),
  spareItemId: z.string().trim().nullable().default(null),
  lifespan: partLifespanSchema,
  installedAt: isoDateOrDatetime,
  usageCurrent: z.number().min(0).max(10000000).default(0),
  notes: z.string().trim().max(1000).default(''),
});

export const partReplaceInputSchema = z.object({
  replacedAt: isoDateOrDatetime.optional(),
  cost: z.number().min(0).max(10000000).optional(),
  note: z.string().trim().max(500).optional(),
  deductSpare: z.boolean().default(true),
});

export const partUsageInputSchema = z.object({
  usageCurrent: z.number().min(0).max(10000000),
});

export const stockMovementInputSchema = z.object({
  itemId: z.string().trim().min(1, 'Ürün kimliği zorunludur.'),
  type: z.enum(['in', 'out', 'adjust', 'consume', 'replace_part', 'discard']),
  delta: z
    .number({ error: 'Değişim miktarı sayı olmalıdır.' })
    .refine((v) => v !== 0, 'Miktar değişimi 0 olamaz.'),
  reason: z.string().trim().max(240).optional(),
  relatedPartId: z.string().trim().optional(),
});

export const shoppingPrioritySchema = z.enum(['low', 'normal', 'high']);

export const shoppingListInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Liste adı zorunludur.')
    .max(80, 'Liste adı en fazla 80 karakter olabilir.'),
  description: z.string().trim().max(240).optional(),
  store: z.string().trim().max(80).optional(),
});

export const shoppingListPatchSchema = shoppingListInputSchema.partial();

function normalizeLegacyShoppingPrice(value: unknown): unknown {
  if (
    typeof value !== 'object' ||
    value === null ||
    !('estimatedPrice' in value)
  ) {
    return value;
  }
  return {
    ...value,
    price:
      'price' in value && value.price !== undefined
        ? value.price
        : value.estimatedPrice,
  };
}

export const shoppingItemInputSchema = z.preprocess(
  normalizeLegacyShoppingPrice,
  z
    .object({
      listId: z.string().trim().optional(),
      itemId: z.string().trim().nullable().default(null),
      freeText: z.string().trim().max(120).optional(),
      qty: z.number().positive('Miktar 0 dan büyük olmalıdır.').max(100000),
      unit: z.string().trim().max(24).optional(),
      category: z.string().trim().max(60).optional(),
      locationId: z.string().trim().nullable().optional(),
      type: z.enum(['durable', 'consumable', 'component']).optional(),
      minQuantity: z.number().min(0).max(1000000).optional(),
      brand: z.string().trim().max(80).optional(),
      model: z.string().trim().max(80).optional(),
      barcode: z.string().trim().max(80).optional(),
      currency: z.enum(['TRY', 'USD', 'EUR']).optional(),
      expiresAt: z.string().trim().nullable().optional(),
      priority: shoppingPrioritySchema.optional(),
      price: z.number().min(0).max(10000000).optional(),
      store: z.string().trim().max(80).optional(),
      note: z.string().trim().max(240).optional(),
      source: z
        .enum(['auto_low_stock', 'auto_part_due', 'manual', 'receipt_ai'])
        .default('manual'),
      done: z.boolean().default(false),
    })
    .refine((val) => Boolean(val.itemId || val.freeText), {
      message: 'Ürün veya serbest metin belirtilmelidir.',
    }),
);

export const shoppingBulkItemsInputSchema = z.object({
  items: z
    .array(shoppingItemInputSchema)
    .min(1, 'En az bir ürün belirtilmelidir.')
    .max(500, 'Tek seferde en fazla 500 ürün eklenebilir.'),
});

export const shoppingBulkDoneInputSchema = z.object({
  ids: z
    .array(z.string().trim().min(1))
    .min(1, 'En az bir ürün seçilmelidir.')
    .max(500, 'Tek seferde en fazla 500 ürün güncellenebilir.'),
  done: z.boolean(),
});

export const shoppingItemPatchSchema = z.preprocess(
  normalizeLegacyShoppingPrice,
  z.object({
    listId: z.string().trim().optional(),
    itemId: z.string().trim().nullable().optional(),
    freeText: z.string().trim().max(120).optional(),
    qty: z
      .number()
      .positive('Miktar 0 dan büyük olmalıdır.')
      .max(100000)
      .optional(),
    unit: z.string().trim().max(24).optional(),
    category: z.string().trim().max(60).optional(),
    locationId: z.string().trim().nullable().optional(),
    type: z.enum(['durable', 'consumable', 'component']).optional(),
    minQuantity: z.number().min(0).max(1000000).nullable().optional(),
    brand: z.string().trim().max(80).optional(),
    model: z.string().trim().max(80).optional(),
    barcode: z.string().trim().max(80).optional(),
    currency: z.enum(['TRY', 'USD', 'EUR']).optional(),
    expiresAt: z.string().trim().nullable().optional(),
    priority: shoppingPrioritySchema.optional(),
    price: z.number().min(0).max(10000000).nullable().optional(),
    store: z.string().trim().max(80).optional(),
    note: z.string().trim().max(240).optional(),
    done: z.boolean().optional(),
  }),
);

export const userSettingsInputSchema = z.object({
  currency: z.enum(['TRY', 'USD', 'EUR']).optional(),
  dateFormat: z.enum(['dd.MM.yyyy', 'yyyy-MM-dd']).optional(),
  defaultUnit: z.string().trim().min(1).max(24).optional(),
  compactMode: z.boolean().optional(),
});

export const MOVEMENT_SORT_FIELDS = [
  'at',
  'itemName',
  'type',
  'delta',
  'quantityAfter',
] as const;

export type MovementSortField = (typeof MOVEMENT_SORT_FIELDS)[number];

export const movementListQuerySchema = createSortablePaginationQuerySchema(
  MOVEMENT_SORT_FIELDS,
  'at',
  'desc',
).extend({
  itemId: z.string().trim().min(1).optional(),
  direction: z.enum(['all', 'inflow', 'outflow']).default('all'),
  type: z
    .enum(['all', 'in', 'out', 'adjust', 'consume', 'replace_part', 'discard'])
    .default('all'),
  dateRange: z.enum(['all', 'today', '7d', '30d']).default('all'),
});

export const SHOPPING_SORT_FIELDS = [
  'done',
  'title',
  'priority',
  'qty',
  'total',
  'estimatedTotal',
  'createdAt',
] as const;

export type ShoppingSortField = (typeof SHOPPING_SORT_FIELDS)[number];

export const shoppingListQuerySchema = createSortablePaginationQuerySchema(
  SHOPPING_SORT_FIELDS,
  'done',
  'asc',
).extend({
  listId: z.string().trim().min(1).optional(),
  status: z.enum(['all', 'pending', 'done']).default('all'),
  priority: z.enum(['all', 'high', 'normal', 'low']).default('all'),
});

export const equipmentInputSchema = z.object({
  kind: z.enum(['device', 'spare']).default('device'),
  name: z.string().trim().min(1, 'Ad zorunludur.').max(120),
  categoryId: z.string().trim().optional(),
  locationId: z.string().trim().optional(),
  status: z
    .enum(['active', 'in_repair', 'lent', 'discarded'])
    .default('active'),
  quantity: z.number().min(0).max(1000000).default(1),
  unit: z.string().trim().min(1).max(24).default('adet'),
  brand: z.string().trim().max(80).optional(),
  model: z.string().trim().max(80).optional(),
  serialNumber: z.string().trim().max(120).optional(),
  notes: z.string().trim().max(2000).optional(),
});

export type EquipmentInput = z.infer<typeof equipmentInputSchema>;

export type PartInput = z.infer<typeof partInputSchema>;
export type PartReplaceInput = z.infer<typeof partReplaceInputSchema>;
export type StockMovementInput = z.infer<typeof stockMovementInputSchema>;
export type MovementListQuery = z.infer<typeof movementListQuerySchema>;
export type ShoppingListQuery = z.infer<typeof shoppingListQuerySchema>;
export type ShoppingListInput = z.infer<typeof shoppingListInputSchema>;
export type ShoppingListPatchInput = z.infer<typeof shoppingListPatchSchema>;
export type ShoppingItemInput = z.infer<typeof shoppingItemInputSchema>;
export type ShoppingBulkItemsInput = z.infer<
  typeof shoppingBulkItemsInputSchema
>;
export type ShoppingBulkDoneInput = z.infer<typeof shoppingBulkDoneInputSchema>;
export type ShoppingItemPatchInput = z.infer<typeof shoppingItemPatchSchema>;
export type UserSettingsInput = z.infer<typeof userSettingsInputSchema>;
