import { NextRequest, NextResponse } from 'next/server';
import { handleRouteError, requireAuth } from '@/lib/api/route-helpers';
import {
  getFreeVisionModels,
  isOpenRouterConfigured,
  resolveDefaultVisionModel,
} from '@/lib/ai/openrouter';

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const forceRefresh =
      request.nextUrl.searchParams.get('refresh') === 'true';
    const { models, source } = await getFreeVisionModels(forceRefresh);
    const defaultModel = resolveDefaultVisionModel(
      models,
      process.env.OPENROUTER_DEFAULT_VISION_MODEL,
    );

    return NextResponse.json({
      configured: isOpenRouterConfigured(),
      defaultModel,
      source,
      models,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
