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

interface LocationParentOption {
  value: string;
  label: string;
}

interface LocationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  saving: boolean;
  parentOptions: LocationParentOption[];
  onSubmit: (values: LocationInput) => Promise<void>;
}

/** Modal dialog for creating a new inventory location in the room/cabinet hierarchy. */
export function LocationFormDialog({
  open,
  onOpenChange,
  saving,
  parentOptions,
  onSubmit,
}: LocationFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent mobilePresentation="sheet">
        <DialogHeader>
          <DialogTitle>Yeni Konum Ekle</DialogTitle>
        </DialogHeader>
        <Form
          schema={locationInputSchema}
          defaultValues={{ name: '', parentId: null, note: '' }}
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
            Kaydet
          </SubmitButton>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
