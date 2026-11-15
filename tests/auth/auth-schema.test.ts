import { describe, expect, it } from 'vitest';
import {
  createDeleteAccountSchema,
  deleteAccountSchema,
  loginSchema,
  profileUpdateSchema,
  userSettingsSchema,
} from '@/lib/auth/auth-schema';

describe('Auth Validation Schemas', () => {
  describe('loginSchema', () => {
    it('should validate valid user credentials', () => {
      const validData = {
        email: 'pilot@umay.space',
        password: 'securePassword123',
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('pilot@umay.space');
      }
    });

    it('should reject invalid email formats', () => {
      const invalidData = {
        email: 'invalid-email-format',
        password: 'password123',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0]?.message).toBe(
          'Geçerli bir e-posta adresi giriniz',
        );
      }
    });

    it('should reject short passwords', () => {
      const invalidData = {
        email: 'user@umay.space',
        password: '123',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0]?.message).toBe(
          'Şifre en az 6 karakter olmalıdır',
        );
      }
    });
  });

  describe('userSettingsSchema', () => {
    it('should validate proper user settings', () => {
      const valid = {
        displayName: 'Umay Pilot',
      };

      const result = userSettingsSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should reject empty display name', () => {
      const invalid = {
        displayName: '',
      };

      const result = userSettingsSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('profileUpdateSchema', () => {
    it('should trim and accept valid display name', () => {
      const result = profileUpdateSchema.safeParse({ name: '  Ayşe Yılmaz  ' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Ayşe Yılmaz');
      }
    });

    it('should reject names shorter than 2 characters', () => {
      const result = profileUpdateSchema.safeParse({ name: 'A' });
      expect(result.success).toBe(false);
    });
  });

  describe('deleteAccountSchema & createDeleteAccountSchema', () => {
    it('should validate email format in deleteAccountSchema', () => {
      expect(
        deleteAccountSchema.safeParse({ confirmEmail: 'ev@umay.app' }).success,
      ).toBe(true);
      expect(
        deleteAccountSchema.safeParse({ confirmEmail: 'bad-email' }).success,
      ).toBe(false);
    });

    it('should enforce case-insensitive email match', () => {
      const schema = createDeleteAccountSchema('Ev@Umay.app');
      expect(schema.safeParse({ confirmEmail: 'ev@umay.app' }).success).toBe(
        true,
      );
      expect(schema.safeParse({ confirmEmail: 'other@umay.app' }).success).toBe(
        false,
      );
    });
  });
});
