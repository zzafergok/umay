import { NextRequest, NextResponse } from 'next/server';
import { handleRouteError, requireAuth } from '@/lib/api/route-helpers';
import { markNotificationRead } from '@/lib/inventory/repo';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await context.params;
    const updated = await markNotificationRead(auth.uid, id);
    return NextResponse.json(updated);
  } catch (error) {
    return handleRouteError(error);
  }
}
