import { NextRequest, NextResponse } from 'next/server';
import {
  movementListQuerySchema,
  stockMovementInputSchema,
} from '@/features/inventory/schemas';
import { handleRouteError, requireAuth } from '@/lib/api/route-helpers';
import {
  listStockMovements,
  listStockMovementsPaginated,
  recordStockMovement,
} from '@/lib/inventory/repo';
import { parsePaginationSearchParams } from '@/lib/pagination';

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
        movementListQuerySchema,
      );
      const result = await listStockMovementsPaginated(auth.uid, query);
      return NextResponse.json(result);
    }

    const itemId = searchParams.get('itemId') ?? undefined;
    const movements = await listStockMovements(auth.uid, itemId);
    return NextResponse.json(movements);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body: unknown = await request.json();
    const parsed = stockMovementInputSchema.parse(body);
    const result = await recordStockMovement(auth.uid, parsed);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
