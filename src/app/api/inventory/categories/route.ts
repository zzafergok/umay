import { NextRequest, NextResponse } from 'next/server';
import { categoryInputSchema } from '@/features/inventory/schemas';
import { handleRouteError, requireAuth } from '@/lib/api/route-helpers';
import { createCategory, listCategories } from '@/lib/inventory/repo';

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const categories = await listCategories(auth.uid);
    return NextResponse.json(categories);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body: unknown = await request.json();
    const parsed = categoryInputSchema.parse(body);
    const created = await createCategory(auth.uid, parsed);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
