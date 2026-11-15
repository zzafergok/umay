import { NextRequest, NextResponse } from 'next/server';
import { profileUpdateSchema } from '@/lib/auth/auth-schema';
import { signToken } from '@/lib/auth/jwt';
import { getAuthenticatedUser } from '@/lib/auth/request-user';
import { createSession } from '@/lib/auth/session';
import { getAdminAuth, isFirebaseConfigured } from '@/lib/firebase/admin';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json(
        { message: 'Yetkisiz erişim: Oturum bulunamadı.' },
        { status: 401 },
      );
    }

    return NextResponse.json(
      {
        user: {
          id: user.uid,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: 'Kullanıcı profili alınırken bir hata oluştu.' },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { message: 'Yetkisiz erişim: Oturum bulunamadı.' },
        { status: 401 },
      );
    }

    const rawBody: unknown = await request.json();
    const parsed = profileUpdateSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        {
          message:
            parsed.error.errors[0]?.message ?? 'Geçersiz profil bilgileri.',
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const nextName = parsed.data.name;

    if (isFirebaseConfigured() && !user.uid.startsWith('demo_')) {
      try {
        await getAdminAuth().updateUser(user.uid, { displayName: nextName });
      } catch (error) {
        if (process.env.ALLOW_DEMO_AUTH === 'false') {
          throw error;
        }
        console.warn('Firebase Auth displayName update skipped:', error);
      }
    }

    const token = signToken({
      sub: user.uid,
      email: user.email,
      name: nextName,
      role: user.role,
    });

    await createSession(token);

    return NextResponse.json(
      {
        message: 'Profil bilgileri güncellendi.',
        token,
        user: {
          id: user.uid,
          email: user.email,
          name: nextName,
          role: user.role,
        },
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: 'Profil güncellenirken bir hata oluştu.' },
      { status: 500 },
    );
  }
}
