import { beforeEach, describe, expect, it } from 'vitest';
import {
  categoryInputSchema,
  customFieldDefinitionSchema,
  itemInputSchema,
} from '@/features/inventory/schemas';
import type { CustomFieldDefinition } from '@/features/inventory/types';
import {
  buildDefaultCustomFieldValues,
  ensureUniqueFieldKey,
  formatCustomFieldBadge,
  formatCustomFieldValue,
  slugifyFieldKey,
  validateCustomFieldValues,
} from '@/features/inventory/utils';
import { clearMemoryStore } from '@/lib/inventory/memory-store';
import { createCategory, listCategories, updateCategory } from '@/lib/inventory/repo';

describe('advanced categories & custom fields', () => {
  beforeEach(() => {
    clearMemoryStore();
  });

  it('slugifies Turkish labels and ensures unique field keys', () => {
    expect(slugifyFieldKey('Güç Kapasitesi (W)')).toBe('guc_kapasitesi_w');
    expect(slugifyFieldKey('Şarj Türü / Örgü')).toBe('sarj_turu_orgu');
    expect(slugifyFieldKey('İşletim Sistemi')).toBe('isletim_sistemi');

    expect(ensureUniqueFieldKey('uzunluk', ['tip', 'voltaj'])).toBe('uzunluk');
    expect(ensureUniqueFieldKey('uzunluk', ['uzunluk', 'uzunluk_2'])).toBe(
      'uzunluk_3',
    );
  });

  it('validates extended custom field types and min/max constraints in Zod', () => {
    const valid = customFieldDefinitionSchema.safeParse({
      key: 'uzunluk',
      label: 'Kablo Uzunluğu',
      type: 'number',
      unit: 'm',
      min: 0.5,
      max: 10,
      required: true,
      showInSummary: true,
    });
    expect(valid.success).toBe(true);

    const invalidBounds = customFieldDefinitionSchema.safeParse({
      key: 'uzunluk',
      label: 'Kablo Uzunluğu',
      type: 'number',
      min: 20,
      max: 5,
    });
    expect(invalidBounds.success).toBe(false);

    const validCategory = categoryInputSchema.safeParse({
      name: 'Kablo & Aksesuar',
      description: 'Tüm bağlantı kabloları',
      colorToken: 'cat-8',
      icon: 'cable',
      itemDefaults: {
        defaultType: 'component',
        defaultUnit: 'adet',
        defaultMinQuantity: 2,
        trackBrandModel: true,
        trackWarranty: false,
      },
      customFields: [
        {
          key: 'orgulu_mu',
          label: 'Örgülü Kablo',
          type: 'boolean',
          defaultValue: false,
        },
        {
          key: 'kilavuz',
          label: 'Kılavuz Linki',
          type: 'url',
        },
      ],
    });
    expect(validCategory.success).toBe(true);

    const validItemWithBool = itemInputSchema.safeParse({
      name: 'Anker USB-C',
      categoryId: 'cat_1',
      locationId: 'loc_1',
      quantity: 1,
      customFieldValues: {
        orgulu_mu: true,
        uzunluk: 2,
        konnektor: 'USB-C',
      },
    });
    expect(validItemWithBool.success).toBe(true);
  });

  it('validates required, number range, and url custom field values', () => {
    const fields: CustomFieldDefinition[] = [
      { key: 'konnektor', label: 'Konnektör', type: 'select', options: ['USB-C', 'HDMI'], required: true },
      { key: 'uzunluk', label: 'Uzunluk', type: 'number', unit: 'm', min: 0.5, max: 10 },
      { key: 'kilavuz', label: 'Kılavuz', type: 'url' },
      { key: 'orgulu', label: 'Örgülü', type: 'boolean', defaultValue: true },
    ];

    const defaults = buildDefaultCustomFieldValues(fields);
    expect(defaults).toEqual({ orgulu: true });

    const errors = validateCustomFieldValues(fields, {
      uzunluk: 25,
      kilavuz: 'not-a-url',
    });
    expect(errors.konnektor).toMatch(/zorunludur/);
    expect(errors.uzunluk).toMatch(/en fazla 10/);
    expect(errors.kilavuz).toMatch(/URL/);

    const cleanErrors = validateCustomFieldValues(fields, {
      konnektor: 'USB-C',
      uzunluk: 2,
      kilavuz: 'https://example.com/spec',
      orgulu: false,
    });
    expect(cleanErrors).toEqual({});
  });

  it('formats custom field badges and values cleanly', () => {
    const numField: CustomFieldDefinition = {
      key: 'uzunluk',
      label: 'Uzunluk',
      type: 'number',
      unit: 'm',
    };
    const boolField: CustomFieldDefinition = {
      key: 'orgulu',
      label: 'Örgülü',
      type: 'boolean',
    };
    const selectField: CustomFieldDefinition = {
      key: 'tip',
      label: 'Tip',
      type: 'select',
      options: ['A', 'B', 'C'],
    };

    expect(formatCustomFieldBadge(numField)).toBe('Sayı · m');
    expect(formatCustomFieldBadge(selectField)).toBe('Liste (3)');
    expect(formatCustomFieldValue(numField, 1.5)).toBe('1.5 m');
    expect(formatCustomFieldValue(boolField, true)).toBe('Evet');
    expect(formatCustomFieldValue(boolField, false)).toBe('Hayır');
  });

  it('creates and updates categories with itemDefaults and nested fields without undefined keys', async () => {
    const uid = 'uid_cat_test';
    const created = await createCategory(uid, {
      name: 'Elektronik',
      description: undefined,
      colorToken: 'cat-4',
      icon: 'cpu',
      itemDefaults: {
        defaultType: 'durable',
        defaultUnit: 'adet',
        defaultMinQuantity: 1,
        trackSerialNumber: true,
        trackWarranty: true,
        trackExpiry: undefined,
      },
      customFields: [
        {
          key: 'voltaj',
          label: 'Voltaj',
          type: 'number',
          unit: 'V',
          placeholder: undefined,
        },
      ],
    });

    expect(created.id).toMatch(/^cat_/);
    expect('description' in created).toBe(false);
    expect('placeholder' in created.customFields[0]!).toBe(false);
    expect(created.itemDefaults?.trackSerialNumber).toBe(true);

    const updated = await updateCategory(uid, created.id, {
      name: 'Elektronik & Cihazlar',
      description: 'Ev elektronikleri',
    });
    expect(updated.name).toBe('Elektronik & Cihazlar');
    expect(updated.description).toBe('Ev elektronikleri');
    expect(updated.customFields).toHaveLength(1);

    const listed = await listCategories(uid);
    expect(listed).toHaveLength(1);
    expect(listed[0]?.name).toBe('Elektronik & Cihazlar');
  });
});
