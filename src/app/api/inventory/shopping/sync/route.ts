import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { handleRouteError, requireAuth } from '@/lib/api/route-helpers';
import { syncPendingDoneShoppingItems } from '@/lib/inventory/repo';
import { serializeShoppingItems } from '@/app/api/inventory/shopping/shopping-response';

const syncRequestSchema = z.object({
  listId: z.string().trim().min(1).optional(),
});

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body: unknown = await request.json().catch(() => ({}));
    const parsed = syncRequestSchema.parse(body);
    const synced = await syncPendingDoneShoppingItems(auth.uid, parsed.listId);
    return NextResponse.json({
      items: serializeShoppingItems(synced),
      count: synced.length,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
