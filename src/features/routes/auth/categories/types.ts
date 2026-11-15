import { z } from 'zod';
import {
  categoryDefaultItemConfigSchema,
  customFieldDefinitionSchema,
  type CategoryInput,
} from '@/features/inventory/schemas';
import type {
  Category,
  CategoryDefaultItemConfig,
  CustomFieldDefinition,
  CustomFieldType,
  CustomFieldValue,
} from '@/features/inventory/types';

export const categoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Kategori adı zorunludur.')
    .max(60, 'Kategori adı en fazla 60 karakter olabilir.'),
  description: z
    .string()
    .trim()
    .max(240, 'Açıklama en fazla 240 karakter olabilir.')
    .optional(),
  colorToken: z.string().trim().min(1).max(40),
  icon: z.string().trim().min(1).max(40),
  customFields: z.array(customFieldDefinitionSchema).max(20),
  itemDefaults: categoryDefaultItemConfigSchema.optional(),
});

export const DEFAULT_CATEGORY_ITEM_CONFIG: CategoryDefaultItemConfig = {
  defaultType: 'consumable',
  defaultUnit: 'adet',
  defaultMinQuantity: 1,
  trackBrandModel: true,
  trackSerialNumber: false,
  trackPurchase: false,
  trackWarranty: false,
  trackExpiry: false,
};

export function buildCategoryInitialValues(
  state: CategoryDialogState,
): CategoryInput {
  const cat = state.category;
  if (!cat) {
    return {
      name: '',
      description: '',
      colorToken: 'umay-blue',
      icon: 'boxes',
      customFields: [],
      itemDefaults: DEFAULT_CATEGORY_ITEM_CONFIG,
    };
  }
  return {
    name: state.mode === 'duplicate' ? `${cat.name} (Kopya)` : cat.name,
    description: cat.description ?? '',
    colorToken: cat.colorToken || 'umay-blue',
    icon: cat.icon || 'boxes',
    customFields: cat.customFields ?? [],
    itemDefaults: cat.itemDefaults ?? DEFAULT_CATEGORY_ITEM_CONFIG,
  };
}

export type CategoryDialogMode = 'create' | 'edit' | 'duplicate';

export interface CategoryDialogState {
  open: boolean;
  mode: CategoryDialogMode;
  category?: Category;
}

export interface CustomFieldDraft {
  label: string;
  key: string;
  keyEditedManually: boolean;
  type: CustomFieldType;
  unit: string;
  options: string[];
  optionInput: string;
  required: boolean;
  placeholder: string;
  helpText: string;
  defaultValue?: CustomFieldValue;
  min?: number;
  max?: number;
  showInSummary: boolean;
}

export function createEmptyFieldDraft(): CustomFieldDraft {
  return {
    label: '',
    key: '',
    keyEditedManually: false,
    type: 'text',
    unit: '',
    options: [],
    optionInput: '',
    required: false,
    placeholder: '',
    helpText: '',
    defaultValue: undefined,
    min: undefined,
    max: undefined,
    showInSummary: false,
  };
}

export function draftFromFieldDefinition(
  field: CustomFieldDefinition,
): CustomFieldDraft {
  return {
    label: field.label,
    key: field.key,
    keyEditedManually: true,
    type: field.type,
    unit: field.unit ?? '',
    options: field.options ?? [],
    optionInput: '',
    required: Boolean(field.required),
    placeholder: field.placeholder ?? '',
    helpText: field.helpText ?? '',
    defaultValue: field.defaultValue,
    min: field.min,
    max: field.max,
    showInSummary: Boolean(field.showInSummary),
  };
}
