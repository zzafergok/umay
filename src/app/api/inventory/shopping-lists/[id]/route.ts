import { NextRequest, NextResponse } from 'next/server';
import { shoppingListPatchSchema } from '@/features/inventory/schemas';
import { handleRouteError, requireAuth } from '@/lib/api/route-helpers';
import {
  deleteShoppingList,
  getShoppingList,
  updateShoppingList,
} from '@/lib/inventory/repo';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await context.params;
    const list = await getShoppingList(auth.uid, id);
    if (!list) {
      return NextResponse.json(
        { error: 'Alışveriş listesi bulunamadı.' },
        { status: 404 },
      );
    }
    return NextResponse.json(list);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await context.params;
    const body: unknown = await request.json();
    const parsed = shoppingListPatchSchema.parse(body);
    const updated = await updateShoppingList(auth.uid, id, parsed);
    return NextResponse.json(updated);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await context.params;
    await deleteShoppingList(auth.uid, id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
