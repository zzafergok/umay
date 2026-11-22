import { NextRequest, NextResponse } from 'next/server';
import { equipmentInputSchema } from '@/features/inventory/schemas';
import { handleRouteError, requireAuth } from '@/lib/api/route-helpers';
import { createEquipment, listEquipment } from '@/lib/inventory/repo';

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const equipment = await listEquipment(auth.uid);
    return NextResponse.json(equipment);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body: unknown = await request.json();
    const parsed = equipmentInputSchema.parse(body);
    const created = await createEquipment(auth.uid, parsed);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
