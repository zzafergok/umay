import { NextRequest, NextResponse } from 'next/server';
import { handleRouteError, requireAuth } from '@/lib/api/route-helpers';
import { OpenRouterApiError } from '@/lib/ai/openrouter';
import {
  analyzeReceiptImage,
  receiptAnalyzeRequestSchema,
} from '@/lib/ai/receipt-analyzer';

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body: unknown = await request.json();
    const input = receiptAnalyzeRequestSchema.parse(body);
    const analysis = await analyzeReceiptImage(input);

    return NextResponse.json({ analysis });
  } catch (error) {
    if (error instanceof OpenRouterApiError) {
      return NextResponse.json(
        {
          message: error.message,
          code: error.code,
          providerName: error.providerName,
        },
        {
          status:
            error.status >= 400 && error.status < 600 ? error.status : 502,
        },
      );
    }
    return handleRouteError(error);
  }
}
