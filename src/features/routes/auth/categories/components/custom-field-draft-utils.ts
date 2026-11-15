import type { CustomFieldDefinition } from '@/features/inventory/types';
import {
  ensureUniqueFieldKey,
  slugifyFieldKey,
} from '@/features/inventory/utils';
import type { CustomFieldDraft } from '@/features/routes/auth/categories/types';

export function buildFieldDefinitionFromDraft(
  draft: CustomFieldDraft,
  otherKeys: string[],
): { definition?: CustomFieldDefinition; error?: string } {
  const label = draft.label.trim();
  if (!label) {
    return { error: 'Alan adı boş bırakılamaz.' };
  }
  if (draft.type === 'select' && draft.options.length === 0) {
    return { error: 'Açılır liste tipi için en az bir seçenek ekleyin.' };
  }
  if (
    draft.type === 'number' &&
    draft.min !== undefined &&
    draft.max !== undefined &&
    draft.min > draft.max
  ) {
    return { error: 'Minimum değer maksimum değerden büyük olamaz.' };
  }

  const baseKey = slugifyFieldKey(draft.key || label);
  const key = ensureUniqueFieldKey(baseKey, otherKeys);

  const definition: CustomFieldDefinition = {
    key,
    label,
    type: draft.type,
    ...(draft.type === 'number' && draft.unit.trim()
      ? { unit: draft.unit.trim() }
      : {}),
    ...(draft.type === 'number' && draft.min !== undefined
      ? { min: draft.min }
      : {}),
    ...(draft.type === 'number' && draft.max !== undefined
      ? { max: draft.max }
      : {}),
    ...(draft.type === 'select' && draft.options.length > 0
      ? { options: draft.options }
      : {}),
    ...(draft.required ? { required: true } : {}),
    ...(draft.showInSummary ? { showInSummary: true } : {}),
    ...(draft.placeholder.trim()
      ? { placeholder: draft.placeholder.trim() }
      : {}),
    ...(draft.helpText.trim() ? { helpText: draft.helpText.trim() } : {}),
    ...(draft.defaultValue !== undefined && draft.defaultValue !== ''
      ? { defaultValue: draft.defaultValue }
      : {}),
  };

  return { definition };
}
