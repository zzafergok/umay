import { NextRequest, NextResponse } from 'next/server';
import { partInputSchema } from '@/features/inventory/schemas';
import { handleRouteError, requireAuth } from '@/lib/api/route-helpers';
import {
  deletePart,
  getPartById,
  listReplacementLogs,
  updatePart,
} from '@/lib/inventory/repo';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await context.params;
    const [part, logs] = await Promise.all([
      getPartById(auth.uid, id),
      listReplacementLogs(auth.uid, id),
    ]);
    if (!part) {
      return NextResponse.json({ message: 'Parça bulunamadı.' }, { status: 404 });
    }
    return NextResponse.json({ part, logs });
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
    const parsed = partInputSchema.partial().parse(body);
    const updated = await updatePart(auth.uid, id, parsed);
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
    await deletePart(auth.uid, id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
