import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminAuth } from '@/lib/firebase/admin';
import { signToken } from '@/lib/auth/jwt';
import { clearLastAuthRoute, createSession } from '@/lib/auth/session';

const firebaseTokenSchema = z.object({
  idToken: z.string().min(10, 'Geçersiz Firebase kimlik belirteci.'),
});

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const parsed = firebaseTokenSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0]?.message ?? 'Geçersiz istek.' },
        { status: 400 },
      );
    }

    const decoded = await getAdminAuth().verifyIdToken(parsed.data.idToken);
    const email = decoded.email ?? `${decoded.uid}@umay.app`;
    const name =
      typeof decoded.name === 'string' && decoded.name.trim().length > 0
        ? decoded.name
        : email.split('@')[0];

    const token = signToken({
      sub: decoded.uid,
      email,
      name,
      role: 'user',
    });

    await createSession(token);
    await clearLastAuthRoute();

    return NextResponse.json({
      message: 'Google ile giriş başarılı',
      token,
      user: {
        id: decoded.uid,
        email,
        name,
        role: 'user',
      },
    });
  } catch (error) {
    console.error('Firebase token verification failed:', error);
    return NextResponse.json(
      { message: 'Firebase oturumu doğrulanamadı.' },
      { status: 401 },
    );
  }
}
