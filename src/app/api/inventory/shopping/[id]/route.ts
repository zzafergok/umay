import { NextRequest, NextResponse } from 'next/server';
import { shoppingItemPatchSchema } from '@/features/inventory/schemas';
import { handleRouteError, requireAuth } from '@/lib/api/route-helpers';
import { deleteShoppingItem, updateShoppingItem } from '@/lib/inventory/repo';
import { serializeShoppingItem } from '@/app/api/inventory/shopping/shopping-response';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await context.params;
    const body: unknown = await request.json();
    const parsed = shoppingItemPatchSchema.parse(body);
    const updated = await updateShoppingItem(auth.uid, id, parsed);
    return NextResponse.json(serializeShoppingItem(updated));
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
    await deleteShoppingItem(auth.uid, id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
