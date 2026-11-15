import { NextRequest, NextResponse } from 'next/server';
import { partReplaceInputSchema } from '@/features/inventory/schemas';
import { handleRouteError, requireAuth } from '@/lib/api/route-helpers';
import { replacePart } from '@/lib/inventory/repo';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await context.params;
    const body: unknown = await request.json();
    const parsed = partReplaceInputSchema.parse(body);
    const result = await replacePart(auth.uid, id, parsed);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
