import { NextRequest, NextResponse } from 'next/server';
import { itemInputSchema } from '@/features/inventory/schemas';
import { handleRouteError, requireAuth } from '@/lib/api/route-helpers';
import { createItem, listItems } from '@/lib/inventory/repo';

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const includeArchived =
      request.nextUrl.searchParams.get('includeArchived') === 'true';
    const items = await listItems(auth.uid, includeArchived);
    return NextResponse.json(items);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body: unknown = await request.json();
    const parsed = itemInputSchema.parse(body);
    const created = await createItem(auth.uid, parsed);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
