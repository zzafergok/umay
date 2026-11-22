import { NextRequest, NextResponse } from 'next/server';
import {
  shoppingBulkDoneInputSchema,
  shoppingBulkItemsInputSchema,
  shoppingItemInputSchema,
} from '@/features/inventory/schemas';
import { handleRouteError, requireAuth } from '@/lib/api/route-helpers';
import {
  createShoppingItem,
  createShoppingItemsBulk,
  listShoppingItems,
  updateShoppingItemsBulk,
} from '@/lib/inventory/repo';

function isBulkPayload(body: unknown): body is { items: unknown } {
  return (
    typeof body === 'object' &&
    body !== null &&
    'items' in body &&
    Array.isArray((body as { items?: unknown }).items)
  );
}

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const listId = request.nextUrl.searchParams.get('listId') ?? undefined;
    const list = await listShoppingItems(auth.uid, listId);
    return NextResponse.json(list);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body: unknown = await request.json();
    if (isBulkPayload(body)) {
      const parsed = shoppingBulkItemsInputSchema.parse(body);
      const created = await createShoppingItemsBulk(auth.uid, parsed.items);
      return NextResponse.json(
        { items: created, count: created.length },
        { status: 201 },
      );
    }

    const parsed = shoppingItemInputSchema.parse(body);
    const created = await createShoppingItem(auth.uid, parsed);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body: unknown = await request.json();
    const parsed = shoppingBulkDoneInputSchema.parse(body);
    const updated = await updateShoppingItemsBulk(
      auth.uid,
      parsed.ids,
      parsed.done,
    );
    return NextResponse.json({ items: updated, count: updated.length });
  } catch (error) {
    return handleRouteError(error);
  }
}
