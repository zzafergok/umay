import { NextResponse } from 'next/server';
import { withApiRoute } from '@/lib/api/server';
import {
  enrichReceiptItemNames,
  receiptEnrichRequestSchema,
} from '@/lib/ai/receipt-analyzer';

export const maxDuration = 90;

export const POST = withApiRoute({
  requireAuth: true,
  rateLimitPolicy: 'ai_receipt_enrich',
  bodySchema: receiptEnrichRequestSchema,
  handler: async ({ body }) => {
    const items = await enrichReceiptItemNames(body);
    return NextResponse.json({ items });
  },
});
