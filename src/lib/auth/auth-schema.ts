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
  emailUpdates: z.boolean().default(true),
});

export type UserSettingsFormData = z.infer<typeof userSettingsSchema>;
