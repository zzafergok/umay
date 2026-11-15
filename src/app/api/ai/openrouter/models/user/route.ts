import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api/route-helpers';
import {
  fetchOpenRouterUserModels,
  parseOpenRouterUserModelsQuery,
} from '@/lib/ai/openrouter';
import {
  handleOpenRouterRouteError,
  openRouterJsonResponse,
} from '@/lib/ai/openrouter/next-route';

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const query = parseOpenRouterUserModelsQuery(request.nextUrl.searchParams);
    const response = await fetchOpenRouterUserModels({ query });
    return openRouterJsonResponse(response);
  } catch (error) {
    return handleOpenRouterRouteError(error);
  }
}
