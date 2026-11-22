'use client';

import * as React from 'react';
import { DeleteConfirmationDialog } from '@/components/shared/delete-confirmation-dialog';
import type { CustomFieldDefinition } from '@/features/inventory/types';
import { ensureUniqueFieldKey } from '@/features/inventory/utils';
import {
  createEmptyFieldDraft,
  draftFromFieldDefinition,
  type CustomFieldDraft,
} from '@/features/routes/auth/categories/types';
import { CustomFieldDraftForm } from './custom-field-draft-form';
import { CustomFieldListItem } from './custom-field-list-item';

interface CategoryCustomFieldsTabProps {
  fields: CustomFieldDefinition[];
  onChange: (next: CustomFieldDefinition[]) => void;
}

export function CategoryCustomFieldsTab({
  fields,
  onChange,
}: CategoryCustomFieldsTabProps) {
  const [draft, setDraft] = React.useState<CustomFieldDraft>(
    createEmptyFieldDraft,
  );
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null);
  const [deleteIndex, setDeleteIndex] = React.useState<number | null>(null);
  const deleteTarget = deleteIndex !== null ? fields[deleteIndex] : undefined;

  const handleSubmitField = (definition: CustomFieldDefinition) => {
    if (editingIndex !== null) {
      onChange(
        fields.map((item, idx) => (idx === editingIndex ? definition : item)),
      );
      setEditingIndex(null);
    } else {
      onChange([...fields, definition]);
    }
    setDraft(createEmptyFieldDraft());
  };

  const handleEdit = (index: number) => {
    const target = fields[index];
    if (!target) return;
    setEditingIndex(index);
    setDraft(draftFromFieldDefinition(target));
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setDraft(createEmptyFieldDraft());
  };

  const handleMove = (index: number, delta: -1 | 1) => {
    const targetIndex = index + delta;
    if (targetIndex < 0 || targetIndex >= fields.length) return;
    const copy = [...fields];
    const [moved] = copy.splice(index, 1);
    if (!moved) return;
    copy.splice(targetIndex, 0, moved);
    onChange(copy);
    if (editingIndex === index) {
      setEditingIndex(targetIndex);
    }
  };

  const handleDuplicate = (index: number) => {
    const source = fields[index];
    if (!source) return;
    const existingKeys = fields.map((f) => f.key);
    const copy: CustomFieldDefinition = {
      ...source,
      key: ensureUniqueFieldKey(`${source.key}_kopya`, existingKeys),
      label: `${source.label} (Kopya)`,
    };
    const next = [...fields];
    next.splice(index + 1, 0, copy);
    onChange(next);
  };

  const handleRemove = (index: number) => {
    onChange(fields.filter((_, idx) => idx !== index));
    if (editingIndex === index) {
      handleCancelEdit();
    } else if (editingIndex !== null && editingIndex > index) {
      setEditingIndex(editingIndex - 1);
    }
  };

  return (
    <div className="space-y-4">
      <CustomFieldDraftForm
        draft={draft}
        onChange={setDraft}
        existingFields={fields}
        editingIndex={editingIndex}
        onSubmitField={handleSubmitField}
        onCancelEdit={handleCancelEdit}
      />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="font-mono text-2xs uppercase tracking-wider text-ash">
            Tanımlı Özel Alanlar ({fields.length}/20)
          </p>
        </div>
        {fields.length === 0 ? (
          <p className="rounded-md border border-dashed border-border p-4 text-center text-xs text-text-muted">
            Henüz özel alan yok. Yukarıdan metin, sayı+birim, seçim listesi,
            tarih, anahtar veya URL alanı ekleyebilirsiniz.
          </p>
        ) : (
          <div className="space-y-2">
            {fields.map((field, index) => (
              <CustomFieldListItem
                key={field.key}
                field={field}
                index={index}
                total={fields.length}
                isEditing={editingIndex === index}
                onMoveUp={() => handleMove(index, -1)}
                onMoveDown={() => handleMove(index, 1)}
                onEdit={() => handleEdit(index)}
                onDuplicate={() => handleDuplicate(index)}
                onRemove={() => setDeleteIndex(index)}
              />
            ))}
          </div>
        )}
      </div>

      <DeleteConfirmationDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteIndex(null);
        }}
        entityLabel="Özel Alan"
        itemName={deleteTarget?.label ?? ''}
        details={
          deleteTarget
            ? [
                { label: 'Alan Anahtarı', value: deleteTarget.key },
                { label: 'Alan Tipi', value: deleteTarget.type },
              ]
            : undefined
        }
        onConfirm={() => {
          if (deleteIndex === null) return;
          handleRemove(deleteIndex);
          setDeleteIndex(null);
        }}
      />
    </div>
  );
}
