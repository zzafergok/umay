import { NextRequest, NextResponse } from 'next/server';
import { partInputSchema } from '@/features/inventory/schemas';
import { handleRouteError, requireAuth } from '@/lib/api/route-helpers';
import {
  createPart,
  listParts,
  listReplacementLogs,
} from '@/lib/inventory/repo';

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const [parts, logs] = await Promise.all([
      listParts(auth.uid),
      listReplacementLogs(auth.uid),
    ]);
    return NextResponse.json({ parts, logs });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body: unknown = await request.json();
    const parsed = partInputSchema.parse(body);
    const created = await createPart(auth.uid, parsed);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
