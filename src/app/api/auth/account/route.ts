import { NextRequest, NextResponse } from 'next/server';
import { deleteAccountSchema } from '@/lib/auth/auth-schema';
import { getAuthenticatedUser } from '@/lib/auth/request-user';
import { destroySession } from '@/lib/auth/session';
import { getAdminAuth, isFirebaseConfigured } from '@/lib/firebase/admin';
import { deleteAllUserData } from '@/lib/inventory/repo';

function isUserNotFoundError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'auth/user-not-found'
  );
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { message: 'Yetkisiz erişim: Oturum bulunamadı.' },
        { status: 401 },
      );
    }

    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json(
        { message: 'Onay için e-posta adresinizi giriniz.' },
        { status: 400 },
      );
    }

    const parsed = deleteAccountSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        {
          message:
            parsed.error.errors[0]?.message ?? 'Geçersiz hesap silme onayı.',
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    if (
      parsed.data.confirmEmail.trim().toLowerCase() !==
      user.email.trim().toLowerCase()
    ) {
      return NextResponse.json(
        { message: 'Girilen e-posta adresi hesabınızla eşleşmiyor.' },
        { status: 400 },
      );
    }

    await deleteAllUserData(user.uid);

    if (isFirebaseConfigured() && !user.uid.startsWith('demo_')) {
      try {
        await getAdminAuth().deleteUser(user.uid);
      } catch (error) {
        if (!isUserNotFoundError(error)) {
          if (process.env.ALLOW_DEMO_AUTH === 'false') {
            throw error;
          }
          console.warn('Firebase Auth deleteUser skipped in demo mode:', error);
        }
      }
    }

    await destroySession();

    return NextResponse.json(
      { message: 'Hesabınız ve tüm verileriniz kalıcı olarak silindi.' },
      { status: 200 },
    );
  } catch (error) {
    console.error('Account deletion failed:', error);
    return NextResponse.json(
      { message: 'Hesap silinirken bir hata oluştu.' },
      { status: 500 },
    );
  }
}
