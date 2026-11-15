'use client';

import { useState } from 'react';
import { Save } from 'lucide-react';
import { Form, SubmitButton, SwitchField, TextField } from '@/components/forms';
import { toast } from '@/components/core/toast';
import {
  userSettingsSchema,
  type UserSettingsFormData,
} from '@/lib/auth/auth-schema';
import type { AuthSettingsCopy } from '../types';

interface AuthSettingsFormProps {
  copy: AuthSettingsCopy;
}

export function AuthSettingsForm({ copy }: AuthSettingsFormProps) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: UserSettingsFormData) => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      toast.success(`${data.displayName} için ayarlar güncellendi.`);
    } catch {
      toast.error('Ayarlar güncellenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      schema={userSettingsSchema}
      defaultValues={{
        displayName: 'Demo User',
        emailUpdates: true,
      }}
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <TextField
        name="displayName"
        label={copy.displayNameLabel}
        placeholder={copy.displayNamePlaceholder}
        required
      />

      <div className="bg-surface-sunken rounded-md border border-border p-4">
        <SwitchField
          name="emailUpdates"
          label={copy.updatesTitle}
          description={copy.updatesDescription}
        />
      </div>

      <SubmitButton isLoading={loading}>
        <Save className="mr-2 h-4 w-4" aria-hidden="true" />
        {copy.submitLabel}
      </SubmitButton>
    </Form>
  );
}
