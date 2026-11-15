import { NextRequest, NextResponse } from 'next/server';
import { createSession } from '@/lib/auth/session';
import { signToken } from '@/lib/auth/jwt';
import { loginSchema } from '@/lib/auth/auth-schema';
import { signInWithFirebasePassword } from '@/lib/auth/firebase-identity';

export async function POST(request: NextRequest) {
  try {
    const rawBody: unknown = await request.json();
    const parseResult = loginSchema.safeParse(rawBody);

    if (!parseResult.success) {
      const firstError =
        parseResult.error.errors[0]?.message ?? 'Geçersiz giriş bilgileri';
      return NextResponse.json(
        {
          message: firstError,
          errors: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { email, password } = parseResult.data;
    const identity = await signInWithFirebasePassword(email, password);
    if (!identity) {
      return NextResponse.json(
        { message: 'E-posta veya şifre hatalı.' },
        { status: 401 },
      );
    }

    const role = 'user' as const;
    const name = identity.displayName || email.split('@')[0];

    const token = signToken({
      sub: identity.uid,
      email: identity.email,
      name,
      role,
    });

    await createSession(token);

    return NextResponse.json(
      {
        message: 'Giriş başarılı',
        token,
        user: {
          id: identity.uid,
          email: identity.email,
          name,
          role,
        },
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: 'Kimlik doğrulama sırasında bir hata oluştu' },
      { status: 500 },
    );
  }
}
