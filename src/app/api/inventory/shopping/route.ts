import { NextRequest, NextResponse } from 'next/server';
import {
  shoppingBulkDoneInputSchema,
  shoppingBulkItemsInputSchema,
  shoppingItemInputSchema,
  shoppingListQuerySchema,
} from '@/features/inventory/schemas';
import { handleRouteError, requireAuth } from '@/lib/api/route-helpers';
import {
  createShoppingItem,
  createShoppingItemsBulk,
  listShoppingItems,
  listShoppingItemsPaginated,
  updateShoppingItemsBulk,
} from '@/lib/inventory/repo';
import { parsePaginationSearchParams } from '@/lib/pagination';
import {
  serializeShoppingItem,
  serializeShoppingItems,
  serializeShoppingPage,
} from '@/app/api/inventory/shopping/shopping-response';

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
    const searchParams = request.nextUrl.searchParams;
    const isPaginated =
      searchParams.get('paginated') === 'true' ||
      searchParams.has('page') ||
      searchParams.has('pageSize');

    if (isPaginated) {
      const query = parsePaginationSearchParams(
        searchParams,
        shoppingListQuerySchema,
      );
      const result = await listShoppingItemsPaginated(auth.uid, query);
      return NextResponse.json(serializeShoppingPage(result));
    }

    const listId = searchParams.get('listId') ?? undefined;
    const list = await listShoppingItems(auth.uid, listId);
    return NextResponse.json(serializeShoppingItems(list));
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
        { items: serializeShoppingItems(created), count: created.length },
        { status: 201 },
      );
    }

    const parsed = shoppingItemInputSchema.parse(body);
    const created = await createShoppingItem(auth.uid, parsed);
    return NextResponse.json(serializeShoppingItem(created), { status: 201 });
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
    return NextResponse.json({
      items: serializeShoppingItems(updated),
      count: updated.length,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
