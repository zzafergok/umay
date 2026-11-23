import { NextResponse } from 'next/server';
import { OPENROUTER_DEFAULT_VISION_MODEL } from '@/lib/ai/openrouter';
import { withApiRoute } from '@/lib/api/server';
import {
  analyzeReceiptImage,
  receiptAnalyzeRequestSchema,
} from '@/lib/ai/receipt-analyzer';

/** Uzun fişler büyük modellerde dakikalarca sürebilir (Vercel vb. için). */
export const maxDuration = 200;

export const POST = withApiRoute({
  requireAuth: true,
  rateLimitPolicy: 'ai_receipt_analyze',
  bodySchema: receiptAnalyzeRequestSchema,
  handler: async ({ body }) => {
    const analysis = await analyzeReceiptImage({
      ...body,
      modelId: body.modelId ?? OPENROUTER_DEFAULT_VISION_MODEL,
    });
    return NextResponse.json({ analysis });
  },
});
