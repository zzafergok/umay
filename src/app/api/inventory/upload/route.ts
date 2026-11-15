import { NextRequest, NextResponse } from 'next/server';
import { getAdminStorage, isFirebaseConfigured } from '@/lib/firebase/admin';
import { handleRouteError, requireAuth } from '@/lib/api/route-helpers';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]);
const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const formData = await request.formData();
    const fileEntry = formData.get('file');
    if (!(fileEntry instanceof File)) {
      return NextResponse.json(
        { message: 'Yüklenecek dosya bulunamadı.' },
        { status: 400 },
      );
    }

    if (!ALLOWED_MIME_TYPES.has(fileEntry.type)) {
      return NextResponse.json(
        { message: 'Yalnızca JPEG, PNG, WebP veya PDF dosyaları yüklenebilir.' },
        { status: 400 },
      );
    }

    if (fileEntry.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { message: 'Dosya boyutu en fazla 5 MB olabilir.' },
        { status: 400 },
      );
    }

    const ext = fileEntry.type.split('/')[1] || 'bin';
    const safeName = `${crypto.randomUUID()}.${ext}`;
    const objectPath = `users/${auth.uid}/uploads/${safeName}`;
    const buffer = Buffer.from(await fileEntry.arrayBuffer());

    if (!isFirebaseConfigured()) {
      // Local dev fallback without Storage Emulator: return compact data URL for images
      const base64 = buffer.toString('base64');
      return NextResponse.json(
        {
          url: `data:${fileEntry.type};base64,${base64}`,
          name: safeName,
          mimeType: fileEntry.type,
          sizeBytes: fileEntry.size,
        },
        { status: 201 },
      );
    }

    const bucket = getAdminStorage().bucket();
    const fileRef = bucket.file(objectPath);
    await fileRef.save(buffer, {
      contentType: fileEntry.type,
      metadata: {
        metadata: {
          uploadedBy: auth.uid,
        },
      },
    });

    const emulatorHost = process.env.FIREBASE_STORAGE_EMULATOR_HOST;
    const url = emulatorHost
      ? `http://${emulatorHost}/v0/b/${bucket.name}/o/${encodeURIComponent(objectPath)}?alt=media`
      : `https://storage.googleapis.com/${bucket.name}/${objectPath}`;

    return NextResponse.json(
      {
        url,
        name: safeName,
        mimeType: fileEntry.type,
        sizeBytes: fileEntry.size,
      },
      { status: 201 },
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
