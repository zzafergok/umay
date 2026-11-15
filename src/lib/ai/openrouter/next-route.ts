import { NextResponse } from 'next/server';
import { handleRouteError } from '@/lib/api/route-helpers';
import { OpenRouterApiError } from './client';
import { isOpenRouterConfigured } from './config';

export function openRouterJsonResponse<T>(data: T) {
  return NextResponse.json(data, {
    headers: {
      'X-OpenRouter-Configured': String(isOpenRouterConfigured()),
    },
  });
}

export function handleOpenRouterRouteError(error: unknown) {
  if (error instanceof OpenRouterApiError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          metadata: error.metadata ?? null,
        },
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
