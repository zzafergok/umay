import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'E-posta adresi zorunludur' })
    .email({ message: 'Geçerli bir e-posta adresi giriniz' }),
  password: z
    .string()
    .min(1, { message: 'Şifre alanı zorunludur' })
    .min(6, { message: 'Şifre en az 6 karakter olmalıdır' }),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const userSettingsSchema = z.object({
  displayName: z
    .string()
    .min(1, { message: 'Görünen isim zorunludur' })
    .max(50, { message: 'Görünen isim en fazla 50 karakter olabilir' }),
});

export type UserSettingsFormData = z.infer<typeof userSettingsSchema>;

export const profileUpdateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: 'Görünen ad en az 2 karakter olmalıdır' })
    .max(80, { message: 'Görünen ad en fazla 80 karakter olabilir' }),
});

export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;

export const deleteAccountSchema = z.object({
  confirmEmail: z
    .string()
    .trim()
    .min(1, { message: 'Onay için e-posta adresinizi giriniz' })
    .email({ message: 'Geçerli bir e-posta adresi giriniz' }),
});

export function createDeleteAccountSchema(
  expectedEmail: string,
  mismatchMessage = 'Girilen e-posta adresi hesabınızla eşleşmiyor',
) {
  return deleteAccountSchema.refine(
    (data) =>
      data.confirmEmail.trim().toLowerCase() ===
      expectedEmail.trim().toLowerCase(),
    {
      message: mismatchMessage,
      path: ['confirmEmail'],
    },
  );
}

export type DeleteAccountFormData = z.infer<typeof deleteAccountSchema>;
