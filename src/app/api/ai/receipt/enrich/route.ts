import { NextRequest, NextResponse } from 'next/server';
import { handleRouteError, requireAuth } from '@/lib/api/route-helpers';
import { OpenRouterApiError } from '@/lib/ai/openrouter';
import {
  enrichReceiptItemNames,
  receiptEnrichRequestSchema,
} from '@/lib/ai/receipt-analyzer';

export const maxDuration = 90;

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body: unknown = await request.json();
    const input = receiptEnrichRequestSchema.parse(body);
    const items = await enrichReceiptItemNames(input);
    return NextResponse.json({ items });
  } catch (error) {
    if (error instanceof OpenRouterApiError) {
      return NextResponse.json(
        { message: error.message, code: error.code },
        {
          status:
            error.status >= 400 && error.status < 600 ? error.status : 502,
        },
      );
    }
    return handleRouteError(error);
  }
}
