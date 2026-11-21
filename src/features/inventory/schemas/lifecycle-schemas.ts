import { z } from 'zod';

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
    .number({ invalid_type_error: 'Değişim miktarı sayı olmalıdır.' })
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

export const shoppingItemInputSchema = z
  .object({
    listId: z.string().trim().optional(),
    itemId: z.string().trim().nullable().default(null),
    freeText: z.string().trim().max(120).optional(),
    qty: z.number().positive('Miktar 0 dan büyük olmalıdır.').max(100000),
    unit: z.string().trim().max(24).optional(),
    category: z.string().trim().max(60).optional(),
    priority: shoppingPrioritySchema.optional(),
    estimatedPrice: z.number().min(0).max(10000000).optional(),
    store: z.string().trim().max(80).optional(),
    note: z.string().trim().max(240).optional(),
    source: z
      .enum(['auto_low_stock', 'auto_part_due', 'manual', 'receipt_ai'])
      .default('manual'),
    done: z.boolean().default(false),
  })
  .refine((val) => Boolean(val.itemId || val.freeText), {
    message: 'Ürün veya serbest metin belirtilmelidir.',
  });

export const shoppingItemPatchSchema = z.object({
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
  priority: shoppingPrioritySchema.optional(),
  estimatedPrice: z.number().min(0).max(10000000).nullable().optional(),
  store: z.string().trim().max(80).optional(),
  note: z.string().trim().max(240).optional(),
  done: z.boolean().optional(),
});

export const userSettingsInputSchema = z.object({
  currency: z.enum(['TRY', 'USD', 'EUR']).optional(),
  dateFormat: z.enum(['dd.MM.yyyy', 'yyyy-MM-dd']).optional(),
  defaultUnit: z.string().trim().min(1).max(24).optional(),
  compactMode: z.boolean().optional(),
});

export type PartInput = z.infer<typeof partInputSchema>;
export type PartReplaceInput = z.infer<typeof partReplaceInputSchema>;
export type StockMovementInput = z.infer<typeof stockMovementInputSchema>;
export type ShoppingListInput = z.infer<typeof shoppingListInputSchema>;
export type ShoppingListPatchInput = z.infer<typeof shoppingListPatchSchema>;
export type ShoppingItemInput = z.infer<typeof shoppingItemInputSchema>;
export type ShoppingItemPatchInput = z.infer<typeof shoppingItemPatchSchema>;
export type UserSettingsInput = z.infer<typeof userSettingsInputSchema>;
