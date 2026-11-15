import { z } from 'zod';

const isoDateOrDatetime = z
  .string()
  .trim()
  .refine(
    (val) => !Number.isNaN(Date.parse(val)),
    'Geçerli bir tarih giriniz.',
  );

export const customFieldDefinitionSchema = z.object({
  key: z
    .string()
    .trim()
    .min(1, 'Alan anahtarı zorunludur.')
    .max(50, 'Alan anahtarı en fazla 50 karakter olabilir.'),
  label: z
    .string()
    .trim()
    .min(1, 'Alan etiketi zorunludur.')
    .max(80, 'Alan etiketi en fazla 80 karakter olabilir.'),
  type: z.enum(['text', 'number', 'date', 'select']),
  unit: z.string().trim().max(20).optional(),
  options: z.array(z.string().trim().min(1).max(60)).max(30).optional(),
  required: z.boolean().optional(),
});

export const locationInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Konum adı zorunludur.')
    .max(80, 'Konum adı en fazla 80 karakter olabilir.'),
  parentId: z.string().trim().nullable().default(null),
  icon: z.string().trim().max(40).optional(),
  note: z.string().trim().max(300).optional(),
});

export const categoryInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Kategori adı zorunludur.')
    .max(60, 'Kategori adı en fazla 60 karakter olabilir.'),
  colorToken: z.string().trim().min(1).max(40).default('tulpar-blue'),
  icon: z.string().trim().min(1).max(40).default('boxes'),
  customFields: z.array(customFieldDefinitionSchema).max(20).default([]),
});

export const itemDocumentSchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1).max(150),
  url: z.string().trim().min(1).max(1000),
  mimeType: z.string().trim().min(1).max(100),
  sizeBytes: z.number().nonnegative().optional(),
});

export const itemInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Ürün adı zorunludur.')
    .max(120, 'Ürün adı en fazla 120 karakter olabilir.'),
  categoryId: z.string().trim().min(1, 'Kategori seçimi zorunludur.'),
  locationId: z.string().trim().min(1, 'Konum seçimi zorunludur.'),
  type: z.enum(['durable', 'consumable', 'component']).default('consumable'),
  quantity: z
    .number({ invalid_type_error: 'Miktar sayı olmalıdır.' })
    .min(0, 'Miktar negatif olamaz.')
    .max(1000000),
  unit: z.string().trim().min(1, 'Birim zorunludur.').max(24).default('adet'),
  minQuantity: z
    .number({ invalid_type_error: 'Minimum miktar sayı olmalıdır.' })
    .min(0, 'Minimum miktar negatif olamaz.')
    .max(1000000)
    .default(0),
  targetQuantity: z.number().min(0).max(1000000).optional(),
  barcode: z.string().trim().max(80).optional(),
  brand: z.string().trim().max(80).optional(),
  model: z.string().trim().max(80).optional(),
  serialNumber: z.string().trim().max(100).optional(),
  purchaseDate: isoDateOrDatetime.optional(),
  purchasePrice: z.number().min(0).max(100000000).optional(),
  currency: z.enum(['TRY', 'USD', 'EUR']).default('TRY'),
  store: z.string().trim().max(100).optional(),
  warrantyEndsAt: isoDateOrDatetime.optional(),
  expiresAt: isoDateOrDatetime.optional(),
  photos: z.array(z.string().trim().max(1000)).max(10).default([]),
  documents: z.array(itemDocumentSchema).max(10).default([]),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
  customFieldValues: z
    .record(z.string(), z.union([z.string(), z.number()]))
    .default({}),
  notes: z.string().trim().max(2000).default(''),
  status: z
    .enum(['active', 'in_repair', 'lent', 'discarded'])
    .default('active'),
});

export type LocationInput = z.infer<typeof locationInputSchema>;
export type CategoryInput = z.infer<typeof categoryInputSchema>;
export type ItemInput = z.infer<typeof itemInputSchema>;
