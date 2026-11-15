import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSession } from '@/lib/auth/session';
import { signToken } from '@/lib/auth/jwt';
import { signUpWithFirebasePassword } from '@/lib/auth/firebase-identity';

const registerSchema = z.object({
  email: z.string().trim().email('Geçerli bir e-posta adresi giriniz.'),
  password: z.string().min(8, 'Şifre en az 8 karakter olmalıdır.'),
  name: z.string().trim().min(1).max(80).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const rawBody: unknown = await request.json();
    const parseResult = registerSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          message:
            parseResult.error.errors[0]?.message ?? 'Geçersiz kayıt bilgileri',
        },
        { status: 400 },
      );
    }

    const { email, password, name } = parseResult.data;
    const identity = await signUpWithFirebasePassword(email, password, name);
    if (!identity) {
      return NextResponse.json(
        { message: 'Kayıt oluşturulamadı. E-posta zaten kullanımda olabilir.' },
        { status: 409 },
      );
    }

    const displayName = identity.displayName || email.split('@')[0];
    const token = signToken({
      sub: identity.uid,
      email: identity.email,
      name: displayName,
      role: 'user',
    });

    await createSession(token);

    return NextResponse.json(
      {
        message: 'Kayıt başarılı',
        token,
        user: {
          id: identity.uid,
          email: identity.email,
          name: displayName,
          role: 'user',
        },
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { message: 'Kayıt sırasında bir hata oluştu' },
      { status: 500 },
    );
  }
}
