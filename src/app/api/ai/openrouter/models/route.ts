import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api/route-helpers';
import {
  fetchOpenRouterModels,
  parseOpenRouterModelsQuery,
} from '@/lib/ai/openrouter';
import {
  handleOpenRouterRouteError,
  openRouterJsonResponse,
} from '@/lib/ai/openrouter/next-route';

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const forceRefresh = request.nextUrl.searchParams.get('refresh') === 'true';
    const query = parseOpenRouterModelsQuery(request.nextUrl.searchParams);

    const openRouterResponse = await fetchOpenRouterModels({
      query,
      forceRefresh,
    });

    return openRouterJsonResponse(openRouterResponse);
  } catch (error) {
    return handleOpenRouterRouteError(error);
  }
}
