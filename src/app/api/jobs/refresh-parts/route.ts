import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/request-user';
import { handleRouteError } from '@/lib/api/route-helpers';
import { refreshPartsForUser } from '@/lib/inventory/repo';

export async function POST(request: NextRequest) {
  try {
    const cronSecret = request.headers.get('x-cron-secret');
    const expectedSecret = process.env.CRON_SECRET;

    if (cronSecret && expectedSecret && cronSecret === expectedSecret) {
      const targetUid = request.nextUrl.searchParams.get('uid');
      if (!targetUid) {
        return NextResponse.json(
          { message: 'Cron çağrısında uid parametresi gereklidir.' },
          { status: 400 },
        );
      }
      const result = await refreshPartsForUser(targetUid);
      return NextResponse.json(result);
    }

    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { message: 'Oturum doğrulanamadı.' },
        { status: 401 },
      );
    }

    const result = await refreshPartsForUser(user.uid);
    return NextResponse.json(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
