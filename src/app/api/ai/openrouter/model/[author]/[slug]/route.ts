import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api/route-helpers';
import { fetchOpenRouterModelBySlug } from '@/lib/ai/openrouter';
import {
  handleOpenRouterRouteError,
  openRouterJsonResponse,
} from '@/lib/ai/openrouter/next-route';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ author: string; slug: string }> },
) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { author, slug } = await context.params;
    const response = await fetchOpenRouterModelBySlug(author, slug);
    return openRouterJsonResponse(response);
  } catch (error) {
    return handleOpenRouterRouteError(error);
  }
}
