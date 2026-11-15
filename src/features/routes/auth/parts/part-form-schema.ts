import { z } from 'zod';
import { parseAmountInput } from '@/lib/utils';

export const partFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Parça adı zorunludur.')
      .max(120, 'Parça adı en fazla 120 karakter olabilir.'),
    parentItemId: z.string().min(1),
    spareItemId: z.string().min(1),
    mode: z.enum(['time', 'usage', 'both']),
    days: z.union([z.string(), z.number()]).optional(),
    usageLimit: z.union([z.string(), z.number()]).optional(),
    usageUnit: z.string().trim().max(32).optional(),
    installedDate: z.string().min(1, 'Takılma tarihi zorunludur.'),
  })
  .superRefine((values, ctx) => {
    if (values.mode === 'time' || values.mode === 'both') {
      if (parseAmountInput(values.days ?? 0) < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['days'],
          message: 'Ömür günü en az 1 olmalıdır.',
        });
      }
    }
    if (values.mode === 'usage' || values.mode === 'both') {
      if (parseAmountInput(values.usageLimit ?? 0) < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['usageLimit'],
          message: 'Kullanım limiti en az 1 olmalıdır.',
        });
      }
    }
  });

export type PartFormValues = z.infer<typeof partFormSchema>;

export const replacePartSchema = z.object({
  dateStr: z.string().min(1, 'Değişim tarihi zorunludur.'),
  cost: z.union([z.string(), z.number()]).optional(),
  note: z.string().trim().max(300, 'Not en fazla 300 karakter olabilir.'),
});

export type ReplacePartValues = z.infer<typeof replacePartSchema>;

export const partUsageSchema = z.object({
  usageCurrent: z
    .union([z.string(), z.number()])
    .refine(
      (value) => parseAmountInput(value) >= 0,
      'Kullanım miktarı negatif olamaz.',
    ),
});

export type PartUsageValues = z.infer<typeof partUsageSchema>;
