import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  decodeToken,
  getTokenRemainingMs,
  isTokenExpired,
  signToken,
  verifyToken,
} from '@/lib/auth/jwt';

describe('JWT Utilities', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('should sign and verify a valid JWT token', () => {
    const payload = {
      sub: 'usr_123',
      email: 'pilot@umay.space',
      name: 'PILOT',
      role: 'user' as const,
    };

    const token = signToken(payload);
    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(3);

    const verified = verifyToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.sub).toBe('usr_123');
    expect(verified?.email).toBe('pilot@umay.space');
    expect(verified?.role).toBe('user');
  });

  it('should decode token payload without secret verification', () => {
    const payload = {
      sub: 'adm_999',
      email: 'admin@umay.space',
      name: 'ADMIN',
      role: 'admin' as const,
    };

    const token = signToken(payload);
    const decoded = decodeToken(token);

    expect(decoded).not.toBeNull();
    expect(decoded?.sub).toBe('adm_999');
    expect(decoded?.role).toBe('admin');
  });

  it('should reject tampered tokens', () => {
    const payload = {
      sub: 'usr_123',
      email: 'pilot@umay.space',
      name: 'PILOT',
      role: 'user' as const,
    };

    const token = signToken(payload);
    const parts = token.split('.');
    // Tamper with payload part
    const tamperedToken = `${parts[0]}.eyJyZWFsbHkiOiJmYWtlIn0.${parts[2]}`;

    const verified = verifyToken(tamperedToken);
    expect(verified).toBeNull();
  });

  it('should return null for malformed tokens', () => {
    expect(verifyToken('invalid-token')).toBeNull();
    expect(verifyToken('a.b')).toBeNull();
    expect(decodeToken('invalid-token')).toBeNull();
    expect(isTokenExpired('invalid-token')).toBe(true);
    expect(getTokenRemainingMs('invalid-token')).toBeNull();
  });

  it('should reject expired tokens in verifyToken and isTokenExpired', () => {
    const eightDaysAgoMs = Date.now() - 8 * 24 * 60 * 60 * 1000;
    vi.spyOn(Date, 'now').mockReturnValueOnce(eightDaysAgoMs);

    const expiredToken = signToken({
      sub: 'usr_expired',
      email: 'expired@umay.app',
      name: 'Expired',
      role: 'user',
    });

    expect(verifyToken(expiredToken)).toBeNull();
    expect(isTokenExpired(expiredToken)).toBe(true);
    expect(getTokenRemainingMs(expiredToken)).toBe(0);
  });

  it('should report active tokens as non-expired with remaining ms', () => {
    const token = signToken({
      sub: 'usr_active',
      email: 'active@umay.app',
      name: 'Active',
      role: 'user',
    });

    expect(isTokenExpired(token)).toBe(false);
    const remaining = getTokenRemainingMs(token);
    expect(remaining).not.toBeNull();
    expect((remaining ?? 0) > 0).toBe(true);
  });

  it('should support UTF-8 characters in payload claims', () => {
    const token = signToken({
      sub: 'usr_tr',
      email: 'cagla@umay.app',
      name: 'Çağla Şahin Öztürk',
      role: 'user',
    });

    const verified = verifyToken(token);
    expect(verified?.name).toBe('Çağla Şahin Öztürk');
    expect(decodeToken(token)?.name).toBe('Çağla Şahin Öztürk');
  });

  it('should reject alg=none and forged non-HMAC signatures', () => {
    const algNoneHeader = Buffer.from(
      JSON.stringify({ alg: 'none', typ: 'JWT' }),
      'utf8',
    ).toString('base64url');
    const payloadPart = Buffer.from(
      JSON.stringify({
        sub: 'usr_1',
        email: 'a@umay.app',
        role: 'admin',
        exp: Math.floor(Date.now() / 1000) + 3600,
      }),
      'utf8',
    ).toString('base64url');

    expect(verifyToken(`${algNoneHeader}.${payloadPart}.`)).toBeNull();

    const forgedPlainSig = Buffer.from(
      `${algNoneHeader}.${payloadPart}.umay-dev-only-jwt-secret-do-not-use-in-prod`,
      'utf8',
    ).toString('base64url');
    expect(
      verifyToken(`${algNoneHeader}.${payloadPart}.${forgedPlainSig}`),
    ).toBeNull();
  });

  it('should fail closed in production when JWT_SECRET is missing', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('JWT_SECRET', '');

    expect(() =>
      signToken({
        sub: 'usr_prod',
        email: 'prod@umay.app',
        role: 'user',
      }),
    ).toThrow(/JWT_SECRET/);

    expect(verifyToken('a.b.c')).toBeNull();
  });
});
