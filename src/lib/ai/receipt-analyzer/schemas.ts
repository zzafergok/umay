import { z } from 'zod';
import type {
  OpenRouterChatCompletionResponse,
  OpenRouterUsage,
} from '@/lib/ai/openrouter';

const MAX_IMAGE_DATA_URL_LENGTH = 7_500_000;
export const MAX_RECEIPT_IMAGES = 6;

export const receiptImageUrlSchema = z
  .string()
  .trim()
  .min(1, 'Fiş görseli zorunludur.')
  .max(
    MAX_IMAGE_DATA_URL_LENGTH,
    'Fiş görseli çok büyük (en fazla ~5 MB). Lütfen daha küçük bir görsel yükleyin.',
  )
  .refine(
    (val) =>
      /^data:image\/(jpeg|jpg|png|webp|gif);base64,[A-Za-z0-9+/=]+$/i.test(
        val,
      ) || /^https:\/\/.+/i.test(val),
    'Geçerli bir görsel (JPEG, PNG, WebP data URL veya HTTPS bağlantısı) gönderin.',
  );

export const receiptAnalyzeRequestSchema = z
  .object({
    imageDataUrl: receiptImageUrlSchema.optional(),
    imageDataUrls: z
      .array(receiptImageUrlSchema)
      .min(1, 'En az bir fiş görseli seçilmelidir.')
      .max(
        MAX_RECEIPT_IMAGES,
        `En fazla ${MAX_RECEIPT_IMAGES} fiş görseli yüklenebilir.`,
      )
      .optional(),
    modelId: z.string().trim().min(1).max(160).optional(),
    promptHint: z.string().trim().max(400).optional(),
  })
  .refine(
    (val) =>
      Boolean(
        val.imageDataUrl ||
          (val.imageDataUrls && val.imageDataUrls.length > 0),
      ),
    {
      message: 'En az bir fiş görseli gönderilmelidir.',
      path: ['imageDataUrls'],
    },
  );

export const receiptLineItemSchema = z.object({
  name: z.string().trim().min(1).default('Bilinmeyen Ürün'),
  normalizedName: z.string().trim().optional().default(''),
  quantity: z.number().nonnegative().optional().default(1),
  unit: z.string().trim().optional().default('adet'),
  unitPrice: z.number().nonnegative().nullable().optional().default(null),
  totalPrice: z.number().nonnegative().nullable().optional().default(null),
  categoryHint: z.string().trim().nullable().optional().default(null),
  vatRate: z
    .number()
    .nonnegative()
    .max(100)
    .nullable()
    .optional()
    .default(null),
});

export const receiptModelOutputSchema = z.object({
  rawText: z.string().default(''),
  merchantName: z.string().trim().nullable().optional().default(null),
  merchantTaxId: z.string().trim().nullable().optional().default(null),
  date: z.string().trim().nullable().optional().default(null),
  time: z.string().trim().nullable().optional().default(null),
  currency: z.string().trim().min(1).max(20).optional().default('TRY'),
  subtotal: z.number().nonnegative().nullable().optional().default(null),
  taxTotal: z.number().nonnegative().nullable().optional().default(null),
  discountTotal: z.number().nonnegative().nullable().optional().default(null),
  grandTotal: z.number().nonnegative().nullable().optional().default(null),
  paymentMethod: z.string().trim().nullable().optional().default(null),
  items: z.array(receiptLineItemSchema).default([]),
  notes: z.string().trim().nullable().optional().default(null),
  confidence: z.enum(['high', 'medium', 'low']).optional().default('medium'),
});

export type ReceiptAnalyzeInput = z.infer<typeof receiptAnalyzeRequestSchema>;
export type ReceiptLineItem = z.infer<typeof receiptLineItemSchema>;
export type ReceiptModelOutput = z.infer<typeof receiptModelOutputSchema>;

export type OpenRouterExtendedUsage = OpenRouterUsage & Record<string, unknown>;

export type OpenRouterRawCompletionResponse = OpenRouterChatCompletionResponse &
  Record<string, unknown>;

export interface ReceiptAnalysisResult extends ReceiptModelOutput {
  modelUsed: string;
  provider?: string;
  usage?: OpenRouterExtendedUsage;
  parsedFromJson: boolean;
  imageCount?: number;
  deduplicatedCount?: number;
  completionId?: string;
  finishReason?: string | null;
  nativeFinishReason?: string | null;
  reasoning?: string | null;
  refusal?: string | null;
  rawResponse?: OpenRouterRawCompletionResponse;
}
