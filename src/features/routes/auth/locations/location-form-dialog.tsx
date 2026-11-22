'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/core/dialog';
import { Form, SelectField, SubmitButton, TextField } from '@/components/forms';
import {
  locationInputSchema,
  type LocationInput,
} from '@/features/inventory/schemas';
import type { Location } from '@/features/inventory/types';

interface LocationParentOption {
  value: string;
  label: string;
}

interface LocationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  saving: boolean;
  editingLocation?: Location | null;
  parentOptions: LocationParentOption[];
  onSubmit: (values: LocationInput) => Promise<void>;
}

/** Modal dialog for creating or editing an inventory location in the room/cabinet hierarchy. */
export function LocationFormDialog({
  open,
  onOpenChange,
  saving,
  editingLocation,
  parentOptions,
  onSubmit,
}: LocationFormDialogProps) {
  const isEditing = Boolean(editingLocation);
  const defaultValues: LocationInput = editingLocation
    ? {
        name: editingLocation.name,
        parentId: editingLocation.parentId ?? '__none__',
        note: editingLocation.note ?? '',
      }
    : {
        name: '',
        parentId: '__none__',
        note: '',
      };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent mobilePresentation="sheet">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Konumu Düzenle' : 'Yeni Konum Ekle'}
          </DialogTitle>
        </DialogHeader>
        <Form
          key={editingLocation?.id ?? 'new'}
          schema={locationInputSchema}
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          className="space-y-4"
        >
          <TextField
            name="name"
            label="Konum Adı"
            placeholder="Örn. Üst Dolap 2"
            required
          />
          <SelectField
            name="parentId"
            label="Üst Konum"
            options={parentOptions}
            triggerClassName="w-full [&>span]:truncate"
          />
          <TextField
            name="note"
            label="Not (Opsiyonel)"
            placeholder="Örn. Baharatlar ve kuru bakliyat"
          />
          <SubmitButton isLoading={saving} fullWidth>
            {isEditing ? 'Değişiklikleri Kaydet' : 'Kaydet'}
          </SubmitButton>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
