import { NextRequest, NextResponse } from 'next/server';
import { shoppingListInputSchema } from '@/features/inventory/schemas';
import { handleRouteError, requireAuth } from '@/lib/api/route-helpers';
import { createShoppingList, listShoppingLists } from '@/lib/inventory/repo';

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const lists = await listShoppingLists(auth.uid);
    return NextResponse.json(lists);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body: unknown = await request.json();
    const parsed = shoppingListInputSchema.parse(body);
    const created = await createShoppingList(auth.uid, parsed);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
