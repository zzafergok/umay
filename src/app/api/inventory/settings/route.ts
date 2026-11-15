import { NextRequest, NextResponse } from 'next/server';
import { userSettingsInputSchema } from '@/features/inventory/schemas';
import { handleRouteError, requireAuth } from '@/lib/api/route-helpers';
import { getUserSettings, updateUserSettings } from '@/lib/inventory/repo';

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const settings = await getUserSettings(auth.uid);
    return NextResponse.json(settings);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body: unknown = await request.json();
    const parsed = userSettingsInputSchema.parse(body);
    const updated = await updateUserSettings(auth.uid, parsed);
    return NextResponse.json(updated);
  } catch (error) {
    return handleRouteError(error);
  }
}
