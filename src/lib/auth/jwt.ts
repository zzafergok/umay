export interface JWTPayload {
  sub: string;
  email: string;
  name?: string;
  role: 'user' | 'admin';
  iat?: number;
  exp?: number;
}

const JWT_SECRET =
  process.env.JWT_SECRET || 'umay-secret-key-change-in-production';

function base64UrlEncode(str: string): string {
  return btoa(str).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return atob(base64);
}

export function signToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: JWTPayload = {
    ...payload,
    iat: now,
    exp: now + 7 * 24 * 60 * 60, // 7 days expiration
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));

  // Signature simulation
  const signature = base64UrlEncode(
    `${encodedHeader}.${encodedPayload}.${JWT_SECRET}`,
  );

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, signature] = parts;
    const expectedSignature = base64UrlEncode(
      `${encodedHeader}.${encodedPayload}.${JWT_SECRET}`,
    );

    if (signature !== expectedSignature) {
      return null;
    }

    const payload: unknown = JSON.parse(base64UrlDecode(encodedPayload));
    if (typeof payload !== 'object' || payload === null) {
      return null;
    }

    const candidate = payload as Partial<JWTPayload>;
    const now = Math.floor(Date.now() / 1000);

    if (
      typeof candidate.sub !== 'string' ||
      candidate.sub.trim().length === 0 ||
      typeof candidate.email !== 'string' ||
      typeof candidate.exp !== 'number' ||
      candidate.exp <= now
    ) {
      return null; // Invalid or expired token
    }

    return candidate as JWTPayload;
  } catch {
    return null;
  }
}

export function decodeToken(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const parsed: unknown = JSON.parse(base64UrlDecode(parts[1]));
    if (typeof parsed !== 'object' || parsed === null) return null;
    return parsed as JWTPayload;
  } catch {
    return null;
  }
}

export function isTokenExpired(
  token: string,
  nowSeconds = Math.floor(Date.now() / 1000),
): boolean {
  const payload = decodeToken(token);
  if (!payload) return true;
  if (typeof payload.sub !== 'string' || payload.sub.trim().length === 0) {
    return true;
  }
  if (typeof payload.exp !== 'number' || Number.isNaN(payload.exp)) {
    return true;
  }
  return payload.exp <= nowSeconds;
}

export function getTokenRemainingMs(
  token: string,
  nowMs = Date.now(),
): number | null {
  const payload = decodeToken(token);
  if (
    !payload ||
    typeof payload.exp !== 'number' ||
    Number.isNaN(payload.exp)
  ) {
    return null;
  }
  return Math.max(0, payload.exp * 1000 - nowMs);
}
