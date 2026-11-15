import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import {
  getAuthenticatedUser,
  type AuthenticatedUser,
} from '@/lib/auth/request-user';
import { InventoryRepoError } from '@/lib/inventory/repo';

export async function requireAuth(
  request: NextRequest,
): Promise<AuthenticatedUser | NextResponse> {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json(
      { message: 'Oturum doğrulanamadı. Lütfen giriş yapın.' },
      { status: 401 },
    );
  }
  return user;
}

export function handleRouteError(error: unknown): NextResponse {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        message: error.issues[0]?.message || 'Geçersiz istek verisi.',
        issues: error.issues,
      },
      { status: 400 },
    );
  }

  if (error instanceof InventoryRepoError) {
    return NextResponse.json(
      { message: error.message },
      { status: error.status },
    );
  }

  console.error('Inventory API error:', error);
  return NextResponse.json(
    { message: 'Sunucu işlemi sırasında bir hata oluştu.' },
    { status: 500 },
  );
}
