import { NextRequest, NextResponse } from 'next/server';
import { handleRouteError, requireAuth } from '@/lib/api/route-helpers';
import { listNotifications } from '@/lib/inventory/repo';

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const notifications = await listNotifications(auth.uid);
    return NextResponse.json(notifications);
  } catch (error) {
    return handleRouteError(error);
  }
}
