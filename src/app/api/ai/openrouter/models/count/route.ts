import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api/route-helpers';
import { fetchOpenRouterModelsCount } from '@/lib/ai/openrouter';
import {
  handleOpenRouterRouteError,
  openRouterJsonResponse,
} from '@/lib/ai/openrouter/next-route';

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const outputModalities =
      request.nextUrl.searchParams.get('output_modalities')?.trim() || undefined;
    const response = await fetchOpenRouterModelsCount({ outputModalities });
    return openRouterJsonResponse(response);
  } catch (error) {
    return handleOpenRouterRouteError(error);
  }
}
